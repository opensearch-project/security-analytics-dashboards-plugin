/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  getRulesTableColumns,
  getRulesTableSearchConfig,
  RuleTableItem,
} from '../../utils/helpers';
import { CriteriaWithPagination, EuiInMemoryTable, EuiPanel } from '@elastic/eui';

export interface RulesTableProps {
  ruleItems: RuleTableItem[];
  loading: boolean;
  showRuleDetails: (ruleItem: RuleTableItem) => void;
}

export const RulesTable: React.FC<RulesTableProps> = ({ ruleItems, loading, showRuleDetails }) => {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 25 });

  return (
    <EuiPanel>
      <EuiInMemoryTable
        loading={loading}
        items={ruleItems}
        columns={getRulesTableColumns(showRuleDetails)}
        search={getRulesTableSearchConfig()}
        pagination={{ ...pagination, pageSizeOptions: [10, 25, 50] }}
        onTableChange={(nextValues: CriteriaWithPagination<any>) =>
          setPagination({ pageIndex: nextValues.page.index, pageSize: nextValues.page.size })
        }
        sorting={true}
      />
    </EuiPanel>
  );
};
