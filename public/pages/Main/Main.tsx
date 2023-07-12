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
import { CoreStart } from 'opensearch-dashboards/public';
import { ServicesConsumer } from '../../services';
import { BrowserServices } from '../../models/interfaces';
import { DEFAULT_DATE_RANGE, ROUTES } from '../../utils/constants';
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
import { DateTimeFilter } from '../Overview/models/interfaces';
import Callout, { ICalloutProps } from './components/Callout';
import { DataStore } from '../../store/DataStore';
import { CreateCorrelationRule } from '../Correlations/containers/CreateCorrelationRule';
import { CorrelationRules } from '../Correlations/containers/CorrelationRules';
import { Correlations } from '../Correlations/containers/CorrelationsContainer';
import FindingDetailsFlyout, {
  FindingDetailsFlyoutBaseProps,
} from '../Findings/components/FindingDetailsFlyout';

enum Navigation {
  SecurityAnalytics = 'Security Analytics',
  Findings = 'Findings',
  Detectors = 'Detectors',
  Rules = 'Detection rules',
  Overview = 'Overview',
  Alerts = 'Alerts',
  Correlations = 'Correlations',
  CorrelationRules = 'Correlation rules',
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
];

interface MainProps extends RouteComponentProps {
  landingPage: string;
}

interface MainState {
  getStartedDismissedOnce: boolean;
  selectedNavItemIndex: number;
  dateTimeFilter: DateTimeFilter;
  callout?: ICalloutProps;
  toasts?: Toast[];
  findingFlyout: FindingDetailsFlyoutBaseProps | null;
}

const navItemIndexByRoute: { [route: string]: number } = {
  [ROUTES.OVERVIEW]: 1,
  [ROUTES.FINDINGS]: 2,
  [ROUTES.ALERTS]: 3,
  [ROUTES.DETECTORS]: 4,
  [ROUTES.RULES]: 5,
};

export default class Main extends Component<MainProps, MainState> {
  constructor(props: MainProps) {
    super(props);
    this.state = {
      getStartedDismissedOnce: false,
      selectedNavItemIndex: 1,
      dateTimeFilter: {
        startTime: DEFAULT_DATE_RANGE.start,
        endTime: DEFAULT_DATE_RANGE.end,
      },
      findingFlyout: null,
    };

    DataStore.detectors.setHandlers(this.showCallout, this.showToast);
    DataStore.findings.setFlyoutCallback(this.showFindingFlyout);
  }

  showFindingFlyout = (findingFlyout: FindingDetailsFlyoutBaseProps | null) => {
    this.setState({
      findingFlyout,
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
      dateTimeFilter: dateTimeFilter,
    });
  };

  /**
   * Returns current component route index
   * @return {number}
   */
  getCurrentRouteIndex = (): number | undefined => {
    let index: number | undefined;
    const pathname = this.props.location.pathname;
    for (const [route, routeIndex] of Object.entries(navItemIndexByRoute)) {
      if (pathname.match(new RegExp(`^${route}`))) {
        index = routeIndex;
        break;
      }
    }

    return index;
  };

  updateSelectedNavItem() {
    const routeIndex = this.getCurrentRouteIndex();
    if (routeIndex) {
      this.setState({ selectedNavItemIndex: routeIndex });
    }

    if (this.props.location.pathname.includes('detector-details')) {
      this.setState({ selectedNavItemIndex: navItemIndexByRoute[ROUTES.DETECTORS] });
    }
  }

  setGetStartedDismissedOnce = () => {
    this.setState({ getStartedDismissedOnce: true });
  };

