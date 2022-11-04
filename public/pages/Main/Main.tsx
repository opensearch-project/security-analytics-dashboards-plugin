/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
import { Switch, Route, Redirect, RouteComponentProps } from 'react-router-dom';
import { EuiSideNav, EuiPage, EuiPageBody, EuiPageSideBar } from '@elastic/eui';
import { CoreStart } from 'opensearch-dashboards/public';
import { ServicesConsumer } from '../../services';
import { BrowserServices } from '../../models/interfaces';
import { ROUTES } from '../../utils/constants';
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

enum Navigation {
  SecurityAnalytics = 'Security Analytics',
  Findings = 'Findings',
  Detectors = 'Detectors',
  Rules = 'Rules',
  Overview = 'Overview',
  Alerts = 'Alerts',
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
];

interface MainProps extends RouteComponentProps {
  landingPage: string;
}

interface MainState {
  getStartedDismissedOnce: boolean;
}

export default class Main extends Component<MainProps, MainState> {
  constructor(props: MainProps) {
    super(props);
    this.state = {
      getStartedDismissedOnce: false,
    };
  }

  setGetStartedDismissedOnce = () => {
    this.setState({ getStartedDismissedOnce: true });
  };

  render() {
    const {
      landingPage,
      location: { pathname },
    } = this.props;
    const sideNav = [
      {
        name: Navigation.SecurityAnalytics,
        id: 0,
        items: [
          {
            name: Navigation.Overview,
            id: 1,
            href: `#${ROUTES.OVERVIEW}`,
          },
          {
            name: Navigation.Findings,
            id: 2,
            href: `#${ROUTES.FINDINGS}`,
          },
          {
            name: Navigation.Alerts,
            id: 3,
            href: `#${ROUTES.ALERTS}`,
          },
          {
            name: Navigation.Detectors,
            id: 4,
            href: `#${ROUTES.DETECTORS}`,
          },
          {
            name: Navigation.Rules,
            id: 5,
            href: `#${ROUTES.RULES}`,
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
                    {!HIDDEN_NAV_ROUTES.includes(pathname) && (
                      <EuiPageSideBar style={{ minWidth: 200 }}>
                        <EuiSideNav style={{ width: 200 }} items={sideNav} />
                      </EuiPageSideBar>
                    )}
                    <EuiPageBody>
                      <Switch>
                        <Route
                          path={ROUTES.FINDINGS}
                          render={(props: RouteComponentProps) => (
                            <Findings
                              {...props}
                              findingsService={services.findingsService}
                              opensearchService={services.opensearchService}
                              detectorService={services.detectorsService}
                              ruleService={services.ruleService}
                              notificationsService={services.notificationsService}
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
                            <CreateRule services={services} history={props.history} />
                          )}
                        />
                        <Route
                          path={ROUTES.RULES_EDIT}
                          render={(props: RouteComponentProps<any, any, any>) => (
                            <EditRule services={services} {...props} />
                          )}
                        />
                        <Route
                          path={ROUTES.RULES_DUPLICATE}
                          render={(props: RouteComponentProps<any, any, any>) => (
                            <DuplicateRule services={services} {...props} />
                          )}
                        />
                        <Route
                          path={ROUTES.RULES_IMPORT}
                          render={(props: RouteComponentProps) => (
                            <ImportRule services={services} history={props.history} />
                          )}
                        />
                        <Route
                          path={ROUTES.OVERVIEW}
                          render={(props: RouteComponentProps) => (
                            <Overview
                              {...props}
                              getStartedDismissedOnce={this.state.getStartedDismissedOnce}
                              onGetStartedDismissed={this.setGetStartedDismissedOnce}
                              notifications={core?.notifications}
                            />
                          )}
                        />
                        <Route
                          path={ROUTES.ALERTS}
                          render={(props: RouteComponentProps) => (
                            <Alerts
                              {...props}
                              alertService={services.alertService}
                              detectorService={services.detectorsService}
                              findingService={services.findingsService}
                              ruleService={services.ruleService}
                              notifications={core?.notifications}
                            />
                          )}
                        />
                        <Route
                          path={`${ROUTES.DETECTOR_DETAILS}/:id`}
                          render={(props: RouteComponentProps<{}, any, any>) => (
                            <DetectorDetails
                              detectorService={services.detectorsService}
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
                              filedMappingService={services.fieldMappingService}
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
                              ruleService={services.ruleService}
                              notificationsService={services.notificationsService}
                              notifications={core?.notifications}
                            />
                          )}
                        />
                        <Redirect from={'/'} to={landingPage} />
                      </Switch>
                    </EuiPageBody>
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
