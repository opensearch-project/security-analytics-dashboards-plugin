/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
import { Switch, Route, Redirect, RouteComponentProps } from 'react-router-dom';
// @ts-ignore
import { EuiSideNav, EuiPage, EuiPageBody, EuiPageSideBar } from '@elastic/eui';
import { CoreStart } from 'opensearch-dashboards/public';
import { ServicesConsumer } from '../../services';
import { BrowserServices } from '../../models/interfaces';
import { ROUTES } from '../../utils/constants';
import { CoreServicesConsumer } from '../../components/core_services';
import Dashboards from '../Dashboards';
import Findings from '../Findings';
import Detectors from '../Detectors';
import Categories from '../Categories';
import Rules from '../Rules';
import { ContentPanel } from '../../components/ContentPanel';

enum Navigation {
  SecurityAnalytics = 'Security Analytics',
  Dashboards = 'Dashboards',
  Findings = 'Findings',
  Detectors = 'Detectors',
  Categories = 'Categories',
  Rules = 'Rules',
}

enum Pathname {}

/**
 * Add here the ROUTES for pages on which the EuiPageSideBar should NOT be displayed.
 */
const HIDDEN_NAV_ROUTES = [];

interface MainProps extends RouteComponentProps {
  landingPage: string;
}

export default class Main extends Component<MainProps, object> {
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
            name: Navigation.Findings,
            id: 1,
            href: `#${ROUTES.FINDINGS}`,
          },
          {
            name: Navigation.Dashboards,
            id: 2,
            href: `#${ROUTES.DASHBOARDS}`,
          },
          {
            name: Navigation.Detectors,
            id: 3,
            href: `#${ROUTES.DETECTORS}`,
          },
          {
            name: Navigation.Categories,
            id: 4,
            href: `#${ROUTES.CATEGORIES}`,
            items: [
              {
                name: Navigation.Rules,
                id: 5,
                href: `#${ROUTES.RULES}`,
                forceOpen: true,
              },
            ],
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
                          render={(props: RouteComponentProps) => <Findings {...props} />}
                        />
                        <Route
                          path={ROUTES.DETECTORS}
                          render={(props: RouteComponentProps) => <Detectors {...props} />}
                        />
                        <Route
                          path={ROUTES.CATEGORIES}
                          render={(props: RouteComponentProps) => <Categories {...props} />}
                        />
                        <Route
                          path={ROUTES.RULES}
                          render={(props: RouteComponentProps) => <Rules {...props} />}
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
