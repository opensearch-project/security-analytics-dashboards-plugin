/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from "react";
import { Switch, Route, Redirect, RouteComponentProps } from "react-router-dom";
// @ts-ignore
import { EuiSideNav, EuiPage, EuiPageBody, EuiPageSideBar } from "@elastic/eui";
import { CoreStart } from "opensearch-dashboards/public";
import { ServicesConsumer } from "../../services";
import { BrowserServices } from "../../models/interfaces";
import { ROUTES } from "../../utils/constants";
import { CoreServicesConsumer } from "../../components/core_services";
import TestHomePage from "../TestHomePage";

enum Navigation {
  SecurityAnalytics = "Security Analytics"
}

enum Pathname {}

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
        href: "#/",
        items: []
      },
    ];
    const { landingPage } = this.props;
    return (
      <CoreServicesConsumer>
        {(core: CoreStart | null) => core && (
          <ServicesConsumer>
            {(services: BrowserServices | null) =>
              services && (
                <EuiPage restrictWidth={"100%"}>
                  {/*Hide side navigation bar when creating or editing rollup job*/}
                  {!HIDDEN_NAV_ROUTES.includes(pathname) && (
                    <EuiPageSideBar style={{ minWidth: 200 }}>
                      <EuiSideNav style={{ width: 200 }} items={sideNav} />
                    </EuiPageSideBar>
                  )}
                  <EuiPageBody>
                    <Switch>
                      <Route
                        path={ROUTES.LANDING_PAGE}
                        render={(props: RouteComponentProps) => (
                          <TestHomePage {...props} />
                          )}
                      />
                      <Redirect from={"/"} to={landingPage} />
                    </Switch>
                  </EuiPageBody>
                </EuiPage>
              )
            }
          </ServicesConsumer>
        )}
      </CoreServicesConsumer>
    );
  }
}
