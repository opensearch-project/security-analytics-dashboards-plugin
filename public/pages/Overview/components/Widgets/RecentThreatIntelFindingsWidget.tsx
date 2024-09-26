/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiBasicTableColumn, EuiSmallButton, EuiEmptyPrompt, EuiText } from '@elastic/eui';
import {
  DEFAULT_EMPTY_DATA,
  FINDINGS_NAV_ID,
  FindingTabId,
  ROUTES,
  SortDirection,
} from '../../../../utils/constants';
import React, { useEffect, useState } from 'react';
import { TableWidget } from './TableWidget';
import { WidgetContainer } from './WidgetContainer';
import { renderTime } from '../../../../utils/helpers';
import { ThreatIntelFinding } from '../../../../../types';
import { getApplication } from '../../../../services/utils/constants';
import { IocLabel, ThreatIntelIocType } from '../../../../../common/constants';

const columns: EuiBasicTableColumn<ThreatIntelFinding>[] = [
  {
    name: 'Time',
    field: 'timestamp',
    render: (timestamp: number) => renderTime(timestamp),
  },
  {
    name: 'Indicator of compromise',
    field: 'ioc_value',
  },
  {
    name: 'Indicator type',
    field: 'ioc_type',
    render: (iocType: ThreatIntelIocType) => IocLabel[iocType],
  },
  {
    name: 'Threat intel source',
    field: 'ioc_feed_ids',
    render: (ioc_feed_ids: ThreatIntelFinding['ioc_feed_ids']) => {
      return (
        <span>{ioc_feed_ids.map((ids) => ids.feed_name).join(', ') || DEFAULT_EMPTY_DATA}</span>
      );
    },
  },
];

export interface RecentThreatIntelFindingsWidgetProps {
  items: ThreatIntelFinding[];
  loading?: boolean;
}

export const RecentThreatIntelFindingsWidget: React.FC<RecentThreatIntelFindingsWidgetProps> = ({
  items,
  loading = false,
}) => {
  const [findingItems, setFindingItems] = useState<ThreatIntelFinding[]>([]);

  useEffect(() => {
    items.sort((a, b) => {
      return b.timestamp - a.timestamp;
    });
    setFindingItems(items.slice(0, 20));
  }, [items]);

  const threatIntelFindingsUrl = `${getApplication().getUrlForApp(FINDINGS_NAV_ID, {
    path: `#${ROUTES.FINDINGS}`,
  })}?detectionType=${FindingTabId.ThreatIntel}`;
  const actions = React.useMemo(
    () => [
      <EuiSmallButton onClick={() => getApplication().navigateToUrl(threatIntelFindingsUrl)}>
        View all
      </EuiSmallButton>,
    ],
    []
  );

  return (
    <WidgetContainer title={'Recent threat intel findings'} actions={actions}>
      {findingItems.length === 0 ? (
        <EuiEmptyPrompt
          style={{ position: 'relative' }}
          body={
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <p style={{ position: 'absolute', top: 'calc(50% - 20px)' }}>
                <EuiText size="s">
                  <span style={{ display: 'block' }}>No recent findings.</span>Adjust the time range
                  to see more results.
                </EuiText>
              </p>
            </div>
          }
        />
      ) : (
        <TableWidget
          columns={columns}
          items={findingItems}
          sorting={{ sort: { field: 'timestamp', direction: SortDirection.DESC } }}
          loading={loading}
        />
      )}
    </WidgetContainer>
  );
};
