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
import { CriteriaWithPagination, EuiInMemoryTable } from '@elastic/eui';
import { RulesTableColumnFields } from '../../../../../types';

export interface RulesTableProps {
  ruleItems: RuleTableItem[];
  loading: boolean;
  columnsToHide?: RulesTableColumnFields[];
  showRuleDetails: (ruleItem: RuleTableItem) => void;
}

export const RulesTable: React.FC<RulesTableProps> = ({
  columnsToHide,
  ruleItems,
  loading,
  showRuleDetails,
}) => {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 25 });

  return (
    <EuiInMemoryTable
      loading={loading}
      items={ruleItems}
      columns={getRulesTableColumns(showRuleDetails, columnsToHide)}
      search={getRulesTableSearchConfig()}
      pagination={{ ...pagination, pageSizeOptions: [10, 25, 50] }}
      onTableChange={(nextValues: CriteriaWithPagination<any>) =>
        setPagination({
          pageIndex: nextValues.page.index,
          pageSize: nextValues.page.size,
        })
      }
      sorting={true}
    />
  );
};
