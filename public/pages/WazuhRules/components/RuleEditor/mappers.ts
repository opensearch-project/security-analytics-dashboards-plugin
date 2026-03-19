/*
 * Copyright Wazuh Inc.
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { Rule } from '../../../../../types';
import { getLogTypeFromLogSource } from '../../utils/helpers';
import { RuleEditorFormModel, ruleEditorStateDefaultValue } from './RuleEditorFormModel';

export const mapFormToRule = (formState: RuleEditorFormModel): Rule => {
  const logSource = { ...(formState.log_source ?? {}) };
  if (!logSource.product && formState.integration) {
    logSource.product = formState.integration;
  }

  const title = formState.metadata.title;
  const description = formState.metadata.description;
  const author = formState.metadata.author;
  const references = formState.metadata.references;
  const documentation = formState.metadata.documentation;
  const supports = formState.metadata.supports;

  const rule: any = {
    id: formState.id,
    category: formState.integration,
    status: formState.status,
    title,
    description,
    author,
    references: references.map((ref) => ({ value: ref })),
    tags: formState.tags.map((tag) => ({ value: tag })),
    log_source: logSource,
    detection: formState.detection,
    level: formState.level,
    false_positives: formState.falsePositives.map((falsePositive) => ({
      value: falsePositive,
    })),
    metadata: {
      title,
      author,
      description,
      references,
      documentation,
      supports,
    },
    mitre: formState.mitre,
    compliance: formState.compliance,
    enabled: formState.enabled,
  };

  return rule as Rule;
};

export const mapRuleToForm = (rule: Rule): RuleEditorFormModel => {
  const logType = rule.category || getLogTypeFromLogSource(rule.log_source);
  const title = rule.metadata?.title ?? rule.title;
  const description = rule.metadata?.description ?? rule.description;
  const author = rule.metadata?.author ?? rule.author;
  const refs = rule.metadata?.references ?? rule.references?.map((r) => r.value) ?? [];

  const metadataTitle = rule.metadata?.title ?? rule.title;
  const metadataDescription = rule.metadata?.description ?? rule.description;
  const metadataAuthor = rule.metadata?.author ?? rule.author;
  const metadataReferences = rule.metadata?.references?.length
    ? rule.metadata.references
    : rule.references?.map((r) => r.value);

  const metadataDocumentation = rule.metadata?.documentation ?? '';
  const metadataSupports = rule.metadata?.supports ?? [];

  return {
    id: rule.id,
    log_source: rule.log_source,
    integration: logType || '',
    status: rule.status,
    tags: rule.tags ? rule.tags.map((tag) => tag.value) : ruleEditorStateDefaultValue.tags,
    detection: rule.detection,
    level: rule.level,
    falsePositives: rule.false_positives?.length
      ? rule.false_positives.map((fp) => fp.value)
      : ruleEditorStateDefaultValue.falsePositives,
    mitre: rule.mitre,
    compliance: rule.compliance,
    enabled: rule.enabled ?? true,
    metadata: {
      title: metadataTitle,
      description: metadataDescription,
      author: metadataAuthor,
      references: metadataReferences ?? ruleEditorStateDefaultValue.metadata.references,
      supports: metadataSupports ?? ruleEditorStateDefaultValue.metadata.supports,
      documentation: metadataDocumentation ?? ruleEditorStateDefaultValue.metadata.documentation,
    },
  };
};
