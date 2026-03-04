/*
 * Copyright Wazuh Inc.
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { Rule } from '../../../../../types';
import { getLogTypeFromLogSource } from '../../utils/helpers';
import { RuleEditorFormModel, ruleEditorStateDefaultValue } from './RuleEditorFormModel';

export const mapFormToRule = (formState: RuleEditorFormModel): Rule => {
  return {
    id: formState.id,
    category: formState.integration,
    title: formState.name,
    description: formState.description,
    status: formState.status,
    author: formState.author,
    references: formState.references.map((ref) => ({ value: ref })),
    tags: formState.tags.map((tag) => ({ value: tag })),
    log_source: formState.log_source,
    detection: formState.detection,
    level: formState.level,
    false_positives: formState.falsePositives.map((falsePositive) => ({
      value: falsePositive,
    })),
  };
};

export const mapRuleToForm = (rule: Rule): RuleEditorFormModel => {
  // get category from log_source
  const logType = rule.category || getLogTypeFromLogSource(rule.log_source);

  return {
    id: rule.id,
    log_source: rule.log_source,
    integration: logType || '',
    name: rule.title,
    description: rule.description,
    status: rule.status,
    author: rule.author,
    references: rule.references
      ? rule.references.map((ref) => ref.value)
      : ruleEditorStateDefaultValue.references,
    tags: rule.tags ? rule.tags.map((tag) => tag.value) : ruleEditorStateDefaultValue.tags,
    detection: rule.detection,
    level: rule.level,
    falsePositives: rule.false_positives
      ? rule.false_positives.map((falsePositive) => falsePositive.value)
      : ruleEditorStateDefaultValue.falsePositives,
  };
};
