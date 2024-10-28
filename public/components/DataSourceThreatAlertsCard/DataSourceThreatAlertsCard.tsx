/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  EuiBasicTable,
  EuiBasicTableColumn,
  EuiFlexGroup,
  EuiFlexItem,
  EuiLink,
  EuiLoadingContent,
  EuiPanel,
  EuiText,
  EuiTitle,
} from '@elastic/eui';
import {
  DataSourceManagementPluginSetup,
  DataSourceOption,
} from '../../../../../src/plugins/data_source_management/public';
import {
  dataSourceFilterFn,
  errorNotificationToast,
  getTruncatedText,
  renderTime,
  getAlertSeverityBadge,
} from '../../utils/helpers';
import { THREAT_ALERTS_NAV_ID } from '../../utils/constants';
import {
  getApplication,
  getNotifications,
  getSavedObjectsClient,
} from '../../services/utils/constants';
import { DataStore } from '../../store/DataStore';
import { DetectorsService } from '../../services';
import { OverviewAlertItem } from '../../../types';
import { Time } from '@opensearch-project/opensearch/api/types';

export interface DataSourceAlertsCardProps {
  getDataSourceMenu?: DataSourceManagementPluginSetup['ui']['getDataSourceMenu'];
  detectorService: DetectorsService;
}

export const DataSourceThreatAlertsCard: React.FC<DataSourceAlertsCardProps> = ({
  getDataSourceMenu,
  detectorService,
}) => {
  const DataSourceSelector = useMemo(() => {
    if (getDataSourceMenu) {
      return getDataSourceMenu();
    }

    return null;
  }, [getDataSourceMenu]);
  const notifications = getNotifications();
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState<DataSourceOption>({
    label: 'Local cluster',
    id: '',
  });
  const [alerts, setAlerts] = useState<any[]>([]);

  const getAlerts = async () => {
    try {
      const detectorsRes = await detectorService.getDetectors(dataSource);
      if (detectorsRes.ok) {
        const detectors: any = {};
        const detectorIds = detectorsRes.response.hits.hits.map((hit: any) => {
          detectors[hit._id] = { ...hit._source, id: hit._id };
          return hit._id;
        });

        let alerts: any[] = [];

        for (let id of detectorIds) {
          const alertsRes = await DataStore.alerts.getAlertsForThreatAlertsCard(
            id,
            detectors[id].name,
            undefined,
            undefined,
            25,
            dataSource
          );
          alerts = alerts.concat(alertsRes);
        }

        alerts.sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime());
        setAlerts(alerts.slice(0, 25));
        setLoading(false);
      } else {
        errorNotificationToast(notifications, 'retrieve', 'detectors', detectorsRes.error);
        setLoading(false);
      }
    } catch (e: any) {
      errorNotificationToast(notifications, 'retrieve', 'alerts', e);
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    getAlerts();
  }, [dataSource]);

  const onDataSourceSelected = useCallback(
    (options: any[]) => {
      if (dataSource?.id === undefined || dataSource?.id !== options[0]?.id) {
        setDataSource(options[0]);
      }
    },
    [dataSource]
  );

  const columns: EuiBasicTableColumn<OverviewAlertItem>[] = [
    {
      field: 'start_time',
      name: 'Time',
      sortable: true,
      align: 'left',
      render: (start_time: Time) => {
        return <EuiText size="s">{renderTime(start_time)}</EuiText>;
      },
    },
    {
      field: 'trigger_name',
      name: 'Alert trigger',
      sortable: false,
      align: 'left',
      render: (triggerName: string) => {
        return (
          <span style={{ color: '#006BB4' }} className="eui-textTruncate">
            {getTruncatedText(triggerName)}
          </span>
        );
      },
    },
    {
      field: 'severity',
      name: 'Alert severity',
      sortable: true,
      align: 'left',
      render: getAlertSeverityBadge,
    },
  ];

  return (
    <EuiPanel hasBorder={false} hasShadow={false}>
      <EuiFlexGroup
        style={{ height: '100%' }}
        direction="column"
        justifyContent="spaceBetween"
        alignItems="flexStart"
        gutterSize="xs"
      >
        <EuiFlexItem grow={false} style={{ width: '100%', height: '90%' }}>
          <EuiFlexGroup direction="column" style={{ height: '100%' }}>
            <EuiFlexItem grow={false}>
              <EuiFlexGroup gutterSize="s" justifyContent="spaceBetween">
                <EuiFlexItem grow={false}>
                  <EuiTitle size="s">
                    <h3>Recent threat alerts</h3>
                  </EuiTitle>
                </EuiFlexItem>
                {DataSourceSelector && (
                  <EuiFlexItem grow={false}>
                    <DataSourceSelector
                      componentType={'DataSourceSelectable'}
                      componentConfig={{
                        savedObjects: getSavedObjectsClient(),
                        notifications: getNotifications(),
                        onSelectedDataSources: onDataSourceSelected,
                        fullWidth: false,
                        dataSourceFilter: dataSourceFilterFn,
                        activeOption: dataSource ? [{ id: dataSource.id }] : undefined,
                      }}
                    />
                  </EuiFlexItem>
                )}
              </EuiFlexGroup>
            </EuiFlexItem>
            <EuiFlexItem style={{ overflow: 'scroll' }}>
              {loading ? (
                <EuiLoadingContent />
              ) : (
                <EuiBasicTable tableCaption="threat_alerts" items={alerts} columns={columns} />
              )}
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiLink
            href={getApplication().getUrlForApp(THREAT_ALERTS_NAV_ID, { path: '#/dashboard' })}
            target="_blank"
          >
            <EuiText size="s" className="eui-displayInline">
              View all
            </EuiText>
          </EuiLink>
        </EuiFlexItem>
      </EuiFlexGroup>
    </EuiPanel>
  );
};
