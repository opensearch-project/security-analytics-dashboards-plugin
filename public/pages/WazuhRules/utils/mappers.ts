/*
 * Copyright Wazuh Inc.
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { dump, load } from 'js-yaml';
import { Rule } from '../../../../types';

function safeLoad(yamlStr: string | undefined): any {
  if (!yamlStr || (typeof yamlStr === 'string' && !yamlStr.trim())) return undefined;
  if (typeof yamlStr !== 'string') return yamlStr;
  try {
    return load(yamlStr);
  } catch {
    return undefined;
  }
}

function safeDump(obj: any): string {
  if (!obj) return '';
  if (typeof obj === 'string') return obj;
  try {
    return dump(obj);
  } catch {
    return '';
  }
}

export const mapYamlObjectToYamlString = (yamlObject: any): string => {
  try {
    if (!yamlObject.detection) {
      const { detection, ...rest } = yamlObject;
      return dump(rest);
    }
    return dump(yamlObject);
  } catch (error: any) {
    console.warn('Security Analytics - Rule Editor - Yaml dump', error);
    return '';
  }
};

export const mapRuleToYamlObject = (rule: Rule): any => {
  const detection = safeLoad(rule.detection);
  const mitre = safeLoad(rule.mitre);
  const compliance = safeLoad(rule.compliance);

  const metadata: Record<string, any> = {
    title: rule.metadata?.title || rule.title || '',
    author: rule.metadata?.author || rule.author || '',
    description: rule.metadata?.description || rule.description || '',
    references: rule.metadata?.references?.length
      ? rule.metadata.references
      : rule.references?.length
      ? rule.references.map((ref) => ref.value)
      : [''],
    documentation: rule.metadata?.documentation ?? '',
    supports: rule.metadata?.supports?.length ? rule.metadata.supports : [''],
  };

  if (rule.metadata?.modified) metadata.modified = rule.metadata.modified;

  const yamlObject: any = {
    id: rule.id || '',
    logsource: { product: rule.category || '' },
    tags: rule.tags?.map((tag) => tag.value) ?? [],
    falsepositives: rule.false_positives?.map((fp) => fp.value) ?? [],
    level: rule.level || '',
    status: rule.status || '',
    enabled: rule.enabled ?? true,
    detection,
    metadata,
  };

  if (mitre) yamlObject.mitre = mitre;
  if (compliance) yamlObject.compliance = compliance;

  return yamlObject;
};

export const mapYamlObjectToRule = (obj: any): Rule => {
  const detection = safeDump(obj.detection);
  const mitre = safeDump(obj.mitre);
  const compliance = safeDump(obj.compliance);
  const meta = obj.metadata ?? {};
  const references = (meta.references ?? []).filter(Boolean);
  const supports = (meta.supports ?? []).filter(Boolean);
  const tags = (obj.tags ?? []).filter(Boolean);
  const falsepositives = (obj.falsepositives ?? []).filter(Boolean);

  return {
    id: obj.id,
    category: obj.logsource ? obj.logsource.product : undefined,
    log_source: {},
    title: meta.title || '',
    description: meta.description || '',
    tags: tags.map((tag: string) => ({ value: tag })),
    false_positives: falsepositives.map((fp: string) => ({ value: fp })),
    level: obj.level,
    status: obj.status,
    references: references.map((ref: string) => ({ value: ref })),
    author: meta.author || '',
    enabled: obj.enabled ?? true,
    detection,
    metadata: {
      title: meta.title || '',
      author: meta.author || '',
      description: meta.description || '',
      references,
      date: meta.date,
      modified: meta.modified,
      documentation: meta.documentation,
      supports,
    },
    mitre,
    compliance,
  };
};
