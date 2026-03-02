/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
import { Switch, Route, Redirect, RouteComponentProps } from 'react-router-dom';
import {
  EuiSideNav,
  EuiPage,
  EuiPageBody,
  EuiPageSideBar,
  EuiSideNavItemType,
  EuiTitle,
  EuiSpacer,
  EuiGlobalToastList,
} from '@elastic/eui';
import { Toast } from '@opensearch-project/oui/src/eui_components/toast/global_toast_list';
import { AppMountParameters, CoreStart } from 'opensearch-dashboards/public';
import { SaContextConsumer } from '../../services';
import {
  DEFAULT_DATE_RANGE,
  DATE_TIME_FILTER_KEY,
  ROUTES,
  dataSourceObservable,
  OS_NOTIFICATION_PLUGIN,
  THREAT_INTEL_ENABLED,
  OVERVIEW_NAV_ID,
  FINDINGS_NAV_ID,
  // Wazuh: hide Alerts app in navigation.
  // THREAT_ALERTS_NAV_ID,
  // Wazuh: hide Correlations app in navigation.
  // CORRELATIONS_NAV_ID,
  DETECTORS_NAV_ID,
  DETECTION_RULE_NAV_ID,
  // Wazuh: hide Correlation rules app in navigation.
  // CORRELATIONS_RULE_NAV_ID,
  LOG_TYPES_NAV_ID,
  DECODERS_NAV_ID,
  KVDBS_NAV_ID,
  INTEGRATIONS_NAV_ID,
  LOG_TEST_NAV_ID,
} from '../../utils/constants';
import { CoreServicesConsumer } from '../../components/core_services';
import Findings from '../Findings';
import Detectors from '../Detectors';
import Overview from '../Overview';
import CreateDetector from '../CreateDetector/containers/CreateDetector';
// Wazuh: hide Alerts app and routes.
// import Alerts from "../Alerts";
import { DetectorDetails } from '../Detectors/containers/Detector/DetectorDetails';
import { UpdateDetectorBasicDetails } from '../Detectors/components/UpdateBasicDetails/UpdateBasicDetails';
import { UpdateDetectorRules } from '../Detectors/components/UpdateRules/UpdateRules';
import UpdateFieldMappings from '../Detectors/components/UpdateFieldMappings/UpdateFieldMappings';
// Wazuh: hide Alert triggers edit route.
// import UpdateAlertConditions from "../Detectors/components/UpdateAlertConditions/UpdateAlertConditions";
import { Rules } from '../Rules/containers/Rules/Rules';
import { CreateRule } from '../Rules/containers/CreateRule/CreateRule';
import { EditRule } from '../Rules/containers/EditRule/EditRule';
import { ImportRule } from '../Rules/containers/ImportRule/ImportRule';
import { DuplicateRule } from '../Rules/containers/DuplicateRule/DuplicateRule';
import Callout, { ICalloutProps } from './components/Callout';
import { DataStore } from '../../store/DataStore';
// Wazuh: hide Correlations and Correlation rules routes.
// import { CreateCorrelationRule } from "../Correlations/containers/CreateCorrelationRule";
// import { CorrelationRules } from "../Correlations/containers/CorrelationRules";
// import { Correlations } from "../Correlations/containers/CorrelationsContainer";
// import { LogTypes } from "../LogTypes/containers/LogTypes";
// import { LogType } from "../LogTypes/containers/LogType";
// import { CreateLogType } from "../LogTypes/containers/CreateLogType";
import { Integrations } from '../Integrations/containers/Integrations';
import { Integration } from '../Integrations/containers/Integration';
import { CreateIntegration } from '../Integrations/containers/CreateIntegration';
import Decoders from '../Decoders';
import { KVDBs } from '../KVDBs/containers/KVDBs';
import { KVDBFormPage } from '../KVDBs/containers/KVDBFormPage';
import { LogTest } from '../LogTest/containers/LogTest';
import {
  DataSourceContextType,
  DateTimeFilter,
  ShowFlyoutDataType,
  SecurityAnalyticsContextType,
  FlyoutPropsType,
} from '../../../types';
import { DataSourceManagementPluginSetup } from '../../../../../src/plugins/data_source_management/public';
import { DataSourceMenuWrapper } from '../../components/MDS/DataSourceMenuWrapper';
import { DataSourceOption } from 'src/plugins/data_source_management/public/components/data_source_menu/types';
import { DataSourceContext, DataSourceContextConsumer } from '../../services/DataSourceContext';
import { dataSourceInfo, getApplication, getUseUpdatedUx } from '../../services/utils/constants';
import { ThreatIntelOverview } from '../ThreatIntel/containers/Overview/ThreatIntelOverview';
import { AddThreatIntelSource } from '../ThreatIntel/containers/AddThreatIntelSource/AddThreatIntelSource';
import { ThreatIntelScanConfigForm } from '../ThreatIntel/containers/ScanConfiguration/ThreatIntelScanConfigForm';
import { ThreatIntelSource } from '../ThreatIntel/containers/ThreatIntelSource/ThreatIntelSource';
import { parse } from 'query-string';
import {
  dataSourceFilterFn,
  getPlugins,
  setIsNotificationPluginInstalled,
} from '../../utils/helpers';
import { GettingStartedContent } from '../Overview/components/GettingStarted/GettingStartedContent';
import { BrowserServices } from '../../models/interfaces';
import { CHANNEL_TYPES } from '../CreateDetector/components/ConfigureAlerts/utils/constants';
import { PromoteIntegration } from '../Integrations/containers/PromoteIntegration';
import { DecoderFormPage } from '../Decoders/containers/DecoderFormPage';

