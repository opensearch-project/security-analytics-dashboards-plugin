/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import {
  EuiSmallButton,
  EuiFlexGroup,
  EuiFlexItem,
  EuiInMemoryTable,
  EuiPanel,
  EuiSpacer,
  EuiText,
} from '@elastic/eui';
import { BREADCRUMBS, ROUTES } from '../../../utils/constants';
import { DataSourceProps, LogType } from '../../../../types';
import { DataStore } from '../../../store/DataStore';
import { getLogTypesTableColumns, getLogTypesTableSearchConfig } from '../utils/helpers';
import { RouteComponentProps } from 'react-router-dom';
import { useCallback } from 'react';
import { NotificationsStart } from 'opensearch-dashboards/public';
import { setBreadcrumbs, successNotificationToast } from '../../../utils/helpers';
import { DeleteLogTypeModal } from '../components/DeleteLogTypeModal';
import { PageHeader } from '../../../components/PageHeader/PageHeader';
import { getUseUpdatedUx } from '../../../services/utils/constants';

export interface LogTypesProps extends RouteComponentProps, DataSourceProps {
  notifications: NotificationsStart;
}

export const LogTypes: React.FC<LogTypesProps> = ({ history, notifications, dataSource }) => {
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
      // Replace Log Type to Integration by Wazuh
      successNotificationToast(notifications, 'deleted', 'integration');
      getLogTypes();
    }
  };

  useEffect(() => {
    if (getUseUpdatedUx()) {
      setBreadcrumbs([BREADCRUMBS.LOG_TYPES]);
    } else {
      setBreadcrumbs([BREADCRUMBS.DETECTION, BREADCRUMBS.DETECTORS, BREADCRUMBS.LOG_TYPES]);
    }
  }, [getUseUpdatedUx()]);

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

  // Replace Log Type to Integration by Wazuh
  const createLogTypeAction = (
    <EuiSmallButton fill={true} onClick={() => history.push(ROUTES.LOG_TYPES_CREATE)}>
      Create integration
    </EuiSmallButton>
  );

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

      <EuiPanel>
        <PageHeader appRightControls={[{ renderComponent: createLogTypeAction }]}>
          <EuiFlexItem>
            <EuiFlexGroup gutterSize={'s'} justifyContent={'spaceBetween'}>
              <EuiFlexItem>
                <EuiText size="s">
                  {/* Replace Log Types to Integrations by Wazuh */}
                  <h1>Integrations</h1>
                </EuiText>
                <EuiText size="s" color="subdued">
                  Integrations describe the data sources to which the detection rules are meant to be
                  applied.
                </EuiText>
              </EuiFlexItem>
              <EuiFlexItem grow={false}>{createLogTypeAction}</EuiFlexItem>
            </EuiFlexGroup>
            <EuiSpacer size={'m'} />
          </EuiFlexItem>
        </PageHeader>
        <EuiInMemoryTable
          items={logTypes}
          columns={getLogTypesTableColumns(showLogTypeDetails, onDeleteClick)}
          pagination={{
            initialPageSize: 25,
          }}
          search={getLogTypesTableSearchConfig()}
          sorting={true}
        />
      </EuiPanel>
    </>
  );
};
