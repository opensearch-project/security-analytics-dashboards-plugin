/*
 * Copyright Wazuh Inc.
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { EuiBreadcrumb } from '@elastic/eui';
import { dump, load } from 'js-yaml';
import { NotificationsStart } from 'opensearch-dashboards/public';
import { Rule, RuleItemInfoBase } from '../../../../types';
import { BREADCRUMBS } from '../../../utils/constants';
import { errorNotificationToast } from '../../../utils/helpers';
import {
  AUTHOR_REGEX,
  RULE_DESCRIPTION_REGEX,
  RULE_NAME_REGEX,
  validateDescription,
  validateName,
} from '../../../utils/validation';
import { ruleTypes, sigmaRuleLogSourceFields } from './constants';

export interface RuleTableItem {
  title: string;
  level: string;
  category: string;
  source: string;
  description: string;
  ruleInfo: RuleItemInfoBase;
  ruleId: string;
}

export function validateRule(
  rule: Rule,
  notifications: NotificationsStart,
  ruleAction: 'create' | 'save'
): boolean {
  const invalidFields = [];

  const title = (rule.metadata?.title ?? (rule as any).title ?? '') as string;
  const description = (rule.metadata?.description ?? (rule as any).description ?? '') as string;
  const author = (rule.metadata?.author ?? (rule as any).author ?? '') as string;

  if (!title || !validateName(title, RULE_NAME_REGEX)) invalidFields.push('Rule name');
  if (!validateDescription(description, RULE_DESCRIPTION_REGEX)) {
    invalidFields.push('Description');
  }
  if (!rule.category) invalidFields.push('Integration');
  if (!rule.detection) invalidFields.push('Detection');
  if (!rule.level) invalidFields.push('Rule level');
  if (!validateName(author, AUTHOR_REGEX)) invalidFields.push('Author');
  if (!rule.status) invalidFields.push('Rule status');

  if (rule.detection) {
    try {
      const json = load(rule.detection);
      dump(json);
    } catch (error: any) {
      invalidFields.push('Detection');
    }
  }

  if (invalidFields.length > 0) {
    errorNotificationToast(
      notifications!,
      ruleAction,
      'rule',
      `Enter valid input for ${invalidFields.join(', ')}`
    );

    return false;
  }

  return true;
}

export function setRulesRelatedBreadCrumb(
  breadCrumb: EuiBreadcrumb,
  breadCrumbSetter?: (breadCrumbs: EuiBreadcrumb[]) => void
) {
  breadCrumbSetter?.([BREADCRUMBS.RULES, breadCrumb]);
}

export function getLogTypeFromLogSource(logSource: { [k: string]: string }) {
  const logTypes = new Set(ruleTypes.map(({ value }) => value));
  let logType;

  for (let field of sigmaRuleLogSourceFields) {
    logType = logSource[field];

    if (logType && logTypes.has(logType)) {
      break;
    }
  }

  return logType;
}
