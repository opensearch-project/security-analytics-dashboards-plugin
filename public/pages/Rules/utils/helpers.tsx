/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiBasicTableColumn, EuiBreadcrumb, EuiLink, EuiBadge } from '@elastic/eui';
import React from 'react';
import {
  errorNotificationToast,
  formatRuleType,
  getLogTypeFilterOptions,
} from '../../../utils/helpers';
import { ruleSeverity, ruleSource, ruleTypes, sigmaRuleLogSourceFields } from './constants';
import { Search } from '@opensearch-project/oui/src/eui_components/basic_table';
import { NotificationsStart } from 'opensearch-dashboards/public';
import {
  AUTHOR_REGEX,
  RULE_DESCRIPTION_REGEX,
  RULE_NAME_REGEX,
  validateDescription,
  validateName,
} from '../../../utils/validation';
import { dump, load } from 'js-yaml';
import { BREADCRUMBS } from '../../../utils/constants';
import { RuleItemInfoBase, RulesTableColumnFields, Rule } from '../../../../types';
import { getSeverityColor, getSeverityLabel } from '../../Correlations/utils/constants';

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
  showRuleDetails: (rule: RuleTableItem) => void,
  columnsToHide: RulesTableColumnFields[] = []
): EuiBasicTableColumn<RuleTableItem>[] => {
  const fields: RulesTableColumnFields[] = ['title', 'level', 'category', 'source', 'description'];
  const tableColumnByField: { [field: string]: EuiBasicTableColumn<RuleTableItem> } = {
    title: {
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
    level: {
      field: 'level',
      name: 'Rule Severity',
      sortable: true,
      width: '10%',
      truncateText: true,
      render: (level: string) => {
        const { text, background } = getSeverityColor(level);
        return (
          <EuiBadge style={{ color: text }} color={background}>
            {getSeverityLabel(level)}
          </EuiBadge>
        );
      },
    },
    category: {
      field: 'category',
      name: 'Integration', // replace log type to integration by Wazuh
      sortable: true,
      width: '10%',
      truncateText: true,
      render: (category: string) => formatRuleType(category),
    },
    source: {
      field: 'source',
      name: 'Space', // Wazuh: replace to Space
      sortable: true,
      width: '10%',
      truncateText: true,
    },
    description: {
      field: 'description',
      name: 'Description',
      sortable: false,
      truncateText: true,
    },
  };

  const columns: EuiBasicTableColumn<RuleTableItem>[] = [];

  fields.forEach((field) => {
    if (!columnsToHide.includes(field)) {
      columns.push(tableColumnByField[field]);
    }
  });

  return columns;
};

export const getRulesTableSearchConfig = (): Search => {
  return {
    box: {
      placeholder: 'Search rules',
      schema: true,
      compressed: true,
    },
    filters: [
      {
        type: 'field_value_selection',
        field: 'category',
        name: 'Integration', // replace log type to integration by Wazuh
        compressed: true,
        multiSelect: 'or',
        options: getLogTypeFilterOptions(),
      },
      {
        type: 'field_value_selection',
        field: 'level',
        name: 'Rule severity',
        compressed: true,
        multiSelect: 'or',
        options: ruleSeverity,
      },
      {
        type: 'field_value_selection',
        field: 'source',
        name: 'Space', // Wazuh: replace to Space
        compressed: true,
        multiSelect: 'or',
        options: ruleSource.map((source: string) => ({
          value: source,
        })),
      },
    ],
  };
};

export function validateRule(
  rule: Rule,
  notifications: NotificationsStart,
  ruleAction: 'create' | 'save'
): boolean {
  const invalidFields = [];

  if (!rule.title || !validateName(rule.title, RULE_NAME_REGEX)) invalidFields.push('Rule name');
  if (!validateDescription(rule.description, RULE_DESCRIPTION_REGEX)) {
    invalidFields.push('Description');
  }
  if (!rule.category) invalidFields.push('Log type');
  if (!rule.detection) invalidFields.push('Detection');
  if (!rule.level) invalidFields.push('Rule level');
  if (!validateName(rule.author, AUTHOR_REGEX)) invalidFields.push('Author');
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
