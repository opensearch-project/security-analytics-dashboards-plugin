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
  EuiFlexGroup,
  EuiFlexItem,
} from '@elastic/eui';
import { Toast } from '@opensearch-project/oui/src/eui_components/toast/global_toast_list';
import { AppMountParameters, CoreStart } from 'opensearch-dashboards/public';
import { SaContextConsumer } from '../../services';
import {
  DEFAULT_DATE_RANGE,
  DATE_TIME_FILTER_KEY,
  ROUTES,
  dataSourceObservable,
} from '../../utils/constants';
import { CoreServicesConsumer } from '../../components/core_services';
import Findings from '../Findings';
import Detectors from '../Detectors';
import Overview from '../Overview';
import CreateDetector from '../CreateDetector/containers/CreateDetector';
import Alerts from '../Alerts';
import { DetectorDetails } from '../Detectors/containers/Detector/DetectorDetails';
import { UpdateDetectorBasicDetails } from '../Detectors/components/UpdateBasicDetails/UpdateBasicDetails';
import { UpdateDetectorRules } from '../Detectors/components/UpdateRules/UpdateRules';
import UpdateFieldMappings from '../Detectors/components/UpdateFieldMappings/UpdateFieldMappings';
import UpdateAlertConditions from '../Detectors/components/UpdateAlertConditions/UpdateAlertConditions';
import { Rules } from '../Rules/containers/Rules/Rules';
import { CreateRule } from '../Rules/containers/CreateRule/CreateRule';
import { EditRule } from '../Rules/containers/EditRule/EditRule';
import { ImportRule } from '../Rules/containers/ImportRule/ImportRule';
import { DuplicateRule } from '../Rules/containers/DuplicateRule/DuplicateRule';
import Callout, { ICalloutProps } from './components/Callout';
import { DataStore } from '../../store/DataStore';
import { CreateCorrelationRule } from '../Correlations/containers/CreateCorrelationRule';
import { CorrelationRules } from '../Correlations/containers/CorrelationRules';
import { Correlations } from '../Correlations/containers/CorrelationsContainer';
import { LogTypes } from '../LogTypes/containers/LogTypes';
import { LogType } from '../LogTypes/containers/LogType';
import { CreateLogType } from '../LogTypes/containers/CreateLogType';
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
import { dataSourceInfo, getUseUpdatedUx } from '../../services/utils/constants';
import { ThreatIntelOverview } from '../ThreatIntel/containers/Overview/ThreatIntelOverview';
import { AddThreatIntelSource } from '../ThreatIntel/containers/AddThreatIntelSource/AddThreatIntelSource';
import { ThreatIntelScanConfigForm } from '../ThreatIntel/containers/ScanConfiguration/ThreatIntelScanConfigForm';
import { ThreatIntelSource } from '../ThreatIntel/containers/ThreatIntelSource/ThreatIntelSource';
import queryString from 'query-string';
import { dataSourceFilterFn } from '../../utils/helpers';
import { GettingStartedContent } from '../Overview/components/GettingStarted/GettingStartedContent';

enum Navigation {
  SecurityAnalytics = 'Security Analytics',
  Findings = 'Findings',
  Detectors = 'Detectors',
  Rules = 'Detection rules',
  Overview = 'Overview',
  Alerts = 'Alerts',
  Correlations = 'Correlations',
  CorrelationRules = 'Correlation rules',
  LogTypes = 'Log types',
  ThreatIntel = 'Threat Intelligence',
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
  ROUTES.EDIT_DETECTOR_ALERT_TRIGGERS,
  `${ROUTES.LOG_TYPES}/.+`,
  ROUTES.LOG_TYPES_CREATE,
  ROUTES.THREAT_INTEL_ADD_CUSTOM_SOURCE,
  ROUTES.THREAT_INTEL_CREATE_SCAN_CONFIG,
  ROUTES.THREAT_INTEL_EDIT_SCAN_CONFIG,
];

