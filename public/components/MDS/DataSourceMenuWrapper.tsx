/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useState } from 'react';
import { Route, Switch } from 'react-router-dom';
import {
  DataSourceManagementPluginSetup,
  DataSourceOption,
  DataSourceSelectableConfig,
  DataSourceViewConfig,
} from '../../../../../src/plugins/data_source_management/public';
import { AppMountParameters, CoreStart } from 'opensearch-dashboards/public';
import { ROUTES } from '../../utils/constants';

export interface DataSourceMenuWrapperProps {
  core: CoreStart;
  dataSourceManagement?: DataSourceManagementPluginSetup;
  setHeaderActionMenu: AppMountParameters['setHeaderActionMenu'];
}

export const DataSourceMenuWrapper: React.FC<DataSourceMenuWrapperProps> = ({
  core,
  dataSourceManagement,
  setHeaderActionMenu,
}) => {
  if (!dataSourceManagement) {
    return null;
  }

  const [activeOption, setActiveOption] = useState({ id: '', label: '', checked: '' });
  const DataSourceMenuViewComponent = dataSourceManagement.ui?.getDataSourceMenu<
    DataSourceViewConfig
  >();
  const DataSourceMenuSelectableComponent = dataSourceManagement.ui?.getDataSourceMenu<
    DataSourceSelectableConfig
  >();

  const onDataSourceSelected = useCallback(
    (sources: DataSourceOption[]) => {
      if (
        sources[0] &&
        (activeOption.id !== sources[0].id || activeOption.label !== sources[0].label)
      ) {
        setActiveOption(sources[0]);
      }
    },
    [setActiveOption, activeOption]
  );

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
                activeOption: [activeOption],
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
          ROUTES.DETECTORS_CREATE,
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
                activeOption: [activeOption],
                notifications: core.notifications,
                onSelectedDataSources: onDataSourceSelected,
                savedObjects: core.savedObjects.client,
              }}
            />
          );
        }}
      />
    </Switch>
  );
};
