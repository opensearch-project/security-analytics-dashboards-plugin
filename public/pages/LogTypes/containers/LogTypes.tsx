/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useContext, useEffect, useState } from 'react';
import { EuiButton, EuiInMemoryTable } from '@elastic/eui';
import { ContentPanel } from '../../../components/ContentPanel';
import { CoreServicesContext } from '../../../components/core_services';
import { BREADCRUMBS, ROUTES } from '../../../utils/constants';
import { LogType } from '../../../../types';
import { DataStore } from '../../../store/DataStore';
import { getLogTypesTableColumns } from '../utils/helpers';
import { RouteComponentProps } from 'react-router-dom';
import { useCallback } from 'react';
import { NotificationsStart } from 'opensearch-dashboards/public';
import { successNotificationToast } from '../../../utils/helpers';

export interface LogTypesProps extends RouteComponentProps {
  notifications: NotificationsStart;
}

export const LogTypes: React.FC<LogTypesProps> = ({ history, notifications }) => {
  const context = useContext(CoreServicesContext);
  const [logTypes, setLogTypes] = useState<LogType[]>([]);
  const getLogTypes = async () => {
    const logTypes = await DataStore.logTypes.getLogTypes();
    setLogTypes(logTypes);
  };

  useEffect(() => {
    context?.chrome.setBreadcrumbs([
      BREADCRUMBS.SECURITY_ANALYTICS,
      BREADCRUMBS.DETECTORS,
      BREADCRUMBS.LOG_TYPES,
    ]);

    getLogTypes();
  }, []);

  const showLogTypeDetails = useCallback((id: string) => {
    history.push(`${ROUTES.LOG_TYPES}/${id}`);
  }, []);

  return (
    <ContentPanel
      title={'Log types'}
      subTitleText={
        'Log types describe the data sources the detection rules are meant to be applied to.'
      }
      hideHeaderBorder
      actions={[
        <EuiButton fill={true} onClick={() => history.push(ROUTES.LOG_TYPES_CREATE)}>
          Create log type
        </EuiButton>,
      ]}
    >
      <EuiInMemoryTable
        items={logTypes}
        columns={getLogTypesTableColumns(showLogTypeDetails, async (id: string) => {
          const deleteSucceeded = await DataStore.logTypes.deleteLogType(id);
          if (deleteSucceeded) {
            successNotificationToast(notifications, 'deleted', 'log type');
            getLogTypes();
          }
        })}
        pagination={{
          initialPageSize: 25,
        }}
        sorting={true}
      />
    </ContentPanel>
  );
};
