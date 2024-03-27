/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { dump, load } from 'js-yaml';
import { Rule } from '../../../../types';

export const mapYamlObjectToYamlString = (rule: Rule): string => {
  try {
    if (!rule.detection) {
      const { detection, ...ruleWithoutDetection } = rule;
      return dump(ruleWithoutDetection);
    } else {
      return dump(rule);
    }
  } catch (error: any) {
    console.warn('Security Analytics - Rule Eritor - Yaml dump', error);
    return '';
  }
};

export const mapRuleToYamlObject = (rule: Rule): any => {
  let detection = undefined;
  if (rule.detection) {
    try {
      detection = load(rule.detection);
    } catch {}
  }

  const yamlObject: any = {
    id: rule.id || '',
    logsource: { product: rule.category || '' },
    title: rule.title || '',
    description: rule.description || '',
    tags: rule.tags.map((tag) => tag.value),
    falsepositives: rule.false_positives.map((falsePositive) => falsePositive.value),
    level: rule.level || '',
    status: rule.status || '',
    references: rule.references.map((reference) => reference.value),
    author: rule.author || '',
    detection,
  };

  return yamlObject;
};

export const mapYamlObjectToRule = (obj: any): Rule => {
  let detection = '';
  if (obj.detection) {
    try {
      detection = dump(obj.detection);
    } catch {}
  }
  const rule: Rule = {
    id: obj.id,
    category: obj.logsource ? obj.logsource.product : undefined,
    log_source: {},
    title: obj.title,
    description: obj.description,
    tags: obj.tags ? obj.tags.map((tag: string) => ({ value: tag })) : undefined,
    false_positives: obj.falsepositives
      ? obj.falsepositives.map((falsePositive: string) => ({ value: falsePositive }))
      : undefined,
    level: obj.level,
    status: obj.status,
    references: obj.references
      ? obj.references.map((reference: string) => ({ value: reference }))
      : undefined,
    author: obj.author,
    detection,
  };

  return rule;
};
