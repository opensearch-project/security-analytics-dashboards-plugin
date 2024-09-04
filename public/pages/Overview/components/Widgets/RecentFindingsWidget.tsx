/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiBasicTableColumn, EuiSmallButton, EuiEmptyPrompt } from '@elastic/eui';
import { FINDINGS_NAV_ID, ROUTES, SortDirection } from '../../../../utils/constants';
import React, { useEffect, useState } from 'react';
import { TableWidget } from './TableWidget';
import { WidgetContainer } from './WidgetContainer';
import { renderTime, getSeverityBadge } from '../../../../utils/helpers';
import { OverviewFindingItem } from '../../../../../types';
import { getApplication, getUseUpdatedUx } from '../../../../services/utils/constants';

const columns: EuiBasicTableColumn<OverviewFindingItem>[] = [
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
    render: (ruleSeverity: string) => getSeverityBadge(ruleSeverity), // capitalizeFirstLetter(ruleSeverity),
  },
  {
    field: 'detector',
    name: 'Detector',
    sortable: false,
    align: 'left',
  },
];

export interface RecentFindingsWidgetProps {
  items: OverviewFindingItem[];
  loading?: boolean;
}

export const RecentFindingsWidget: React.FC<RecentFindingsWidgetProps> = ({
  items,
  loading = false,
}) => {
  const [findingItems, setFindingItems] = useState<OverviewFindingItem[]>([]);
  const [widgetEmptyMessage, setWidgetEmptyMessage] = useState<React.ReactNode | undefined>(
    undefined
  );

  useEffect(() => {
    items.sort((a, b) => {
      return b.time - a.time;
    });
    setFindingItems(items.slice(0, 20));
    setWidgetEmptyMessage(
      items.length > 0 ? undefined : (
        <EuiEmptyPrompt
          body={
            <p>
              <span style={{ display: 'block' }}>No recent findings.</span>Adjust the time range to
              see more results.
            </p>
          }
        />
      )
    );
  }, [items]);

  const actions = React.useMemo(() => {
    const baseUrl = getUseUpdatedUx() ? getApplication().getUrlForApp(FINDINGS_NAV_ID) : '';
    return [<EuiSmallButton href={`${baseUrl}#${ROUTES.FINDINGS}`}>View all</EuiSmallButton>];
  }, []);

  return (
    <WidgetContainer title={'Recent detection rule findings'} actions={actions}>
      <TableWidget
        columns={columns}
        items={findingItems}
        sorting={{ sort: { field: 'time', direction: SortDirection.DESC } }}
        loading={loading}
        message={widgetEmptyMessage}
        className={widgetEmptyMessage ? 'sa-overview-widget-empty' : undefined}
      />
    </WidgetContainer>
  );
};
