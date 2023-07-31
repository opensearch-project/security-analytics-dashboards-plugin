/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useContext, useEffect, useState } from 'react';
import { EuiInMemoryTable } from '@elastic/eui';
import { ContentPanel } from '../../../components/ContentPanel';
import { CoreServicesContext } from '../../../components/core_services';
import { BREADCRUMBS, ROUTES } from '../../../utils/constants';
import { LogType } from '../../../../types';
import { DataStore } from '../../../store/DataStore';
import { getLogTypesTableColumns } from '../utils/helpers';
import { RouteComponentProps } from 'react-router-dom';
import { useCallback } from 'react';

export interface LogTypesProps extends RouteComponentProps {}

export const LogTypes: React.FC<LogTypesProps> = ({ history }) => {
  const context = useContext(CoreServicesContext);
  const [logTypes, setLogTypes] = useState<LogType[]>([]);

  useEffect(() => {
    context?.chrome.setBreadcrumbs([
      BREADCRUMBS.SECURITY_ANALYTICS,
      BREADCRUMBS.DETECTORS,
      BREADCRUMBS.LOG_TYPES,
    ]);
    const getLogTypes = async () => {
      const logTypes = await DataStore.logTypes.getLogTypes();
      setLogTypes(logTypes);
    };

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
    >
      <EuiInMemoryTable
        items={logTypes}
        columns={getLogTypesTableColumns(showLogTypeDetails, (id: string) =>
          alert(`Deleted ${id}`)
        )}
        pagination={{
          initialPageSize: 25,
        }}
        sorting={true}
      />
    </ContentPanel>
  );
};
