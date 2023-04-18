/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EuiBasicTableColumn, EuiBadge, EuiToolTip, EuiButtonIcon } from '@elastic/eui';
import {
  ArgsWithError,
  ArgsWithQuery,
  CorrelationRule,
  CorrelationRuleQuery,
  CorrelationRuleTableItem,
} from '../../../../types';
import { Search } from '@opensearch-project/oui/src/eui_components/basic_table';
import { ruleTypes } from '../../Rules/utils/constants';
import { FieldClause } from '@opensearch-project/oui/src/eui_components/search_bar/query/ast';
import { DataStore } from '../../../store/DataStore';

export const getCorrelationRulesTableColumns = (
  _onEditRule: (ruleItem: CorrelationRule) => void
): EuiBasicTableColumn<CorrelationRuleTableItem>[] => {
  return [
    {
      field: 'name',
      name: 'Name',
      sortable: true,
      truncateText: true,
    },
    {
      name: 'Log types',
      render: (ruleItem: CorrelationRule) => {
        const badges = ruleItem.queries.map((query) => {
          return <EuiBadge color="hollow">{query.logType}</EuiBadge>;
        });
        return <>{badges}</>;
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
    // {
    //   name: 'Correlations for last 24 hrs',
    //   align: 'right',
    //   sortable: true,
    //   render: (ruleItem: CorrelationRule) => {
    //     return <p style={{width: '100%', textAlign: 'right'}}>2</p>
    //   },
    // },
    {
      name: 'Actions',
      field: '',
      actions: [
        {
          render: (ruleItem: CorrelationRule) => (
            <EuiToolTip content={'Delete'}>
              <EuiButtonIcon
                aria-label={'Delete correlation rule'}
                data-test-subj={`view-details-icon`}
                iconType={'trash'}
                color="danger"
                onClick={() => DataStore.correlationsStore.deleteCorrelationRule(ruleItem.name)}
              />
            </EuiToolTip>
          ),
        },
      ],
    },
  ];
};

export const getCorrelationRulesTableSearchConfig = (
  onLogTypeFilterChange: (logTypes?: string[]) => void
): Search => {
  return {
    box: {
      placeholder: 'Search by rule name, log type?',
    },
    onChange: (args: ArgsWithQuery | ArgsWithError) => {
      if (!args.error) {
        const logTypeFieldClauseIdx = args.query.ast.clauses.findIndex(
          (clause) => clause.type === 'field' && clause.field === 'logTypes'
        );
        const logTypeFieldClause =
          logTypeFieldClauseIdx > -1 ? args.query.ast.clauses[logTypeFieldClauseIdx] : undefined;

        if (logTypeFieldClause) {
          const logTypes = (logTypeFieldClause as FieldClause).value as string[];
          // Need to remove the logTypes clause so that in built search doesn't try to apply it because that will return 0 results,
          // since it requires custom logic we implemented in the `onLogTypeFilterChange` callback
          args.query.ast.removeOrFieldClauses('logTypes');
          onLogTypeFilterChange(logTypes);
        } else if (args.query.ast.clauses.length === 0) {
          onLogTypeFilterChange(undefined);
        }
      }

      return true;
    },
    filters: [
      {
        type: 'field_value_selection',
        field: 'logTypes',
        name: 'Log Types',
        multiSelect: 'or',
        options: ruleTypes.map(({ value, label }) => ({
          value,
          name: label,
        })),
      },
    ],
  };
};
