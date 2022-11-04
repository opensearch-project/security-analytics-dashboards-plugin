/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiBasicTableColumn, EuiButton } from '@elastic/eui';
import { DEFAULT_EMPTY_DATA, ROUTES } from '../../../../utils/constants';
import React, { useEffect, useState } from 'react';
import { AlertItem } from '../../models/interfaces';
import { TableWidget } from './TableWidget';
import { WidgetContainer } from './WidgetContainer';
import { parseAlertSeverityToOption } from '../../../CreateDetector/components/ConfigureAlerts/utils/helpers';
import { renderTime } from '../../../../utils/helpers';

const columns: EuiBasicTableColumn<AlertItem>[] = [
  {
    field: 'time',
    name: 'Time',
    sortable: true,
    align: 'left',
    render: renderTime,
  },
  {
    field: 'triggerName',
    name: 'Alert Trigger Name',
    sortable: false,
    align: 'left',
  },
  {
    field: 'severity',
    name: 'Alert severity',
    sortable: true,
    align: 'left',
    render: (severity: string) => parseAlertSeverityToOption(severity)?.label || DEFAULT_EMPTY_DATA,
  },
];

export interface RecentAlertsWidgetProps {
  items: AlertItem[];
}

export const RecentAlertsWidget: React.FC<RecentAlertsWidgetProps> = ({ items }) => {
  const [alertItems, setAlertItems] = useState<AlertItem[]>([]);

  useEffect(() => {
    items.sort((a, b) => {
      const timeA = new Date(a.time).getTime();
      const timeB = new Date(b.time).getTime();
      return timeA - timeB;
    });
    setAlertItems(items.slice(0, 20));
  }, [items]);

  const actions = React.useMemo(
    () => [<EuiButton href={`#${ROUTES.ALERTS}`}>View Alerts</EuiButton>],
    []
  );

  return (
    <WidgetContainer
      title={`Top ${alertItems.length < 20 ? '' : 20} recent alerts`}
      actions={actions}
    >
      <TableWidget columns={columns} items={alertItems} />
    </WidgetContainer>
  );
};
