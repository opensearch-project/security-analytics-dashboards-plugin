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
import Dashboards from '../Dashboards';
import Findings from '../Findings';
import Detectors from '../Detectors';
import Rules from '../Rules';
import Overview from '../Overview';
import CreateDetector from '../CreateDetector/containers/CreateDetector';
import Alerts from '../Alerts';
import { DetectorDetails } from '../Detectors/containers/Detector/Detector';

enum Navigation {
  SecurityAnalytics = 'Security Analytics',
  Dashboards = 'Dashboards',
  Findings = 'Findings',
  Detectors = 'Detectors',
  Rules = 'Rule templates',
  Overview = 'Overview',
  Alerts = 'Alerts',
}

/**
 * Add here the ROUTES for pages on which the EuiPageSideBar should NOT be displayed.
 */
const HIDDEN_NAV_ROUTES: string[] = [ROUTES.DETECTORS_CREATE];

interface MainProps extends RouteComponentProps {
  landingPage: string;
}

export default class Main extends Component<MainProps> {
  render() {
    const {
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
            name: Navigation.Dashboards,
            id: 4,
            href: `#${ROUTES.DASHBOARDS}`,
          },
          {
            name: Navigation.Detectors,
            id: 5,
            href: `#${ROUTES.DETECTORS}`,
          },
          {
            name: Navigation.Rules,
            id: 6,
            href: `#${ROUTES.RULES}`,
          },
        ],
      },
    ];
    const { landingPage } = this.props;
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
                          path={ROUTES.DASHBOARDS}
                          render={(props: RouteComponentProps) => <Dashboards {...props} />}
                        />
                        <Route
                          path={ROUTES.FINDINGS}
                          render={(props: RouteComponentProps) => (
                            <Findings
                              {...props}
                              findingsService={services.findingsService}
                              opensearchService={services.opensearchService}
                              detectorService={services.detectorsService}
                            />
                          )}
                        />
                        <Route
                          path={ROUTES.DETECTORS}
                          render={(props: RouteComponentProps) => (
                            <Detectors {...props} detectorService={services.detectorsService} />
                          )}
                        />
                        <Route
                          path={ROUTES.DETECTORS_CREATE}
                          render={(props: RouteComponentProps) => (
                            <CreateDetector {...props} isEdit={true} services={services} />
                          )}
                        />
                        <Route
                          path={ROUTES.RULES}
                          render={(props: RouteComponentProps) => <Rules {...props} />}
                        />
                        <Route
                          path={ROUTES.RULES_CREATE}
                          render={(props: RouteComponentProps) => <Rules {...props} />}
                        />
                        <Route
                          path={ROUTES.OVERVIEW}
                          render={(props: RouteComponentProps) => <Overview {...props} />}
                        />
                        <Route
                          path={ROUTES.ALERTS}
                          render={(props: RouteComponentProps) => (
                            <Alerts
                              {...props}
                              alertService={services.alertService}
                              detectorService={services.detectorsService}
                              findingService={services.findingsService}
                            />
                          )}
                        />
                        <Route
                          path={ROUTES.DETECTOR_DETAILS}
                          render={(props: RouteComponentProps<{}, any, any>) => (
                            <DetectorDetails {...props} />
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