enum Navigation {
  SecurityAnalytics = 'Security Analytics',
  Findings = 'Findings',
  Detectors = 'Detectors',
  Rules = 'Detection rules',
  Overview = 'Overview',
  // Wazuh: hide Alerts/Correlations navigation items.
  // Alerts = "Alerts",
  // Correlations = "Correlations",
  // CorrelationRules = "Correlation rules",
  LogTypes = 'Integrations', // Replace Log Types to Integrations by Wazuh
  Integrations = 'Integrations', // Integrations by Wazuh
  // Removed Threat Intel from side nav by Wazuh
  // Wazuh: hide Alerts/Correlations navigation items.
  // Insights = "Insights",
  Detection = 'Detection',
  // Wazuh
  Normalization = 'Normalization',
  Decoders = 'Decoders',
  KVDBS = 'KVDBs',
  LogTest = 'Log test',
}

/**
 * Add here the ROUTES for pages on which the EuiPageSideBar should NOT be displayed.
 */
const HIDDEN_NAV_ROUTES: string[] = [
  ROUTES.DETECTORS_CREATE,
  ROUTES.RULES_CREATE,
  ROUTES.RULES_EDIT,
  ROUTES.RULES_DUPLICATE,
  ROUTES.RULES_IMPORT,
  ROUTES.EDIT_DETECTOR_DETAILS,
  ROUTES.EDIT_DETECTOR_RULES,
  ROUTES.EDIT_FIELD_MAPPINGS,
  // Wazuh: hide Alert triggers edit route in nav.
  // ROUTES.EDIT_DETECTOR_ALERT_TRIGGERS,
  `${ROUTES.LOG_TYPES}/.+`,
  ROUTES.LOG_TYPES_CREATE,
  ROUTES.INTEGRATIONS_CREATE,
  ROUTES.PROMOTE,
  ROUTES.THREAT_INTEL_ADD_CUSTOM_SOURCE,
  ROUTES.THREAT_INTEL_CREATE_SCAN_CONFIG,
  ROUTES.THREAT_INTEL_EDIT_SCAN_CONFIG,
  ROUTES.DECODERS_CREATE,
  ROUTES.DECODERS_EDIT,
  ROUTES.KVDBS_CREATE,
  ROUTES.KVDBS_EDIT,
];

interface MainProps extends RouteComponentProps {
  landingPage: string;
  setActionMenu: AppMountParameters['setHeaderActionMenu'];
  multiDataSourceEnabled: boolean;
  dataSourceManagement?: DataSourceManagementPluginSetup;
  services: BrowserServices;
}

interface MainState {
  getStartedDismissedOnce: boolean;
  selectedNavItemId: Navigation;
  dateTimeFilter: DateTimeFilter;
  callout?: ICalloutProps;
  toasts?: Toast[];
  showFlyoutData: ShowFlyoutDataType<FlyoutPropsType> | null;
  selectedDataSource: DataSourceOption;
  dataSourceLoading: boolean;
  dataSourceMenuReadOnly: boolean;
}
/**
 *
 */

const navItemIdByRoute: { [route: string]: Navigation } = {
  [ROUTES.OVERVIEW]: Navigation.Overview,
  [ROUTES.FINDINGS]: Navigation.Findings,
  // Wazuh: hide Alerts route mapping.
  // [ROUTES.ALERTS]: Navigation.Alerts,
  [ROUTES.DETECTORS]: Navigation.Detectors,
  [ROUTES.RULES]: Navigation.Rules,
  // Wazuh: hide Log types and add Wazuh integrations route mapping.
  // [ROUTES.LOG_TYPES]: Navigation.LogTypes,
  [ROUTES.INTEGRATIONS]: Navigation.Integrations,
  [ROUTES.DECODERS]: Navigation.Decoders,
  [ROUTES.KVDBS]: Navigation.KVDBS,
  [ROUTES.LOG_TEST]: Navigation.LogTest,
};

// Wazuh
const generateAppPath = (path: string) => `#${path}`;

export default class Main extends Component<MainProps, MainState> {
  constructor(props: MainProps) {
    super(props);
    const cachedDateTimeFilter = localStorage?.getItem(DATE_TIME_FILTER_KEY);
    const defaultDateTimeFilter = cachedDateTimeFilter
      ? JSON.parse(cachedDateTimeFilter)
      : {
          startTime: DEFAULT_DATE_RANGE.start,
          endTime: DEFAULT_DATE_RANGE.end,
        };
    let dataSourceId = '';
    let dataSourceLabel = '';
    if (props.multiDataSourceEnabled) {
      const {
        dataSourceId: parsedDataSourceId,
        dataSourceLabel: parsedDataSourceLabel,
      } = parse(this.props.location.search, { decode: false }) as {
        dataSourceId: string;
        dataSourceLabel: string;
      };
      dataSourceId = parsedDataSourceId;
      dataSourceLabel = parsedDataSourceLabel || '';
    }

    this.state = {
      getStartedDismissedOnce: false,
      selectedNavItemId: Navigation.Overview,
      dateTimeFilter: defaultDateTimeFilter,
      showFlyoutData: null,
      /**
       * undefined: need data source picker to help to determine which data source to use.
       * empty string: using the local cluster.
       * string: using the selected data source.
       */
      dataSourceLoading: dataSourceId === undefined ? props.multiDataSourceEnabled : false,
      selectedDataSource: { id: dataSourceId },
      dataSourceMenuReadOnly: false,
    };
    DataStore.detectors.setHandlers(this.showCallout, this.showToast);
    DataStore.findings.setFlyoutCallback(this.showFlyout);
  }

