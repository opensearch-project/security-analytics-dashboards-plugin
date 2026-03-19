/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { Rule } from '../../../../../types';
import { getLogTypeFromLogSource } from '../../utils/helpers';
import { RuleEditorFormModel, ruleEditorStateDefaultValue } from './RuleEditorFormModel';

export const mapFormToRule = (formState: RuleEditorFormModel): Rule => {
  const references = formState.references.map((ref) => ({ value: ref }));
  const refs = references.map((r) => r.value);
  return {
    id: formState.id,
    category: formState.logType,
    title: formState.name,
    description: formState.description,
    status: formState.status,
    author: formState.author,
    references,
    tags: formState.tags.map((tag) => ({ value: tag })),
    log_source: formState.log_source,
    detection: formState.detection,
    level: formState.level,
    false_positives: formState.falsePositives.map((falsePositive) => ({
      value: falsePositive,
    })),
    metadata: {
      title: formState.name,
      author: formState.author,
      description: formState.description,
      references: refs,
      documentation: '',
      supports: [],
    },
  };
};

export const mapRuleToForm = (rule: Rule): RuleEditorFormModel => {
  const logType = rule.category || getLogTypeFromLogSource(rule.log_source);
  const title = rule.metadata?.title ?? rule.title;
  const description = rule.metadata?.description ?? rule.description;
  const author = rule.metadata?.author ?? rule.author;
  const refs = rule.metadata?.references ?? rule.references?.map((r) => r.value) ?? [];

  return {
    id: rule.id,
    log_source: rule.log_source,
    logType: logType || '',
    name: title,
    description,
    status: rule.status,
    author,
    references: refs.length ? refs : ruleEditorStateDefaultValue.references,
    tags: rule.tags?.length ? rule.tags.map((tag) => tag.value) : ruleEditorStateDefaultValue.tags,
    detection: rule.detection,
    level: rule.level,
    falsePositives: rule.false_positives?.length
      ? rule.false_positives.map((fp) => fp.value)
      : ruleEditorStateDefaultValue.falsePositives,
  };
};
