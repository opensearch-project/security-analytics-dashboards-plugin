/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiBasicTableColumn, EuiLink } from '@elastic/eui';
import React from 'react';
import { capitalizeFirstLetter, errorNotificationToast } from '../../../utils/helpers';
import { ruleSeverity, ruleSource, ruleTypes } from './constants';
import { Search } from '@opensearch-project/oui/src/eui_components/basic_table';
import { RuleItemInfoBase } from '../models/types';
import { Rule } from '../../../../models/interfaces';
import { NotificationsStart } from 'opensearch-dashboards/public';
import { lint } from 'yaml-lint';

export interface RuleTableItem {
  title: string;
  level: string;
  category: string;
  source: string;
  description: string;
  ruleInfo: RuleItemInfoBase;
  ruleId: string;
}

export const getRulesTableColumns = (
  showRuleDetails: (rule: RuleTableItem) => void
): EuiBasicTableColumn<RuleTableItem>[] => {
  return [
    {
      field: 'title',
      name: 'Rule name',
      sortable: true,
      width: '30%',
      truncateText: true,
      render: (title: string, rule: RuleTableItem) => (
        <EuiLink onClick={() => showRuleDetails(rule)} data-test-subj={`rule_link_${title}`}>
          {title}
        </EuiLink>
      ),
    },
    {
      field: 'level',
      name: 'Rule Severity',
      sortable: true,
      width: '10%',
      truncateText: true,
      render: (level: string) => capitalizeFirstLetter(level),
    },
    {
      field: 'category',
      name: 'Log type',
      sortable: true,
      width: '10%',
      truncateText: true,
    },
    {
      field: 'source',
      name: 'Source',
      sortable: true,
      width: '10%',
      truncateText: true,
    },
    {
      field: 'description',
      name: 'Description',
      sortable: false,
      truncateText: true,
    },
  ];
};

export const getRulesTableSearchConfig = (): Search => {
  return {
    box: {
      placeholder: 'Search rules',
      schema: true,
    },
    filters: [
      {
        type: 'field_value_selection',
        field: 'category',
        name: 'Rule Type',
        multiSelect: false,
        options: ruleTypes.map((type: string) => ({
          value: type,
        })),
      },
      {
        type: 'field_value_selection',
        field: 'level',
        name: 'Rule Severity',
        multiSelect: false,
        options: ruleSeverity,
      },
      {
        type: 'field_value_selection',
        field: 'source',
        name: 'Source',
        multiSelect: false,
        options: ruleSource.map((source: string) => ({
          value: source,
        })),
      },
    ],
  };
};

export const validateYamlContent = (content: string): Promise<string | undefined> => {
  return lint(content)
    .then(() => undefined)
    .catch((error) => error.message);
};

export function validateRule(
  rule: Rule,
  notifications: NotificationsStart,
  ruleAction: 'create' | 'save'
): boolean {
  const invalidFields = [];

  if (!rule.title) invalidFields.push('Rule name');
  if (!rule.category) invalidFields.push('Log type');
  if (!rule.detection) invalidFields.push('Detection');
  if (!rule.level) invalidFields.push('Rule level');
  if (!rule.author) invalidFields.push('Author');
  if (!rule.status) invalidFields.push('Rule status');

  if (invalidFields.length > 0) {
    errorNotificationToast(
      notifications!,
      ruleAction,
      'rule',
      `Enter valid input for ${invalidFields.join(',')}`
    );

    return false;
  }

  return true;
}