  showFlyout = (flyoutData: ShowFlyoutDataType<FlyoutPropsType> | null) => {
    this.setState({
      showFlyoutData: flyoutData,
    });
  };

  showCallout = (callout?: ICalloutProps) => {
    this.setState({
      callout,
    });
  };

  showToast = (toasts?: any[]) => {
    this.setState({
      toasts,
    });
  };

  componentDidMount(): void {
    this.updateSelectedNavItem();
  }

  componentDidUpdate(
    prevProps: Readonly<MainProps>,
    prevState: Readonly<MainState>,
    snapshot?: any
  ): void {
    const pathnameChanged = this.props.location.pathname !== prevProps.location.pathname;

    if (pathnameChanged || this.state.selectedDataSource.id !== prevState.selectedDataSource.id) {
      const searchParams = new URLSearchParams(this.props.location.search);
      searchParams.set('dataSourceId', this.state.selectedDataSource.id);
      this.props.history.replace(
        {
          ...this.props.location,
          search: searchParams.toString(),
        },
        this.props.location.state
      );
    }

    if (pathnameChanged) {
      this.updateSelectedNavItem();
    }
  }

  setDateTimeFilter = (dateTimeFilter: DateTimeFilter) => {
    this.setState({
      dateTimeFilter,
    });
    localStorage?.setItem(DATE_TIME_FILTER_KEY, JSON.stringify(dateTimeFilter));
  };

  /**
   * Returns current component route's side nav id
   * @return {string}
   */
  getCurrentRouteId = (): Navigation | undefined => {
    let navItemId: Navigation | undefined;
    const pathname = this.props.location.pathname;
    for (const [route, routeId] of Object.entries(navItemIdByRoute)) {
      if (pathname.match(new RegExp(`^${route}`))) {
        navItemId = routeId;
        break;
      }
    }

    return navItemId;
  };

  updateSelectedNavItem() {
    const navItemId = this.getCurrentRouteId();

    if (navItemId) {
      this.setState({ selectedNavItemId: navItemId });
    }

    if (this.props.location.pathname.includes('detector-details')) {
      this.setState({ selectedNavItemId: navItemIdByRoute[ROUTES.DETECTORS] });
    }
  }

  setGetStartedDismissedOnce = () => {
    this.setState({ getStartedDismissedOnce: true });
  };

  onDataSourceSelected = (sources: DataSourceOption[]) => {
    const { selectedDataSource: dataSource, dataSourceLoading } = this.state;
    const { services } = this.props;
    if (
      sources[0] &&
      (dataSource?.id !== sources[0].id || dataSource?.label !== sources[0].label)
    ) {
      dataSourceInfo.activeDataSource = sources[0];
      this.setState({
        selectedDataSource: { ...sources[0] },
      });
      dataSourceObservable.next(dataSourceInfo.activeDataSource);

      services.notificationsService.getServerFeatures().then((response) => {
        if (response.ok) {
          CHANNEL_TYPES.splice(0, CHANNEL_TYPES.length, ...response.response);
        }
      });

      getPlugins(services.opensearchService).then((plugins): void => {
        setIsNotificationPluginInstalled(plugins.includes(OS_NOTIFICATION_PLUGIN));
      });

      DataStore.logTypes.getLogTypes();
    }

    if (dataSourceLoading) {
      this.setState({ dataSourceLoading: false });
    }
  };

  setDataSourceMenuReadOnly = (readOnly: boolean) => {
    this.setState({ dataSourceMenuReadOnly: readOnly });
  };

