/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiBasicTableColumn, EuiButton } from '@elastic/eui';
import { ROUTES } from '../../../../utils/constants';
import React, { useEffect, useState } from 'react';
import { FindingItem } from '../../models/interfaces';
import { TableWidget } from './TableWidget';
import { WidgetContainer } from './WidgetContainer';
import { renderTime, capitalizeFirstLetter } from '../../../../utils/helpers';

const columns: EuiBasicTableColumn<FindingItem>[] = [
  {
    field: 'time',
    name: 'Time',
    sortable: true,
    align: 'left',
    truncateText: true,
    render: renderTime,
  },
  {
    field: 'ruleName',
    name: 'Rule Name',
    sortable: false,
    align: 'left',
  },
  {
    field: 'ruleSeverity',
    name: 'Rule severity',
    sortable: false,
    align: 'left',
    width: '20%',
    render: (ruleSeverity: string) => capitalizeFirstLetter(ruleSeverity),
  },
  {
    field: 'detector',
    name: 'Detector',
    sortable: false,
    align: 'left',
  },
];

export interface RecentFindingsWidgetProps {
  items: FindingItem[];
}

export const RecentFindingsWidget: React.FC<RecentFindingsWidgetProps> = ({ items }) => {
  const [findingItems, setFindingItems] = useState<FindingItem[]>([]);

  useEffect(() => {
    items.sort((a, b) => {
      return a.time - b.time;
    });
    setFindingItems(items.slice(0, 20));
  }, [items]);

  const actions = React.useMemo(
    () => [<EuiButton href={`#${ROUTES.FINDINGS}`}>View all findings</EuiButton>],
    []
  );

  return (
    <WidgetContainer
      title={`Top ${findingItems.length < 20 ? '' : 20} recent findings`}
      actions={actions}
    >
      <TableWidget columns={columns} items={findingItems} />
    </WidgetContainer>
  );
};
