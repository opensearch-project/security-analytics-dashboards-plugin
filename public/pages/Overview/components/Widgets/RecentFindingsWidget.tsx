/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiBasicTableColumn, EuiButton } from '@elastic/eui';
import { ROUTES } from '../../../../utils/constants';
import React from 'react';
import { FindingItem } from '../../models/interfaces';
import { TableWidget } from './TableWidget';
import { WidgetContainer } from './WidgetContainer';

const columns: EuiBasicTableColumn<FindingItem>[] = [
  {
    field: 'time',
    name: 'Time',
    sortable: true,
    align: 'left',
  },
  {
    field: 'findingName',
    name: 'Finding Name',
    sortable: false,
    align: 'left',
  },
  {
    field: 'detector',
    name: 'Detector',
    sortable: true,
    align: 'left',
  },
];

export interface RecentFindingsWidgetProps {
  items: FindingItem[];
}

export const RecentFindingsWidget: React.FC<RecentFindingsWidgetProps> = ({ items }) => {
  const actions = React.useMemo(
    () => [<EuiButton href={`#${ROUTES.FINDINGS}`}>View all findings</EuiButton>],
    []
  );

  return (
    <WidgetContainer title="Top 20 recent findings" actions={actions}>
      <TableWidget columns={columns} items={items} />
    </WidgetContainer>
  );
};