  getSideNavItems = () => {
    const { history } = this.props;

    const { selectedNavItemId } = this.state;

    return [
      {
        name: Navigation.SecurityAnalytics,
        id: Navigation.SecurityAnalytics,
        renderItem: () => {
          return (
            <>
              <EuiTitle size="xs">
                <h3>{Navigation.SecurityAnalytics}</h3>
              </EuiTitle>
              <EuiSpacer />
            </>
          );
        },
        items: [
          {
            name: Navigation.Overview,
            id: Navigation.Overview,
            onClick: () => {
              // this.setState({ selectedNavItemId: Navigation.Overview });
              // history.push(ROUTES.OVERVIEW);
              // Wazuh: navigate to app so this is highlighted in the sidebar menu
              getApplication().navigateToApp(OVERVIEW_NAV_ID, {
                path: generateAppPath(ROUTES.OVERVIEW),
              });
            },
            isSelected: selectedNavItemId === Navigation.Overview,
          },
          ...(THREAT_INTEL_ENABLED
            ? [
                {
                  name: Navigation.ThreatIntel,
                  id: Navigation.ThreatIntel,
                  onClick: () => {
                    this.setState({
                      selectedNavItemId: Navigation.ThreatIntel,
                    });
                    history.push(ROUTES.THREAT_INTEL_OVERVIEW);
                  },
                  isSelected: selectedNavItemId === Navigation.ThreatIntel,
                },
              ]
            : []),
          {
            name: Navigation.Findings,
            id: Navigation.Findings,
            onClick: () => {
              // this.setState({ selectedNavItemId: Navigation.Findings });
              // history.push(ROUTES.FINDINGS);
              // Wazuh: navigate to app so this is highlighted in the sidebar menu (old)
              getApplication().navigateToApp(FINDINGS_NAV_ID, {
                path: generateAppPath(ROUTES.FINDINGS),
              });
            },
            isSelected: selectedNavItemId === Navigation.Findings,
          },
          // Wazuh: hide Insights category and Alerts/Correlations nav items.
          // {
          //   name: Navigation.Insights,
          //   id: Navigation.Insights,
          //   forceOpen: true,
          //   items: [
          //     {
          //       name: Navigation.Findings,
          //       id: Navigation.Findings,
          //       onClick: () => {
          //         // this.setState({ selectedNavItemId: Navigation.Findings });
          //         // history.push(ROUTES.FINDINGS);
          //         // Wazuh: navigate to app so this is highlighted in the sidebar menu (old)
          //         getApplication().navigateToApp(FINDINGS_NAV_ID, {path: generateAppPath(ROUTES.FINDINGS)});
          //       },
          //       isSelected: selectedNavItemId === Navigation.Findings,
          //     },
          //     {
          //       name: Navigation.Alerts,
          //       id: Navigation.Alerts,
          //       onClick: () => {
          //         // this.setState({ selectedNavItemId: Navigation.Alerts });
          //         // history.push(ROUTES.ALERTS);
          //         // Wazuh: navigate to app so this is highlighted in the sidebar menu (old)
          //         getApplication().navigateToApp(THREAT_ALERTS_NAV_ID, {path: generateAppPath(ROUTES.ALERTS)});
          //       },
          //       isSelected: selectedNavItemId === Navigation.Alerts,
          //     },
          //     {
          //       name: Navigation.Correlations,
          //       id: Navigation.Correlations,
          //       onClick: () => {
          //         // this.setState({ selectedNavItemId: Navigation.Correlations });
          //         // history.push(ROUTES.CORRELATIONS);
          //         // Wazuh: navigate to app so this is highlighted in the sidebar menu (old)
          //         getApplication().navigateToApp(CORRELATIONS_NAV_ID, {path: generateAppPath(ROUTES.CORRELATIONS)});
          //       },
          //       isSelected: selectedNavItemId === Navigation.Correlations,
          //     },
          //   ],
          // },
          {
            name: Navigation.Integrations,
            id: Navigation.Integrations,
            onClick: () => {
              // this.setState({ selectedNavItemId: Navigation.Integrations });
              // history.push(ROUTES.INTEGRATIONS);
              // Wazuh: navigate to app so this is highlighted in the sidebar menu (old)
              getApplication().navigateToApp(INTEGRATIONS_NAV_ID, {
                path: generateAppPath(ROUTES.INTEGRATIONS),
              });
              if (history.location.pathname !== ROUTES.INTEGRATIONS) {
                history.push(ROUTES.INTEGRATIONS);
              }
            },
            isSelected: selectedNavItemId === Navigation.Integrations,
          },
          /**** Wazuh Replace LogTypes entry for Wazuh integrations 
          {
            name: Navigation.LogTypes,
            id: Navigation.LogTypes,
            onClick: () => {
              // this.setState({ selectedNavItemId: Navigation.LogTypes });
              // history.push(ROUTES.LOG_TYPES);
              // Wazuh: navigate to app so this is highlighted in the sidebar menu (old)
              getApplication().navigateToApp(LOG_TYPES_NAV_ID, {
                path: generateAppPath(ROUTES.LOG_TYPES),
              });
            },
            isSelected: selectedNavItemId === Navigation.LogTypes,
          },
          */
          {
            name: Navigation.Normalization,
            id: Navigation.Normalization,
            forceOpen: true,
            items: [
              {
                name: Navigation.Decoders,
                id: Navigation.Decoders,
                onClick: () => {
                  // this.setState({ selectedNavItemId: Navigation.Decoders });
                  // history.push(ROUTES.DECODERS);
                  getApplication().navigateToApp(DECODERS_NAV_ID, {
                    path: generateAppPath(ROUTES.DECODERS),
                  });
                },
                isSelected: selectedNavItemId === Navigation.Decoders,
              },
              {
                name: Navigation.KVDBS,
                id: Navigation.KVDBS,
                onClick: () => {
                  // this.setState({ selectedNavItemId: Navigation.KVDBS });
                  // history.push(ROUTES.KVDBS);
                  // Wazuh: navigate to app so this is highlighted in the sidebar menu
                  getApplication().navigateToApp(KVDBS_NAV_ID, {
                    path: generateAppPath(ROUTES.KVDBS),
                  });
                },
                isSelected: selectedNavItemId === Navigation.KVDBS,
              },
            ],
            // onClick: () => {
            //   /* WORKAROUND: redirect to Normalization app registered by wazuh plugin.
            //   This view should be moved to this plugin.
            //   */

            //   // this.setState({ selectedNavItemId: Navigation.Normalization });
            //   // history.push(ROUTES.NORMALIZATION);
            // },
            // isSelected: selectedNavItemId === Navigation.Normalization,
          },
          {
            name: Navigation.Detection,
            id: Navigation.Detection,
            forceOpen: true,
            items: [
              {
                name: Navigation.Detectors,
                id: Navigation.Detectors,
                onClick: () => {
                  // this.setState({ selectedNavItemId: Navigation.Detectors });
                  // history.push(ROUTES.DETECTORS);
                  // Wazuh: navigate to app so this is highlighted in the sidebar menu (old)
                  getApplication().navigateToApp(DETECTORS_NAV_ID, {
                    path: generateAppPath(ROUTES.DETECTORS),
                  });
                },
                isSelected: selectedNavItemId === Navigation.Detectors,
              },
              {
                name: Navigation.Rules,
                id: Navigation.Rules,
                onClick: () => {
                  // this.setState({ selectedNavItemId: Navigation.Rules });
                  // history.push(ROUTES.RULES);
                  // Wazuh: navigate to app so this is highlighted in the sidebar menu (old)
                  getApplication().navigateToApp(DETECTION_RULE_NAV_ID, {
                    path: generateAppPath(ROUTES.RULES),
                  });
                },
                isSelected: selectedNavItemId === Navigation.Rules,
              },
              // Wazuh: hide Correlation rules nav item.
              // {
              //   name: Navigation.CorrelationRules,
              //   id: Navigation.CorrelationRules,
              //   onClick: () => {
              //     // this.setState({
              //     //   selectedNavItemId: Navigation.CorrelationRules,
              //     // });
              //     // history.push(ROUTES.CORRELATION_RULES);
              //     // Wazuh: navigate to app so this is highlighted in the sidebar menu (old)
              //     getApplication().navigateToApp(CORRELATIONS_RULE_NAV_ID, {path: generateAppPath(ROUTES.CORRELATION_RULES)});
              //   },
              //   isSelected: selectedNavItemId === Navigation.CorrelationRules,
              // },
            ],
          },
          {
            name: Navigation.LogTest,
            id: Navigation.LogTest,
            onClick: () => {
              getApplication().navigateToApp(LOG_TEST_NAV_ID, {
                path: generateAppPath(ROUTES.LOG_TEST),
              });
            },
            isSelected: selectedNavItemId === Navigation.LogTest,
          },
        ],
      },
    ];
  };

