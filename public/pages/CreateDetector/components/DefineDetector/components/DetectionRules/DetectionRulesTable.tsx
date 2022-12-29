/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { CriteriaWithPagination, EuiInMemoryTable } from '@elastic/eui';
import React, { useState } from 'react';
import { RuleItem } from './types/interfaces';
import { getRulesColumns } from './utils/constants';
import { Search } from '@opensearch-project/oui/src/eui_components/basic_table';
import { ruleTypes, ruleSeverity, ruleSource } from '../../../../../Rules/utils/constants';

export interface DetectionRulesTableProps {
  ruleItems: RuleItem[];
  pageIndex?: number;
  onAllRulesToggled?: (enabled: boolean) => void;
  onRuleActivationToggle: (changedItem: RuleItem, isActive: boolean) => void;
  onTableChange?: (nextValues: CriteriaWithPagination<RuleItem>) => void;
  loading?: boolean;
  onRuleDetails?: (ruleItem: RuleItem) => void;
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
  loading = false,
  onRuleDetails,
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
  const [pagination, setPagination] = useState({ pageIndex: pageIndex || 0 });
  const allRulesEnabled = ruleItems.every((item) => item.active);
  ruleItems.sort((a, b) => {
    return (rulePriorityBySeverity[a.severity] || 6) - (rulePriorityBySeverity[b.severity] || 6);
  });

  const onTableChangeHandler = (pagination: CriteriaWithPagination<T>) => {
    setPagination({ pageIndex: pagination.page.index });
    onTableChange && onTableChange(pagination);
  };

  return (
    <div style={{ padding: 10 }}>
      <EuiInMemoryTable
        columns={getRulesColumns(
          allRulesEnabled,
          onAllRulesToggled,
          onRuleActivationToggle,
          onRuleDetails
        )}
        items={ruleItems}
        itemId={(item: RuleItem) => `${item.name}`}
        search={search}
        pagination={pagination}
        onTableChange={onTableChangeHandler}
        loading={loading}
        data-test-subj={'edit-detector-rules-table'}
      />
    </div>
  );
};
