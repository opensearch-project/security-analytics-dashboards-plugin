/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useContext } from 'react';
import { Route, RouteComponentProps, Switch, matchPath } from 'react-router-dom';
import {
  DataSourceManagementPluginSetup,
  DataSourceSelectableConfig,
  DataSourceViewConfig,
} from '../../../../../src/plugins/data_source_management/public';
import { AppMountParameters, CoreStart, SavedObject } from 'opensearch-dashboards/public';
import { ROUTES } from '../../utils/constants';
import { DataSourceContext } from '../../services/DataSourceContext';
import { DataSourceAttributes } from 'src/plugins/data_source/common/data_sources';

export interface DataSourceMenuWrapperProps extends RouteComponentProps {
  core: CoreStart;
  dataSourceManagement?: DataSourceManagementPluginSetup;
  dataSourceMenuReadOnly: boolean;
  dataSourceLoading: boolean;
  setHeaderActionMenu: AppMountParameters['setHeaderActionMenu'];
  dataSourceFilterFn: (dataSource: SavedObject<DataSourceAttributes>) => boolean;
}

export const DataSourceMenuWrapper: React.FC<DataSourceMenuWrapperProps> = ({
  core,
  dataSourceManagement,
  dataSourceMenuReadOnly,
  dataSourceLoading,
  setHeaderActionMenu,
  dataSourceFilterFn,
  location,
  history,
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

  const readonlyDataSourcePaths = [
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
    `${ROUTES.THREAT_INTEL_SOURCE_DETAILS}/:sourceId`,
    ROUTES.THREAT_INTEL_EDIT_SCAN_CONFIG,
  ];

  const pathToParentMap = {
    [ROUTES.EDIT_DETECTOR_ALERT_TRIGGERS]: ROUTES.DETECTORS,
    [ROUTES.EDIT_DETECTOR_DETAILS]: ROUTES.DETECTORS,
    [ROUTES.EDIT_DETECTOR_RULES]: ROUTES.DETECTORS,
    [ROUTES.EDIT_FIELD_MAPPINGS]: ROUTES.DETECTORS,
    [ROUTES.RULES_EDIT]: ROUTES.RULES,
    [ROUTES.CORRELATION_RULE_EDIT]: ROUTES.CORRELATION_RULES,
    [ROUTES.DETECTOR_DETAILS]: ROUTES.DETECTORS,
    [`${ROUTES.LOG_TYPES}/:logTypeId`]: ROUTES.LOG_TYPES,
    [`${ROUTES.ALERTS}/:detectorId`]: ROUTES.ALERTS,
    [`${ROUTES.FINDINGS}/:detectorId`]: ROUTES.FINDINGS,
    [`${ROUTES.THREAT_INTEL_SOURCE_DETAILS}/:sourceId`]: ROUTES.THREAT_INTEL_OVERVIEW,
    [ROUTES.THREAT_INTEL_EDIT_SCAN_CONFIG]: ROUTES.THREAT_INTEL_OVERVIEW,
  };

  const matchedPath = matchPath(location.pathname, {
    path: readonlyDataSourcePaths,
  });

  if (matchedPath) {
    // should have the data source id in url, if not then redirect back to the overview or related page for each path
    const searchParams = new URLSearchParams(location.search);
    const dataSourceId = searchParams.get('dataSourceId');
    if (dataSourceId !== null && dataSourceId !== undefined) {
      setDataSource([{ id: dataSourceId }]);
    } else {
      const parentPath = pathToParentMap[matchedPath.path] || ROUTES.OVERVIEW;
      history.replace(parentPath);
    }
  }

  const activeOption = dataSourceLoading ? undefined : [dataSource];

  return (
    <Switch>
      <Route
        path={readonlyDataSourcePaths}
        render={() => {
          return (
            <DataSourceMenuViewComponent
              componentConfig={{
                fullWidth: false,
                activeOption: [dataSource],
                notifications: core.notifications,
                savedObjects: core.savedObjects.client,
                dataSourceFilter: dataSourceFilterFn,
              }}
              componentType="DataSourceView"
              setMenuMountPoint={setHeaderActionMenu}
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
                notifications: core.notifications,
                savedObjects: core.savedObjects.client,
                dataSourceFilter: dataSourceFilterFn,
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
                activeOption,
                notifications: core.notifications,
                onSelectedDataSources: setDataSource,
                savedObjects: core.savedObjects.client,
                dataSourceFilter: dataSourceFilterFn,
              }}
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
          ROUTES.GETTING_STARTED,
          ROUTES.ROOT,
        ]}
        render={() => {
          return (
            <DataSourceMenuSelectableComponent
              componentType="DataSourceSelectable"
              setMenuMountPoint={setHeaderActionMenu}
              componentConfig={{
                fullWidth: false,
                activeOption,
                notifications: core.notifications,
                onSelectedDataSources: setDataSource,
                savedObjects: core.savedObjects.client,
                dataSourceFilter: dataSourceFilterFn,
              }}
            />
          );
        }}
      />
    </Switch>
  );
};
