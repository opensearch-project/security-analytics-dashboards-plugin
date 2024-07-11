/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EuiBasicTableColumn, EuiBadge, EuiToolTip, EuiSmallButtonIcon, EuiLink } from '@elastic/eui';
import { CorrelationRule, CorrelationRuleQuery, CorrelationRuleTableItem } from '../../../../types';
import { Search } from '@opensearch-project/oui/src/eui_components/basic_table';
import { formatRuleType, getLogTypeFilterOptions } from '../../../utils/helpers';

export const getCorrelationRulesTableColumns = (
  onRuleNameClick: (rule: CorrelationRule) => void,
  _refreshRules: (ruleItem: CorrelationRule) => void
): EuiBasicTableColumn<CorrelationRuleTableItem>[] => {
  return [
    {
      field: 'name',
      name: 'Name',
      sortable: true,
      truncateText: true,
      render: (name: string, ruleItem: CorrelationRule) => (
        <EuiLink onClick={() => onRuleNameClick(ruleItem)}>{name}</EuiLink>
      ),
    },
    {
      name: 'Log types',
      field: 'logTypes',
      render: (logTypes: string, ruleItem: CorrelationRule) => {
        const badges = [
          ...new Set(ruleItem.queries?.map((query) => formatRuleType(query.logType))),
        ];
        return (
          <>
            {badges.map((badge) => (
              <EuiBadge color="hollow">{badge}</EuiBadge>
            ))}
          </>
        );
      },
    },
    {
      field: 'queries',
      name: 'Queries',
      align: 'right',
      render: (queries: CorrelationRuleQuery[], ruleItem: CorrelationRule) => {
        return queries.length;
      },
      width: '10%',
    },
    {
      name: 'Actions',
      field: '',
      actions: [
        {
          render: (ruleItem: CorrelationRule) => (
            <EuiToolTip content={'Delete'}>
              <EuiSmallButtonIcon
                aria-label={'Delete correlation rule'}
                data-test-subj={`view-details-icon`}
                iconType={'trash'}
                color="danger"
                onClick={() => _refreshRules(ruleItem)}
              />
            </EuiToolTip>
          ),
        },
      ],
    },
  ];
};

export const getCorrelationRulesTableSearchConfig = (): Search => {
  return {
    box: {
      placeholder: 'Search by rule name, log type',
      schema: true,
    },
    filters: [
      {
        type: 'field_value_selection',
        field: 'logTypes',
        name: 'Log Types',
        multiSelect: 'or',
        options: getLogTypeFilterOptions(),
      },
    ],
  };
};
