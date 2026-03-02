// Wazuh: hide Recent Alerts widget from Overview.
/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 *
 * Original implementation retained for future upgrades:
 *
 * import { EuiBasicTableColumn, EuiSmallButton } from '@elastic/eui';
 * import { ROUTES, SortDirection } from '../../../../utils/constants';
 * import React, { useEffect, useState } from 'react';
 * import { TableWidget } from './TableWidget';
 * import { WidgetContainer } from './WidgetContainer';
 * import { getAlertSeverityBadge, getEuiEmptyPrompt, renderTime } from '../../../../utils/helpers';
 * import { OverviewAlertItem } from '../../../../../types';
 *
 * const columns: EuiBasicTableColumn<OverviewAlertItem>[] = [
 *   {
 *     field: 'time',
 *     name: 'Time',
 *     sortable: true,
 *     align: 'left',
 *     render: renderTime,
 *   },
 *   {
 *     field: 'triggerName',
 *     name: 'Alert Trigger Name',
 *     sortable: false,
 *     align: 'left',
 *   },
 *   {
 *     field: 'severity',
 *     name: 'Alert severity',
 *     sortable: true,
 *     align: 'left',
 *     render: (severity: string) => getAlertSeverityBadge(severity),
 *   },
 * ];
 *
 * export interface RecentAlertsWidgetProps {
 *   items: OverviewAlertItem[];
 *   loading?: boolean;
 * }
 *
 * export const RecentAlertsWidget: React.FC<RecentAlertsWidgetProps> = ({
 *   items,
 *   loading = false,
 * }) => {
 *   const [alertItems, setAlertItems] = useState<OverviewAlertItem[]>([]);
 *
 *   useEffect(() => {
 *     items.sort((a, b) => {
 *       const timeA = new Date(a.time).getTime();
 *       const timeB = new Date(b.time).getTime();
 *       return timeB - timeA;
 *     });
 *     setAlertItems(items.slice(0, 20));
 *   }, [items]);
 *
 *   const actions = React.useMemo(
 *     () => [<EuiSmallButton href={`#${ROUTES.ALERTS}`}>View Alerts</EuiSmallButton>],
 *     []
 *   );
 *
 *   return (
 *     <WidgetContainer title={'Recent threat alerts'} actions={actions}>
 *       {alertItems.length === 0 ? (
 *         getEuiEmptyPrompt('No recent alerts.')
 *       ) : (
 *         <TableWidget
 *           columns={columns}
 *           items={alertItems}
 *           sorting={{ sort: { field: 'time', direction: SortDirection.DESC } }}
 *           loading={loading}
 *         />
 *       )}
 *     </WidgetContainer>
 *   );
 * };
 */