interface MainProps extends RouteComponentProps {
  landingPage: string;
  setActionMenu: AppMountParameters['setHeaderActionMenu'];
  multiDataSourceEnabled: boolean;
  dataSourceManagement?: DataSourceManagementPluginSetup;
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
  [ROUTES.ALERTS]: Navigation.Alerts,
  [ROUTES.DETECTORS]: Navigation.Detectors,
  [ROUTES.RULES]: Navigation.Rules,
  [ROUTES.THREAT_INTEL_OVERVIEW]: Navigation.ThreatIntel,
};

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
      } = queryString.parse(this.props.location.search) as {
        dataSourceId: string;
        dataSourceLabel: string;
      };
      dataSourceId = parsedDataSourceId;
      dataSourceLabel = parsedDataSourceLabel || '';

      if (dataSourceId) {
        dataSourceObservable.next({ id: dataSourceId, label: dataSourceLabel });
      }
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
    if (this.props.location.pathname === prevProps.location.pathname) {
      return;
    }

    this.updateSelectedNavItem();
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
    if (
      sources[0] &&
      (dataSource?.id !== sources[0].id || dataSource?.label !== sources[0].label)
    ) {
      dataSourceInfo.activeDataSource = sources[0];
      this.setState({
        selectedDataSource: { ...sources[0] },
      });
    }
    dataSourceObservable.next({
      id: this.state.selectedDataSource.id,
      label: this.state.selectedDataSource.label,
    });
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
              this.setState({ selectedNavItemId: Navigation.Overview });
              history.push(ROUTES.OVERVIEW);
            },
            isSelected: selectedNavItemId === Navigation.Overview,
          },
          {
            name: Navigation.Findings,
            id: Navigation.Findings,
            onClick: () => {
              this.setState({ selectedNavItemId: Navigation.Findings });
              history.push(ROUTES.FINDINGS);
            },
            isSelected: selectedNavItemId === Navigation.Findings,
          },
          {
            name: Navigation.Alerts,
            id: Navigation.Alerts,
            onClick: () => {
              this.setState({ selectedNavItemId: Navigation.Alerts });
              history.push(ROUTES.ALERTS);
            },
            isSelected: selectedNavItemId === Navigation.Alerts,
          },
          {
            name: Navigation.ThreatIntel,
            id: Navigation.ThreatIntel,
            onClick: () => {
              this.setState({ selectedNavItemId: Navigation.ThreatIntel });
              history.push(ROUTES.THREAT_INTEL_OVERVIEW);
            },
            isSelected: selectedNavItemId === Navigation.ThreatIntel,
          },
          {
            name: Navigation.Detectors,
            id: Navigation.Detectors,
            onClick: () => {
              this.setState({ selectedNavItemId: Navigation.Detectors });
              history.push(ROUTES.DETECTORS);
            },
            forceOpen: true,
            isSelected: selectedNavItemId === Navigation.Detectors,
            items: [
              {
                name: Navigation.Rules,
                id: Navigation.Rules,
                onClick: () => {
                  this.setState({ selectedNavItemId: Navigation.Rules });
                  history.push(ROUTES.RULES);
                },
                isSelected: selectedNavItemId === Navigation.Rules,
              },
              {
                name: Navigation.LogTypes,
                id: Navigation.LogTypes,
                onClick: () => {
                  this.setState({ selectedNavItemId: Navigation.LogTypes });
                  history.push(ROUTES.LOG_TYPES);
                },
                isSelected: selectedNavItemId === Navigation.LogTypes,
              },
            ],
          },
          {
            name: Navigation.Correlations,
            id: Navigation.Correlations,
            onClick: () => {
              this.setState({ selectedNavItemId: Navigation.Correlations });
              history.push(ROUTES.CORRELATIONS);
            },
            renderItem: (props: any) => {
              return (
                <EuiFlexGroup alignItems="center" gutterSize="xs">
                  <EuiFlexItem grow={false}>
                    <span
                      className={props.className}
                      onClick={() => {
                        this.setState({ selectedNavItemId: Navigation.Correlations });
                        history.push(ROUTES.CORRELATIONS);
                      }}
                    >
                      {props.children}
                    </span>
                  </EuiFlexItem>
                </EuiFlexGroup>
              );
            },
            isSelected: selectedNavItemId === Navigation.Correlations,
            forceOpen: true,
            items: [
              {
                name: Navigation.CorrelationRules,
                id: Navigation.CorrelationRules,
                onClick: () => {
                  this.setState({ selectedNavItemId: Navigation.CorrelationRules });
                  history.push(ROUTES.CORRELATION_RULES);
                },
                isSelected: selectedNavItemId === Navigation.CorrelationRules,
              },
            ],
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
                            {multiDataSourceEnabled && (
                              <DataSourceMenuWrapper
                                dataSourceManagement={dataSourceManagement}
                                core={core}
                                dataSourceLoading={this.state.dataSourceLoading}
                                dataSourceMenuReadOnly={dataSourceMenuReadOnly}
                                setHeaderActionMenu={setActionMenu}
                                dataSourceFilterFn={dataSourceFilterFn}
                              />
                            )}
                            {!dataSourceLoading && services && (
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
                                          correlationService={services.correlationsService}
                                          opensearchService={services.opensearchService}
                                          detectorService={services.detectorsService}
                                          notificationsService={services.notificationsService}
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
                                    <Route
                                      path={`${ROUTES.ALERTS}/:detectorId?`}
                                      render={(props: RouteComponentProps) => (
                                        <Alerts
                                          {...props}
                                          setDateTimeFilter={this.setDateTimeFilter}
                                          dateTimeFilter={this.state.dateTimeFilter}
                                          alertService={services.alertService}
                                          detectorService={services.detectorsService}
                                          findingService={services.findingsService}
                                          notifications={core?.notifications}
                                          opensearchService={services.opensearchService}
                                          indexPatternService={services.indexPatternsService}
                                          correlationService={services.correlationsService}
                                          dataSource={selectedDataSource}
                                        />
                                      )}
                                    />
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
                                    <Route
                                      path={`${ROUTES.EDIT_DETECTOR_ALERT_TRIGGERS}/:id`}
                                      render={(props: RouteComponentProps<any, any, any>) => (
                                        <UpdateAlertConditions
                                          {...props}
                                          detectorService={services.detectorsService}
                                          notificationsService={services.notificationsService}
                                          notifications={core?.notifications}
                                          opensearchService={services.opensearchService}
                                        />
                                      )}
                                    />
                                    <Route
                                      path={`${ROUTES.CORRELATION_RULES}`}
                                      render={(props: RouteComponentProps<any, any, any>) => (
                                        <CorrelationRules
                                          {...props}
                                          dataSource={selectedDataSource}
                                        />
                                      )}
                                    />
                                    <Route
                                      path={`${ROUTES.CORRELATION_RULE_CREATE}`}
                                      render={(props: RouteComponentProps<any, any, any>) => (
                                        <CreateCorrelationRule
                                          {...props}
                                          indexService={services.indexService}
                                          fieldMappingService={services.fieldMappingService}
                                          notifications={core?.notifications}
                                          dataSource={selectedDataSource}
                                          notificationsService={services?.notificationsService}
                                          opensearchService={services?.opensearchService}
                                        />
                                      )}
                                    />
                                    <Route
                                      path={`${ROUTES.CORRELATION_RULE_EDIT}/:ruleId`}
                                      render={(props: RouteComponentProps<any, any, any>) => (
                                        <CreateCorrelationRule
                                          {...props}
                                          indexService={services.indexService}
                                          fieldMappingService={services.fieldMappingService}
                                          notifications={core?.notifications}
                                          dataSource={selectedDataSource}
                                          notificationsService={services?.notificationsService}
                                          opensearchService={services?.opensearchService}
                                        />
                                      )}
                                    />
                                    <Route
                                      path={`${ROUTES.CORRELATIONS}`}
                                      render={(props: RouteComponentProps<any, any, any>) => {
                                        return (
                                          <Correlations
                                            {...props}
                                            history={props.history}
                                            onMount={() =>
                                              this.setState({
                                                selectedNavItemId: Navigation.Correlations,
                                              })
                                            }
                                            dateTimeFilter={this.state.dateTimeFilter}
                                            setDateTimeFilter={this.setDateTimeFilter}
                                            dataSource={selectedDataSource}
                                            notifications={core?.notifications}
                                          />
                                        );
                                      }}
                                    />
                                    <Route
                                      path={`${ROUTES.LOG_TYPES}/:logTypeId`}
                                      render={(props: RouteComponentProps<any, any, any>) => (
                                        <LogType notifications={core?.notifications} {...props} />
                                      )}
                                    />
                                    <Route
                                      path={`${ROUTES.LOG_TYPES}`}
                                      render={(props: RouteComponentProps<any, any, any>) => {
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
                                      render={(props: RouteComponentProps<any, any, any>) => {
                                        return (
                                          <CreateLogType
                                            notifications={core?.notifications}
                                            {...props}
                                          />
                                        );
                                      }}
                                    />
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
