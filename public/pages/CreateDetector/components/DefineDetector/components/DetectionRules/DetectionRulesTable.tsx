/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { CriteriaWithPagination, EuiInMemoryTable } from '@elastic/eui';
import { ruleSeverity, ruleSource, ruleTypes } from '../../../../../../pages/Rules/lib/helpers';
import React from 'react';
import { RuleItem } from './types/interfaces';
import { getRulesColumns } from './utils/constants';
import { Search } from '@opensearch-project/oui/src/eui_components/basic_table';

export interface DetectionRulesTableProps {
  ruleItems: RuleItem[];
  pageIndex?: number;
  onAllRulesToggled?: (enabled: boolean) => void;
  onRuleActivationToggle: (changedItem: RuleItem, isActive: boolean) => void;
  onTableChange?: (nextValues: CriteriaWithPagination<RuleItem>) => void;
}

const rulePriorityBySeverity: { [severity: string]: number } = {
  critical: 1,
  high: 2,
  medium: 3,
  low: 4,
  informational: 5,
};

export const DetectionRulesTable: React.FC<DetectionRulesTableProps> = ({
  pageIndex,
  ruleItems,
  onAllRulesToggled,
  onRuleActivationToggle,
  onTableChange,
}) => {
  //Filter table by rule type
  const search: Search = {
    box: {
      schema: true,
    },
    filters: [
      {
        type: 'field_value_selection',
        field: 'logType',
        name: 'Log Type',
        multiSelect: true,
        options: ruleTypes.map((type: string) => ({
          value: type,
        })),
      },
      {
        type: 'field_value_selection',
        field: 'severity',
        name: 'Rule Severity',
        multiSelect: false,
        options: ruleSeverity,
      },
      {
        type: 'field_value_selection',
        field: 'library',
        name: 'Source',
        multiSelect: false,
        options: ruleSource.map((source: string) => ({
          value: source,
        })),
      },
    ],
  };

  const allRulesEnabled = ruleItems.every((item) => item.active);
  ruleItems.sort((a, b) => {
    return (rulePriorityBySeverity[a.severity] || 6) - (rulePriorityBySeverity[b.severity] || 6);
  });

  return (
    <div style={{ padding: 10 }}>
      <EuiInMemoryTable
        columns={getRulesColumns(allRulesEnabled, onAllRulesToggled, onRuleActivationToggle)}
        items={ruleItems}
        itemId={(item: RuleItem) => `${item.name}`}
        search={search}
        pagination={
          pageIndex !== undefined
            ? {
                pageIndex,
              }
            : true
        }
        onTableChange={onTableChange}
      />
    </div>
  );
};
