/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useContext } from 'react';
import { Route, Switch } from 'react-router-dom';
import {
  DataSourceManagementPluginSetup,
  DataSourceSelectableConfig,
  DataSourceViewConfig,
} from '../../../../../src/plugins/data_source_management/public';
import { AppMountParameters, CoreStart } from 'opensearch-dashboards/public';
import { ROUTES } from '../../utils/constants';
import { DataSourceContext } from '../../services/DataSourceContext';

export interface DataSourceMenuWrapperProps {
  core: CoreStart;
  dataSourceManagement?: DataSourceManagementPluginSetup;
  dataSourceMenuReadOnly: boolean;
  setHeaderActionMenu: AppMountParameters['setHeaderActionMenu'];
}

export const DataSourceMenuWrapper: React.FC<DataSourceMenuWrapperProps> = ({
  core,
  dataSourceManagement,
  dataSourceMenuReadOnly,
  setHeaderActionMenu,
}) => {
  if (!dataSourceManagement) {
    return null;
  }

  const { dataSource, setDataSource } = useContext(DataSourceContext)!;
  const DataSourceMenuViewComponent = dataSourceManagement.ui?.getDataSourceMenu<
    DataSourceViewConfig
  >();
  const DataSourceMenuSelectableComponent = dataSourceManagement.ui?.getDataSourceMenu<
    DataSourceSelectableConfig
  >();

  return (
    <Switch>
      <Route
        path={[
          ROUTES.EDIT_DETECTOR_ALERT_TRIGGERS,
          ROUTES.EDIT_DETECTOR_DETAILS,
          ROUTES.EDIT_DETECTOR_RULES,
          ROUTES.EDIT_FIELD_MAPPINGS,
          ROUTES.RULES_EDIT,
          ROUTES.CORRELATION_RULE_EDIT,
          ROUTES.DETECTOR_DETAILS,
          `${ROUTES.LOG_TYPES}/:logTypeId`,
          `${ROUTES.ALERTS}/:detectorId`,
          `${ROUTES.FINDINGS}/:detectorId`,
        ]}
        render={() => {
          return (
            <DataSourceMenuViewComponent
              componentConfig={{
                fullWidth: false,
                activeOption: [dataSource],
              }}
              componentType="DataSourceView"
              setMenuMountPoint={setHeaderActionMenu}
            />
          );
        }}
      />
      <Route
        path={[
          ROUTES.OVERVIEW,
          ROUTES.DETECTORS,
          ROUTES.ALERTS,
          ROUTES.FINDINGS,
          ROUTES.LOG_TYPES,
          ROUTES.RULES,
          ROUTES.CORRELATIONS,
          ROUTES.CORRELATION_RULES,
          ROUTES.RULES_CREATE,
          ROUTES.RULES_IMPORT,
          ROUTES.RULES_DUPLICATE,
          ROUTES.LOG_TYPES_CREATE,
          ROUTES.CORRELATION_RULE_CREATE,
        ]}
        render={() => {
          return (
            <DataSourceMenuSelectableComponent
              componentType="DataSourceSelectable"
              setMenuMountPoint={setHeaderActionMenu}
              componentConfig={{
                fullWidth: false,
                activeOption: [dataSource],
                notifications: core.notifications,
                onSelectedDataSources: setDataSource,
                savedObjects: core.savedObjects.client,
              }}
            />
          );
        }}
      />
      <Route
        path={[ROUTES.DETECTORS_CREATE]}
        render={() => {
          return dataSourceMenuReadOnly ? (
            <DataSourceMenuViewComponent
              componentConfig={{
                fullWidth: false,
                activeOption: [dataSource],
              }}
              componentType="DataSourceView"
              setMenuMountPoint={setHeaderActionMenu}
            />
          ) : (
            <DataSourceMenuSelectableComponent
              componentType="DataSourceSelectable"
              setMenuMountPoint={setHeaderActionMenu}
              componentConfig={{
                fullWidth: false,
                activeOption: [dataSource],
                notifications: core.notifications,
                onSelectedDataSources: setDataSource,
                savedObjects: core.savedObjects.client,
              }}
            />
          );
        }}
      />
    </Switch>
  );
};