  render() {
    const {
      landingPage,
      location: { pathname },
      history,
    } = this.props;

    const { callout, findingFlyout } = this.state;
    const sideNav: EuiSideNavItemType<{ style: any }>[] = [
      {
        name: Navigation.SecurityAnalytics,
        id: 0,
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
            id: 1,
            onClick: () => {
              this.setState({ selectedNavItemIndex: 1 });
              history.push(ROUTES.OVERVIEW);
            },
            isSelected: this.state.selectedNavItemIndex === 1,
          },
          {
            name: Navigation.Findings,
            id: 2,
            onClick: () => {
              this.setState({ selectedNavItemIndex: 2 });
              history.push(ROUTES.FINDINGS);
            },
            isSelected: this.state.selectedNavItemIndex === 2,
          },
          {
            name: Navigation.Alerts,
            id: 3,
            onClick: () => {
              this.setState({ selectedNavItemIndex: 3 });
              history.push(ROUTES.ALERTS);
            },
            isSelected: this.state.selectedNavItemIndex === 3,
          },
          {
            name: Navigation.Detectors,
            id: 4,
            onClick: () => {
              this.setState({ selectedNavItemIndex: 4 });
              history.push(ROUTES.DETECTORS);
            },
            isSelected: this.state.selectedNavItemIndex === 4,
          },
          {
            name: Navigation.Rules,
            id: 5,
            onClick: () => {
              this.setState({ selectedNavItemIndex: 5 });
              history.push(ROUTES.RULES);
            },
            isSelected: this.state.selectedNavItemIndex === 5,
          },
          {
            name: Navigation.Correlations,
            id: 6,
            onClick: () => {
              this.setState({ selectedNavItemIndex: 6 });
              history.push(ROUTES.CORRELATIONS);
            },
            renderItem: (props) => {
              return (
                <EuiFlexGroup alignItems="center" gutterSize="xs">
                  <EuiFlexItem grow={false}>
                    <span
                      className={props.className}
                      onClick={() => {
                        this.setState({ selectedNavItemIndex: 6 });
                        history.push(ROUTES.CORRELATIONS);
                      }}
                    >
                      {props.children}
                    </span>
                  </EuiFlexItem>
                </EuiFlexGroup>
              );
            },
            isSelected: this.state.selectedNavItemIndex === 6,
            forceOpen: true,
            items: [
              {
                name: Navigation.CorrelationRules,
                id: 7,
                onClick: () => {
                  this.setState({ selectedNavItemIndex: 7 });
                  history.push(ROUTES.CORRELATION_RULES);
                },
                isSelected: this.state.selectedNavItemIndex === 7,
              },
            ],
          },
        ],
      },
    ];

    return (
      <CoreServicesConsumer>
        {(core: CoreStart | null) =>
          core && (
            <ServicesConsumer>
              {(services: BrowserServices | null) =>
                services && (
                  <EuiPage restrictWidth={'100%'}>
                    {/* Hide side navigation bar when on any HIDDEN_NAV_ROUTES pages. */}
                    {!HIDDEN_NAV_ROUTES.some((route) => pathname.match(route)) && (
                      <EuiPageSideBar style={{ minWidth: 200 }}>
                        <EuiSideNav style={{ width: 200 }} items={sideNav} />
                      </EuiPageSideBar>
                    )}
                    <EuiPageBody>
                      {callout ? <Callout {...callout} /> : null}
                      {findingFlyout ? (
                        <FindingDetailsFlyout
                          {...findingFlyout}
                          history={history}
                          indexPatternsService={services.indexPatternsService}
                          correlationService={services?.correlationsService}
                          opensearchService={services.opensearchService}
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
                              findingsService={services.findingsService}
                              history={props.history}
                              correlationService={services?.correlationsService}
                              opensearchService={services.opensearchService}
                              detectorService={services.detectorsService}
                              notificationsService={services.notificationsService}
                              indexPatternsService={services.indexPatternsService}
                              notifications={core?.notifications}
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
                              history={props.history}
                              notifications={core?.notifications}
                            />
                          )}
                        />
                        <Route
                          path={ROUTES.RULES}
                          render={(props: RouteComponentProps) => (
                            <Rules {...props} notifications={core?.notifications} />
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
                              return <Rules {...props} notifications={core?.notifications} />;
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
                              return <Rules {...props} notifications={core?.notifications} />;
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
                              getStartedDismissedOnce={this.state.getStartedDismissedOnce}
                              onGetStartedDismissed={this.setGetStartedDismissedOnce}
                              notifications={core?.notifications}
                            />
                          )}
                        />
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
                            <UpdateDetectorRules {...props} notifications={core?.notifications} />
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
                            <CorrelationRules {...props} />
                          )}
                        />
                        <Route
                          path={`${ROUTES.CORRELATION_RULE_CREATE}`}
                          render={(props: RouteComponentProps<any, any, any>) => (
                            <CreateCorrelationRule
                              {...props}
                              indexService={services?.indexService}
                              fieldMappingService={services?.fieldMappingService}
                              notifications={core?.notifications}
                            />
                          )}
                        />
                        <Route
                          path={`${ROUTES.CORRELATION_RULE_EDIT}/:ruleId`}
                          render={(props: RouteComponentProps<any, any, any>) => (
                            <CreateCorrelationRule
                              {...props}
                              indexService={services?.indexService}
                              fieldMappingService={services?.fieldMappingService}
                              notifications={core?.notifications}
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
                                onMount={() => this.setState({ selectedNavItemIndex: 6 })}
                                dateTimeFilter={this.state.dateTimeFilter}
                                setDateTimeFilter={this.setDateTimeFilter}
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
                )
              }
            </ServicesConsumer>
          )
        }
      </CoreServicesConsumer>
    );
  }
}
