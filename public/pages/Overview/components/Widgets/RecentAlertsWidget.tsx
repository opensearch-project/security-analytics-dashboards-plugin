/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiBasicTableColumn, EuiButton, EuiEmptyPrompt } from '@elastic/eui';
import { DEFAULT_EMPTY_DATA, ROUTES, SortDirection } from '../../../../utils/constants';
import React, { useEffect, useState } from 'react';
import { TableWidget } from './TableWidget';
import { WidgetContainer } from './WidgetContainer';
import { parseAlertSeverityToOption } from '../../../CreateDetector/components/ConfigureAlerts/utils/helpers';
import { renderTime } from '../../../../utils/helpers';
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
    render: (severity: string) => parseAlertSeverityToOption(severity)?.label || DEFAULT_EMPTY_DATA,
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
  const [widgetEmptyMessage, setwidgetEmptyMessage] = useState<React.ReactNode | undefined>(
    undefined
  );

  useEffect(() => {
    items.sort((a, b) => {
      const timeA = new Date(a.time).getTime();
      const timeB = new Date(b.time).getTime();
      return timeB - timeA;
    });
    setAlertItems(items.slice(0, 20));
    setwidgetEmptyMessage(
      items.length > 0 ? undefined : (
        <EuiEmptyPrompt
          body={
            <p>
              <span style={{ display: 'block' }}>No recent alerts.</span>Adjust the time range to
              see more results.
            </p>
          }
        />
      )
    );
  }, [items]);

  const actions = React.useMemo(
    () => [<EuiButton href={`#${ROUTES.ALERTS}`}>View Alerts</EuiButton>],
    []
  );

  return (
    <WidgetContainer title={'Recent alerts'} actions={actions}>
      <TableWidget
        columns={columns}
        items={alertItems}
        sorting={{ sort: { field: 'time', direction: SortDirection.DESC } }}
        loading={loading}
        message={widgetEmptyMessage}
        className={widgetEmptyMessage ? 'sa-overview-widget-empty' : undefined}
      />
    </WidgetContainer>
  );
};
