/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import { Rule } from '../../../../../models/interfaces';
import { RuleEditorFormState, ruleEditorStateDefaultValue } from './RuleEditorFormState';

export const mapFormToRule = (formState: RuleEditorFormState): Rule => {
  return {
    id: formState.id,
    category: formState.logType,
    title: formState.name,
    description: formState.description,
    status: formState.status,
    author: formState.author,
    references: formState.references.map((ref) => ({ value: ref })),
    tags: formState.tags.map((tag) => ({ value: tag.label })),
    log_source: formState.log_source,
    detection: formState.detection,
    level: formState.level,
    false_positives: formState.falsePositives.map((falsePositive) => ({
      value: falsePositive,
    })),
  };
};

export const mapRuleToForm = (rule: Rule): RuleEditorFormState => {
  return {
    id: rule.id,
    log_source: rule.log_source,
    logType: rule.category,
    name: rule.title,
    description: rule.description,
    status: rule.status,
    author: rule.author,
    references: rule.references
      ? rule.references.map((ref) => ref.value)
      : ruleEditorStateDefaultValue.references,
    tags: rule.tags
      ? rule.tags.map((tag) => ({ label: tag.value }))
      : ruleEditorStateDefaultValue.tags,
    detection: rule.detection,
    level: rule.level,
    falsePositives: rule.false_positives
      ? rule.false_positives.map((falsePositive) => falsePositive.value)
      : ruleEditorStateDefaultValue.falsePositives,
  };
};
