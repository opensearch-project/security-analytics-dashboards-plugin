import Ajv, { ErrorObject } from 'ajv';
import { FormikErrors } from 'formik';

const ajv = new Ajv({ allErrors: true, strict: false });
const validatorCache = new WeakMap<object, ReturnType<typeof ajv.compile>>();

function getValidator(schema: object) {
  if (!validatorCache.has(schema)) validatorCache.set(schema, ajv.compile(schema));
  return validatorCache.get(schema)!;
}

// Showing these top level errors adds noise without helping the user fix anything.
const SKIP_KEYWORDS = new Set(['oneOf', 'anyOf', 'allOf', 'if', 'then', 'else']);

function instancePathToKey(instancePath: string): string {
  if (!instancePath) return 'root';
  return instancePath
    .replace(/^\//, '')
    .split('/')
    .map(seg => {
      const decoded = seg.replace(/~1/g, '/').replace(/~0/g, '~');
      return /^\d+$/.test(decoded) ? `[${decoded}]` : decoded;
    })
    .join('.')
    .replace(/\.\[/g, '[');
}

function fieldPath(error: ErrorObject): string {
  const raw = instancePathToKey(error.instancePath);

  // These keywords report at the *parent* object level. The specific field is in params.
  switch (error.keyword) {
    case 'required':
      return join(raw, error.params?.missingProperty as string);
    case 'additionalProperties':
      return join(raw, error.params?.additionalProperty as string);
    case 'propertyNames':
      return join(raw, error.params?.propertyName as string);
    case 'dependencies':
    case 'dependentRequired':
      return join(raw, error.params?.missingProperty as string);
    default:
      return raw || 'root';
  }
}

function join(parent: string, field: string): string {
  // 'root' means instancePath was empty (root object level); don't prepend it.
  return parent && parent !== 'root' ? `${parent}.${field}` : field;
}

const MAX_LABEL_LENGTH = 60;

function humanLabel(path: string): string {
  if (path === 'root') return 'value';
  const display = path.length > MAX_LABEL_LENGTH ? path.slice(0, MAX_LABEL_LENGTH - 3) + '...' : path;
  return `'${display}'`;
}

function buildMessage(error: ErrorObject): string | null {
  if (SKIP_KEYWORDS.has(error.keyword)) return null;

  const path = fieldPath(error);
  const label = humanLabel(path);

  switch (error.keyword) {
    case 'required':
      return `${label} is required`;
    case 'additionalProperties':
      return `${label} is not a recognized field`;
    case 'propertyNames':
      return `${label} is not a valid property name`;
    case 'dependencies':
    case 'dependentRequired': {
      const raw = instancePathToKey(error.instancePath);
      const triggerLabel = humanLabel(join(raw, error.params?.property as string));
      return `${label} is required when ${triggerLabel} is present`;
    }
  }

  const msg = error.message ?? 'is invalid';
  return `${label} ${msg}`;
}

// Resolve a $ref within the root schema.
function resolveRef(rootSchema: any, ref: string): any {
  if (!ref?.startsWith('#/')) return null;
  return ref.slice(2).split('/').reduce((node: any, part: string) => node?.[part], rootSchema);
}

// Follow a chain of $ref until a concrete schema is reached (safe cycle).
function derefSchema(node: any, rootSchema: any): any {
  const seen = new Set<string>();
  let current = node;
  while (current?.$ref) {
    if (seen.has(current.$ref)) break;
    seen.add(current.$ref);
    current = resolveRef(rootSchema, current.$ref);
  }
  return current;
}

/**
 * Collect all branches from every combiner (oneOf, anyOf, allOf) present on a node.
 * A node can have multiple combiners simultaneously (e.g. allOf for constraints + oneOf for variants).
 */
function collectBranches(node: any): any[] {
  return [
    ...(node.oneOf ?? []),
    ...(node.anyOf ?? []),
    ...(node.allOf ?? []),
  ];
}

/**
 * Look up a property or patternProperty key inside a schema node, recursing into
 * any combiner branches as needed. Returns the sub schema or null if not found.
 */
function findPropertySchema(node: any, seg: string, rootSchema: any): any | null {
  if (!node) return null;

  // Direct property
  if (node.properties?.[seg] !== undefined) return node.properties[seg];

  // Pattern property
  const patternMatch = Object.entries<any>(node.patternProperties ?? {}).find(([pattern]) => {
    try { return new RegExp(pattern).test(seg); } catch { return false; }
  });
  if (patternMatch) return patternMatch[1];

  // Recurse into all combiner branches
  const branches = collectBranches(node);
  for (const branch of branches) {
    const resolved = derefSchema(branch, rootSchema);
    if (!resolved) continue;
    const found = findPropertySchema(resolved, seg, rootSchema);
    if (found !== null) return found;
  }

  return null;
}

/**
 * Navigate the root schema following an instance path (e.g. "/normalize/0")
 * and return the sub schema that validates the value at that path.
 */
function schemaAtInstancePath(rootSchema: any, instancePath: string): any {
  const segments = instancePath.replace(/^\//, '').split('/').filter(Boolean);
  let node: any = rootSchema;

  for (const seg of segments) {
    node = derefSchema(node, rootSchema);
    if (!node) return null;

    if (/^\d+$/.test(seg)) {
      node = node.items ?? null;
    } else {
      const found = findPropertySchema(node, seg, rootSchema);
      if (found !== null) {
        node = found;
        continue;
      }
      // additionalProperties fallback
      node = typeof node.additionalProperties === 'object' ? node.additionalProperties : null;
    }
  }

  return derefSchema(node, rootSchema);
}

/**
 * Describe one branch of a oneOf/anyOf in human readable form using only
 * information that is generically present in a JSON Schema branch:
 * required named properties and patternProperties keys
 */
function describeBranch(rawBranch: any, rootSchema: any): string {
  const branch = derefSchema(rawBranch, rootSchema);
  if (!branch) return '';

  const required: string[] = branch.required ?? [];
  const patternKeys = Object.keys(branch.patternProperties ?? {});
  const minProps: number = branch.minProperties ?? 0;

  // Include pattern keys only when minProperties forces at least one to be present.
  const mandatoryPatternCount = Math.max(0, minProps - required.length);
  const shownPatternKeys = patternKeys.length > 0 && mandatoryPatternCount > 0 ? patternKeys : [];

  const parts = [...required, ...shownPatternKeys];
  if (parts.length > 0) return parts.join(' + ');

  // Non, object branch (e.g. a string/array type constraint), use description or type.
  if (branch.description && typeof branch.description === 'string') return branch.description;
  if (branch.type) return Array.isArray(branch.type) ? branch.type.join(' | ') : branch.type;
  return '';
}

/** Build a human readable message for a oneOf/anyOf failure at the given path. */
function buildOneOfMessage(rootSchema: any, instancePath: string, key: string): string {
  const label = humanLabel(key);
  const node = schemaAtInstancePath(rootSchema, instancePath);

  // Use the errorMessage keyword if present
  if (node?.errorMessage && typeof node.errorMessage === 'string') {
    return `${label}: ${node.errorMessage}`;
  }

  // Fall back to the schema description when available.
  if (node?.description && typeof node.description === 'string') {
    return `${label}: ${node.description}`;
  }

  // Last resort: auto generate a list of valid branch shapes.
  const branches: any[] = node?.oneOf ?? node?.anyOf ?? [];
  if (branches.length === 0) {
    return `${label} does not match any valid format`;
  }

  const options = branches
    .map((b, i) => `(${i + 1}) ${describeBranch(b, rootSchema)}`)
    .filter(Boolean)
    .join(', ');

  return `${label} must match one of the valid formats: ${options}`;
}

interface ValidateOptions {
  skipRequired?: string[];
}

export function validateWithJsonSchema<T extends object>(
  schema: object,
  data: T,
  options?: ValidateOptions
): FormikErrors<T> {
  const validate = getValidator(schema);
  if (validate(data)) return {};

  const skipRequired = new Set(options?.skipRequired ?? []);
  const allErrors = validate.errors ?? [];

  // Instance paths where a oneOf/anyOf combiner failed.
  const combinerPaths = new Set<string>(
    allErrors
      .filter(e => e.keyword === 'oneOf' || e.keyword === 'anyOf')
      .map(e => e.instancePath)
  );

  const result: Record<string, string> = {};

  // When a path P has a oneOf/anyOf failure AND no child errors (no errors at
  // paths starting with P + '/'), the data at P doesn't resemble any branch at
  // all. We emit a single "valid formats" message derived from the schema.
  // When child errors DO exist, at least one branch accepted the top level
  // structure and validation went deeper.
  for (const path of Array.from(combinerPaths)) {
    const childPrefix = path === '' ? '/' : path + '/';
    const hasChildErrors = allErrors.some(e => e.instancePath.startsWith(childPrefix));
    if (hasChildErrors) continue;

    const key = instancePathToKey(path);
    if (!result[key]) {
      result[key] = buildOneOfMessage(schema as any, path, key);
    }
  }

  // Process individual errors
  // Errors whose instancePath sits directly on a combinerPath are noise
  // (they are replaced by the synthesized message or by deeper child errors).
  // Everything else is a genuine constraint and is shown directly.
  for (const error of allErrors) {
    if (error.keyword === 'oneOf' || error.keyword === 'anyOf') continue;
    if (SKIP_KEYWORDS.has(error.keyword)) continue;
    if (combinerPaths.has(error.instancePath)) continue; // branch-level noise
    if (error.keyword === 'required' && skipRequired.has(error.params?.missingProperty as string)) continue;

    const msg = buildMessage(error);
    if (!msg) continue;

    const key = fieldPath(error);
    if (!result[key]) result[key] = msg;
  }

  // Drop parent level keys when more specific child keys exist to avoid redundant messages
  const keys = Object.keys(result);
  return Object.fromEntries(
    Object.entries(result).filter(
      ([key]) => !keys.some(other => other !== key && (other.startsWith(key + '.') || other.startsWith(key + '[')))
    )
  ) as FormikErrors<T>;
}