  render() {
    const {
      landingPage,
      location: { pathname },
      history,
      multiDataSourceEnabled,
      dataSourceManagement,
      setActionMenu,
    } = this.props;

    const {
      callout,
      showFlyoutData,
      selectedDataSource,
      dataSourceLoading,
      dataSourceMenuReadOnly,
    } = this.state;
    const sideNav: EuiSideNavItemType<{ style: any }>[] = this.getSideNavItems();
    const isDecodersRoute = !!pathname.match(new RegExp(`^${ROUTES.DECODERS}`));
    const showDataSourceMenu = multiDataSourceEnabled && !isDecodersRoute;
    const shouldBlockForDataSource = dataSourceLoading && !isDecodersRoute;
    const dataSourceContextValue: DataSourceContextType = {
      dataSource: selectedDataSource,
      setDataSource: this.onDataSourceSelected,
      setDataSourceMenuReadOnly: this.setDataSourceMenuReadOnly,
    };

    return (
      <CoreServicesConsumer>
        {(core: CoreStart | null) =>
          core && (
            <SaContextConsumer>
              {(saContext: SecurityAnalyticsContextType | null) => {
                const services = saContext?.services;
                const metrics = saContext?.metrics!;
                return (
                  <DataSourceContext.Provider value={dataSourceContextValue}>
                    <DataSourceContextConsumer>
                      {(_dataSource: DataSourceContextType | null) =>
                        _dataSource && (
                          <>
                            {showDataSourceMenu && (
                              <DataSourceMenuWrapper
                                {...this.props}
                                dataSourceManagement={dataSourceManagement}
                                core={core}
                                dataSourceLoading={this.state.dataSourceLoading}
                                dataSourceMenuReadOnly={dataSourceMenuReadOnly}
                                setHeaderActionMenu={setActionMenu}
                                dataSourceFilterFn={dataSourceFilterFn}
                              />
                            )}
                            {!shouldBlockForDataSource && services && (
                              <EuiPage restrictWidth={'100%'}>
                                {/* Hide side navigation bar when on any HIDDEN_NAV_ROUTES pages. */}
                                {!HIDDEN_NAV_ROUTES.some((route) => pathname.match(route)) &&
                                  !core.chrome.navGroup.getNavGroupEnabled() && (
                                    <EuiPageSideBar style={{ minWidth: 200 }}>
                                      <EuiSideNav style={{ width: 200 }} items={sideNav} />
                                    </EuiPageSideBar>
                                  )}
                                <EuiPageBody>
                                  {callout ? <Callout {...callout} /> : null}
                                  {showFlyoutData ? (
                                    <showFlyoutData.component
                                      {...showFlyoutData.componentProps}
                                      history={history}
                                    />
                                  ) : null}
                                  <Switch>
                                    <Route
                                      path={`${ROUTES.FINDINGS}/:detectorId?`}
                                      render={(props: RouteComponentProps) => (
                                        <Findings
                                          {...props}
                                          setDateTimeFilter={this.setDateTimeFilter}
                                          dateTimeFilter={this.state.dateTimeFilter}
                                          opensearchService={services.opensearchService}
                                          detectorService={services.detectorsService}
                                          indexPatternsService={services.indexPatternsService}
                                          notifications={core?.notifications}
                                          dataSource={selectedDataSource}
                                        />
                                      )}
                                    />
                                    <Route
                                      path={ROUTES.DETECTORS}
                                      render={(props: RouteComponentProps) => (
                                        <Detectors
                                          {...props}
                                          detectorService={services.detectorsService}
                                          notifications={core?.notifications}
                                          dataSource={selectedDataSource}
                                        />
                                      )}
                                    />
                                    <Route
                                      path={ROUTES.DETECTORS_CREATE}
                                      render={(props: RouteComponentProps) => (
                                        <CreateDetector
                                          {...props}
                                          isEdit={false}
                                          services={services}
                                          metrics={metrics}
                                          history={props.history}
                                          notifications={core?.notifications}
                                          dataSource={selectedDataSource}
                                          setDataSource={this.onDataSourceSelected}
                                          setDataSourceMenuReadOnly={this.setDataSourceMenuReadOnly}
                                        />
                                      )}
                                    />
                                    <Route
                                      path={ROUTES.RULES}
                                      render={(props: RouteComponentProps) => (
                                        <Rules
                                          {...props}
                                          notifications={core?.notifications}
                                          dataSource={selectedDataSource}
                                        />
                                      )}
                                    />
                                    <Route
                                      path={ROUTES.RULES_CREATE}
                                      render={(props: RouteComponentProps) => (
                                        <CreateRule
                                          services={services}
                                          history={props.history}
                                          notifications={core?.notifications}
                                        />
                                      )}
                                    />
                                    <Route
                                      path={ROUTES.RULES_EDIT}
                                      render={(props: RouteComponentProps<any, any, any>) => {
                                        if (!props.location.state?.ruleItem) {
                                          props.history.replace(ROUTES.RULES);
                                          return (
                                            <Rules
                                              {...props}
                                              notifications={core?.notifications}
                                              dataSource={selectedDataSource}
                                            />
                                          );
                                        }

                                        return (
                                          <EditRule
                                            services={services}
                                            {...props}
                                            notifications={core?.notifications}
                                          />
                                        );
                                      }}
                                    />
                                    <Route
                                      path={ROUTES.RULES_DUPLICATE}
                                      render={(props: RouteComponentProps<any, any, any>) => {
                                        if (!props.location.state?.ruleItem) {
                                          props.history.replace(ROUTES.RULES);
                                          return (
                                            <Rules
                                              {...props}
                                              notifications={core?.notifications}
                                              dataSource={selectedDataSource}
                                            />
                                          );
                                        }

                                        return (
                                          <DuplicateRule
                                            services={services}
                                            {...props}
                                            notifications={core?.notifications}
                                          />
                                        );
                                      }}
                                    />
                                    <Route
                                      path={ROUTES.RULES_IMPORT}
                                      render={(props: RouteComponentProps) => (
                                        <ImportRule
                                          services={services}
                                          history={props.history}
                                          notifications={core?.notifications}
                                        />
                                      )}
                                    />
                                    <Route
                                      path={ROUTES.OVERVIEW}
                                      render={(props: RouteComponentProps) => (
                                        <Overview
                                          {...props}
                                          setDateTimeFilter={this.setDateTimeFilter}
                                          dateTimeFilter={this.state.dateTimeFilter}
                                          getStartedDismissedOnce={
                                            this.state.getStartedDismissedOnce
                                          }
                                          onGetStartedDismissed={this.setGetStartedDismissedOnce}
                                          notifications={core?.notifications}
                                          dataSource={selectedDataSource}
                                        />
                                      )}
                                    />
                                    {getUseUpdatedUx() && (
                                      <Route
                                        path={ROUTES.GETTING_STARTED}
                                        render={(props: RouteComponentProps) => (
                                          <GettingStartedContent
                                            {...props}
                                            onStepClicked={() => {}}
                                          />
                                        )}
                                      />
                                    )}
                                    {/* Wazuh: hide Alerts route. */}
                                    {/* <Route
                                      path={`${ROUTES.ALERTS}/:detectorId?`}
                                      render={(props: RouteComponentProps) => (
                                        <Alerts
                                          {...props}
                                          setDateTimeFilter={
                                            this.setDateTimeFilter
                                          }
                                          dateTimeFilter={
                                            this.state.dateTimeFilter
                                          }
                                          alertService={services.alertService}
                                          detectorService={
                                            services.detectorsService
                                          }
                                          findingService={
                                            services.findingsService
                                          }
                                          notifications={core?.notifications}
                                          opensearchService={
                                            services.opensearchService
                                          }
                                          indexPatternService={
                                            services.indexPatternsService
                                          }
                                          correlationService={
                                            services.correlationsService
                                          }
                                          dataSource={selectedDataSource}
                                        />
                                      )}
                                    /> */}
                                    <Route
                                      path={`${ROUTES.DETECTOR_DETAILS}/:id`}
                                      render={(props: RouteComponentProps<{}, any, any>) => (
                                        <DetectorDetails
                                          detectorService={services.detectorsService}
                                          savedObjectsService={services.savedObjectsService}
                                          indexPatternsService={services.indexPatternsService}
                                          {...props}
                                          notifications={core?.notifications}
                                        />
                                      )}
                                    />
                                    <Route
                                      path={`${ROUTES.EDIT_DETECTOR_DETAILS}/:id`}
                                      render={(props: RouteComponentProps<any, any, any>) => (
                                        <UpdateDetectorBasicDetails
                                          {...props}
                                          notifications={core?.notifications}
                                        />
                                      )}
                                    />
                                    <Route
                                      path={`${ROUTES.EDIT_DETECTOR_RULES}/:id`}
                                      render={(props: RouteComponentProps<any, any, any>) => (
                                        <UpdateDetectorRules
                                          {...props}
                                          notifications={core?.notifications}
                                        />
                                      )}
                                    />
                                    <Route
                                      path={`${ROUTES.EDIT_FIELD_MAPPINGS}/:id`}
                                      render={(props: RouteComponentProps<any, any, any>) => (
                                        <UpdateFieldMappings
                                          {...props}
                                          fieldMappingService={services.fieldMappingService}
                                          detectorService={services.detectorsService}
                                          notifications={core?.notifications}
                                        />
                                      )}
                                    />
                                    {/* Wazuh: hide Alert triggers edit route. */}
                                    {/* <Route
                                      path={`${ROUTES.EDIT_DETECTOR_ALERT_TRIGGERS}/:id`}
                                      render={(
                                        props: RouteComponentProps<
                                          any,
                                          any,
                                          any
                                        >,
                                      ) => (
                                        <UpdateAlertConditions
                                          {...props}
                                          detectorService={
                                            services.detectorsService
                                          }
                                          notificationsService={
                                            services.notificationsService
                                          }
                                          notifications={core?.notifications}
                                          opensearchService={
                                            services.opensearchService
                                          }
                                        />
                                      )}
                                    /> */}
                                    {/* Wazuh: hide Correlations and Correlation rules routes. */}
                                    {/* <Route
                                      path={`${ROUTES.CORRELATION_RULES}`}
                                      render={(
                                        props: RouteComponentProps<
                                          any,
                                          any,
                                          any
                                        >,
                                      ) => (
                                        <CorrelationRules
                                          {...props}
                                          dataSource={selectedDataSource}
                                        />
                                      )}
                                    />
                                    <Route
                                      path={`${ROUTES.CORRELATION_RULE_CREATE}`}
                                      render={(
                                        props: RouteComponentProps<
                                          any,
                                          any,
                                          any
                                        >,
                                      ) => (
                                        <CreateCorrelationRule
                                          {...props}
                                          indexService={services.indexService}
                                          fieldMappingService={
                                            services.fieldMappingService
                                          }
                                          notifications={core?.notifications}
                                          dataSource={selectedDataSource}
                                          notificationsService={
                                            services?.notificationsService
                                          }
                                          opensearchService={
                                            services?.opensearchService
                                          }
                                        />
                                      )}
                                    />
                                    <Route
                                      path={`${ROUTES.CORRELATION_RULE_EDIT}/:ruleId`}
                                      render={(
                                        props: RouteComponentProps<
                                          any,
                                          any,
                                          any
                                        >,
                                      ) => (
                                        <CreateCorrelationRule
                                          {...props}
                                          indexService={services.indexService}
                                          fieldMappingService={
                                            services.fieldMappingService
                                          }
                                          notifications={core?.notifications}
                                          dataSource={selectedDataSource}
                                          notificationsService={
                                            services?.notificationsService
                                          }
                                          opensearchService={
                                            services?.opensearchService
                                          }
                                        />
                                      )}
                                    />
                                    <Route
                                      path={`${ROUTES.CORRELATIONS}`}
                                      render={(
                                        props: RouteComponentProps<
                                          any,
                                          any,
                                          any
                                        >,
                                      ) => {
                                        return (
                                          <Correlations
                                            {...props}
                                            history={props.history}
                                            onMount={() =>
                                              this.setState({
                                                selectedNavItemId:
                                                  Navigation.Correlations,
                                              })
                                            }
                                            dateTimeFilter={
                                              this.state.dateTimeFilter
                                            }
                                            setDateTimeFilter={
                                              this.setDateTimeFilter
                                            }
                                            dataSource={selectedDataSource}
                                            notifications={core?.notifications}
                                          />
                                        );
                                      }}
                                    /> */}
                                    {/* Wazuh: hide Log Types routes. */}
                                    {/*
                                    <Route
                                      path={`${ROUTES.LOG_TYPES}/:logTypeId`}
                                      render={(
                                        props: RouteComponentProps<
                                          any,
                                          any,
                                          any
                                        >,
                                      ) => (
                                        <LogType
                                          notifications={core?.notifications}
                                          {...props}
                                        />
                                      )}
                                    />
                                    <Route
                                      path={`${ROUTES.LOG_TYPES}`}
                                      render={(
                                        props: RouteComponentProps<
                                          any,
                                          any,
                                          any
                                        >,
                                      ) => {
                                        return (
                                          <LogTypes
                                            notifications={core?.notifications}
                                            {...props}
                                            dataSource={selectedDataSource}
                                          />
                                        );
                                      }}
                                    />
                                    <Route
                                      path={ROUTES.LOG_TYPES_CREATE}
                                      render={(
                                        props: RouteComponentProps<
                                          any,
                                          any,
                                          any
                                        >,
                                      ) => {
                                        return (
                                          <CreateLogType
                                            notifications={core?.notifications}
                                            {...props}
                                          />
                                        );
                                      }}
                                    /> */}
                                    <Route
                                      path={`${ROUTES.INTEGRATIONS}/:integrationId`}
                                      render={(props: RouteComponentProps<any, any, any>) => (
                                        <Integration
                                          notifications={core?.notifications}
                                          {...props}
                                        />
                                      )}
                                    />
                                    <Route
                                      path={`${ROUTES.INTEGRATIONS}`}
                                      render={(props: RouteComponentProps<any, any, any>) => {
                                        return (
                                          <Integrations
                                            notifications={core?.notifications}
                                            {...props}
                                            dataSource={selectedDataSource}
                                          />
                                        );
                                      }}
                                    />
                                    <Route
                                      path={ROUTES.INTEGRATIONS_CREATE}
                                      render={(props: RouteComponentProps<any, any, any>) => {
                                        return (
                                          <CreateIntegration
                                            notifications={core?.notifications}
                                            {...props}
                                          />
                                        );
                                      }}
                                    />
                                    <Route
                                      path={ROUTES.PROMOTE}
                                      render={(props: RouteComponentProps<any, any, any>) => {
                                        return (
                                          <PromoteIntegration
                                            notifications={core?.notifications}
                                            {...props}
                                          />
                                        );
                                      }}
                                    />
                                    <Route
                                      path={ROUTES.DECODERS}
                                      render={(props: RouteComponentProps) => (
                                        <Decoders {...props} notifications={core?.notifications} />
                                      )}
                                    />
                                    <Route
                                      path={ROUTES.DECODERS_CREATE}
                                      render={(props: RouteComponentProps) => (
                                        <DecoderFormPage
                                          {...props}
                                          notifications={core?.notifications}
                                          action="create"
                                          history={props.history}
                                        />
                                      )}
                                    />
                                    <Route
                                      path={`${ROUTES.DECODERS_EDIT}/:id`}
                                      render={(
                                        props: RouteComponentProps<{
                                          id: string;
                                        }>
                                      ) => (
                                        <DecoderFormPage
                                          {...props}
                                          notifications={core?.notifications}
                                          action="edit"
                                          history={props.history}
                                        />
                                      )}
                                    />
                                    <Route
                                      path={ROUTES.KVDBS_CREATE}
                                      render={(props: RouteComponentProps) => (
                                        <KVDBFormPage
                                          {...props}
                                          notifications={core?.notifications}
                                          action="create"
                                          history={props.history}
                                        />
                                      )}
                                    />
                                    <Route
                                      path={`${ROUTES.KVDBS_EDIT}/:id`}
                                      render={(
                                        props: RouteComponentProps<{
                                          id: string;
                                        }>
                                      ) => (
                                        <KVDBFormPage
                                          {...props}
                                          notifications={core?.notifications}
                                          action="edit"
                                          history={props.history}
                                        />
                                      )}
                                    />
                                    <Route
                                      path={ROUTES.KVDBS}
                                      render={(props: RouteComponentProps) => (
                                        <KVDBs {...props} notifications={core?.notifications} />
                                      )}
                                    />
                                    <Route
                                      path={ROUTES.LOG_TEST}
                                      render={(props: RouteComponentProps) => (
                                        <LogTest {...props} notifications={core?.notifications} />
                                      )}
                                    />
                                    {THREAT_INTEL_ENABLED && (
                                      <>
                                        <Route
                                          path={ROUTES.THREAT_INTEL_ADD_CUSTOM_SOURCE}
                                          render={(props) => {
                                            return (
                                              <AddThreatIntelSource
                                                {...props}
                                                threatIntelService={services.threatIntelService}
                                              />
                                            );
                                          }}
                                        />
                                        <Route
                                          path={ROUTES.THREAT_INTEL_OVERVIEW}
                                          render={(props) => {
                                            return (
                                              <ThreatIntelOverview
                                                {...props}
                                                threatIntelService={services.threatIntelService}
                                                dataSource={selectedDataSource}
                                              />
                                            );
                                          }}
                                        />
                                        <Route
                                          path={[
                                            ROUTES.THREAT_INTEL_CREATE_SCAN_CONFIG,
                                            ROUTES.THREAT_INTEL_EDIT_SCAN_CONFIG,
                                          ]}
                                          render={(props: RouteComponentProps<any, any, any>) => {
                                            return (
                                              <ThreatIntelScanConfigForm
                                                {...props}
                                                notificationsService={services.notificationsService}
                                                threatIntelService={services.threatIntelService}
                                                notifications={core.notifications}
                                              />
                                            );
                                          }}
                                        />
                                        <Route
                                          path={`${ROUTES.THREAT_INTEL_SOURCE_DETAILS}/:id`}
                                          render={(props: RouteComponentProps<any, any, any>) => {
                                            return (
                                              <ThreatIntelSource
                                                {...props}
                                                threatIntelService={services.threatIntelService}
                                                notifications={core.notifications}
                                              />
                                            );
                                          }}
                                        />
                                      </>
                                    )}

                                    <Redirect from={'/'} to={landingPage} />
                                  </Switch>
                                </EuiPageBody>
                                <EuiGlobalToastList
                                  toasts={this.state.toasts}
                                  dismissToast={DataStore.detectors.hideToast}
                                  toastLifeTimeMs={6000}
                                />
                              </EuiPage>
                            )}
                          </>
                        )
                      }
                    </DataSourceContextConsumer>
                  </DataSourceContext.Provider>
                );
              }}
            </SaContextConsumer>
          )
        }
      </CoreServicesConsumer>
    );
  }
}
