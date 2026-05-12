import YAML, { Pair, Scalar, YAMLMap, YAMLSeq } from 'yaml';
import { LosslessNumber } from 'lossless-json';

/**
 * Converts a raw user input string into a YAML AST node with proper type metadata.
 * Preserves float/int/bool/null representations that would otherwise be lost when
 * passing through JS native types (e.g. "5.0" to !!float 5.0, not int 5).
 * JSON objects/arrays are parsed as YAML (JSON is valid YAML) and forced to block style.
 */
export const stringToYamlNode = (rawValue: string): Scalar | YAMLMap | YAMLSeq => {
  const trimmed = rawValue.trim();
  if (trimmed && (trimmed[0] === '{' || trimmed[0] === '[')) {
    try {
      const parsed = YAML.parseDocument(trimmed);
      if (!parsed.errors.length && parsed.contents) {
        const node = parsed.contents as YAMLMap | YAMLSeq;
        YAML.visit(node, {
          Map(_, n) {
            n.flow = false;
          },
          Seq(_, n) {
            n.flow = false;
          },
          Pair(_, n) {
            if (
              n.key instanceof Scalar &&
              (n.key.type === 'QUOTE_DOUBLE' || n.key.type === 'QUOTE_SINGLE')
            ) {
              n.key.type = null;
            }
          },
        });
        return node;
      }
    } catch {
      // not valid YAML
    }
  }
  try {
    return (YAML.parseDocument(trimmed).contents ?? new Scalar(trimmed)) as
      | Scalar
      | YAMLMap
      | YAMLSeq;
  } catch {
    return new Scalar(trimmed);
  }
};

export const mapYamlToLosslessObject = <T>(yamlString: string): T => {
  const yamlObject = YAML.parseDocument(yamlString);

  YAML.visit(yamlObject, {
    Scalar(_, node) {
      if (typeof node.value === 'number') {
        let rawText;

        if (node.range && node.range.length >= 2) {
          rawText = yamlString.slice(node.range[0], node.range[1]).trim();
        }

        if (!rawText) {
          rawText = String(node.value);
          if (!rawText.includes('.')) rawText += '.0';
        }

        node.value = new LosslessNumber(rawText);
      }
    },
  });

  return yamlObject.toJS() as T;
};

/**
 * Normalizes metadata string arrays from lossless-parsed YAML.
 * Handles: undefined → [], bare string → [string], and converts any
 * LosslessNumber or other non-string items to their string representation.
 */
export const normalizeToStringArray = (value: unknown[] | string | undefined): string[] => {
  if (!value) return [];
  const arr = Array.isArray(value) ? value : [value];
  return arr.map((item) => {
    if (typeof item === 'string') return item;
    if (item instanceof LosslessNumber) return item.toString();
    return String(item ?? '');
  });
};

export const validateYamlSyntax = (yaml: string): string | null => {
  try {
    YAML.parse(yaml);
    return null;
  } catch (e) {
    return e instanceof Error ? e.message.split('\n')[0] : 'Invalid YAML syntax';
  }
};
