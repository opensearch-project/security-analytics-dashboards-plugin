/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiBasicTableColumn, EuiSmallButton, EuiEmptyPrompt, EuiText } from '@elastic/eui';
import { ROUTES, SortDirection } from '../../../../utils/constants';
import React, { useEffect, useState } from 'react';
import { TableWidget } from './TableWidget';
import { WidgetContainer } from './WidgetContainer';
import { getAlertSeverityBadge, renderTime } from '../../../../utils/helpers';
import { OverviewAlertItem } from '../../../../../types';

const columns: EuiBasicTableColumn<OverviewAlertItem>[] = [
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
    render: (severity: string) => getAlertSeverityBadge(severity),
  },
];

export interface RecentAlertsWidgetProps {
  items: OverviewAlertItem[];
  loading?: boolean;
}

export const RecentAlertsWidget: React.FC<RecentAlertsWidgetProps> = ({
  items,
  loading = false,
}) => {
  const [alertItems, setAlertItems] = useState<OverviewAlertItem[]>([]);

  useEffect(() => {
    items.sort((a, b) => {
      const timeA = new Date(a.time).getTime();
      const timeB = new Date(b.time).getTime();
      return timeB - timeA;
    });
    setAlertItems(items.slice(0, 20));
  }, [items]);

  const actions = React.useMemo(
    () => [<EuiSmallButton href={`#${ROUTES.ALERTS}`}>View Alerts</EuiSmallButton>],
    []
  );

  return (
    <WidgetContainer title={'Recent threat alerts'} actions={actions}>
      {alertItems.length === 0 ? (
        <EuiEmptyPrompt
          style={{ position: 'relative' }}
          body={
            <div style={{ display: 'flex', justifyContent: 'center', padding: '32px' }}>
              <p style={{ position: 'absolute', top: 'calc(50% - 20px)' }}>
                <EuiText size="s">
                  <span style={{ display: 'block' }}>No recent alerts.</span>Adjust the time range
                  to see more results.
                </EuiText>
              </p>
            </div>
          }
        />
      ) : (
        <TableWidget
          columns={columns}
          items={alertItems}
          sorting={{ sort: { field: 'time', direction: SortDirection.DESC } }}
          loading={loading}
        />
      )}
    </WidgetContainer>
  );
};
