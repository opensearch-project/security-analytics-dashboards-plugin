/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useContext, useEffect, useState } from 'react';
import { EuiButton, EuiInMemoryTable } from '@elastic/eui';
import { ContentPanel } from '../../../components/ContentPanel';
import { CoreServicesContext } from '../../../components/core_services';
import { BREADCRUMBS, ROUTES } from '../../../utils/constants';
import { DataSourceProps, LogType } from '../../../../types';
import { DataStore } from '../../../store/DataStore';
import { getLogTypesTableColumns, getLogTypesTableSearchConfig } from '../utils/helpers';
import { RouteComponentProps } from 'react-router-dom';
import { useCallback } from 'react';
import { NotificationsStart } from 'opensearch-dashboards/public';
import { successNotificationToast } from '../../../utils/helpers';
import { DeleteLogTypeModal } from '../components/DeleteLogTypeModal';

export interface LogTypesProps extends RouteComponentProps, DataSourceProps {
  notifications: NotificationsStart;
}

export const LogTypes: React.FC<LogTypesProps> = ({ history, notifications, dataSource }) => {
  const context = useContext(CoreServicesContext);
  const [logTypes, setLogTypes] = useState<LogType[]>([]);
  const [logTypeToDelete, setLogTypeItemToDelete] = useState<LogType | undefined>(undefined);
  const [deletionDetails, setDeletionDetails] = useState<
    { detectionRulesCount: number } | undefined
  >(undefined);
  const getLogTypes = async () => {
    const logTypes = await DataStore.logTypes.getLogTypes();
    setLogTypes(logTypes);
  };

  const deleteLogType = async (id: string) => {
    const deleteSucceeded = await DataStore.logTypes.deleteLogType(id);
    if (deleteSucceeded) {
      successNotificationToast(notifications, 'deleted', 'log type');
      getLogTypes();
    }
  };

  useEffect(() => {
    context?.chrome.setBreadcrumbs([
      BREADCRUMBS.SECURITY_ANALYTICS,
      BREADCRUMBS.DETECTORS,
      BREADCRUMBS.LOG_TYPES,
    ]);
  }, []);

  useEffect(() => {
    getLogTypes();
  }, [dataSource]);

  const showLogTypeDetails = useCallback((id: string) => {
    history.push(`${ROUTES.LOG_TYPES}/${id}`);
  }, []);

  const onDeleteClick = async (item: LogType) => {
    setLogTypeItemToDelete(item);
    const rules = await DataStore.rules.getAllRules({
      'rule.category': [item.id],
    });
    setDeletionDetails({ detectionRulesCount: rules.length });
  };

  return (
    <>
      {logTypeToDelete && (
        <DeleteLogTypeModal
          logTypeName={logTypeToDelete.name}
          detectionRulesCount={deletionDetails?.detectionRulesCount || 0}
          loading={!deletionDetails}
          closeModal={() => setLogTypeItemToDelete(undefined)}
          onConfirm={() => deleteLogType(logTypeToDelete.id)}
        />
      )}
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
          columns={getLogTypesTableColumns(showLogTypeDetails, onDeleteClick)}
          pagination={{
            initialPageSize: 25,
          }}
          search={getLogTypesTableSearchConfig()}
          sorting={true}
        />
      </ContentPanel>
    </>
  );
};
