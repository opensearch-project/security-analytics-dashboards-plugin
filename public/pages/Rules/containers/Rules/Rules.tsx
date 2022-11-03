/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { CoreServicesContext } from '../../../../components/core_services';
import { BREADCRUMBS, ROUTES } from '../../../../utils/constants';
import Import from './components/Import';

import {
  EuiTitle,
  EuiButton,
  EuiFlyout,
  EuiFlyoutBody,
  EuiFlyoutHeader,
  EuiFlexGroup,
  EuiFlexItem,
  EuiPanel,
} from '@elastic/eui';
import Table from './components/Table';

interface RulesProps extends RouteComponentProps {}

interface RulesState {
  rules: [];
  loadingRules: boolean;
  Flyout: boolean;
  FlyoutType: string;
  Create: boolean;
  Mode: string;
}

export default class Rules extends Component<RulesProps, RulesState> {
  static contextType = CoreServicesContext;

  private refreshRules: Function | undefined;

  constructor(props: RulesProps) {
    super(props);

    this.state = {
      rules: [],
      loadingRules: false,
      Flyout: false,
      FlyoutType: '',
      Create: false,
      Mode: 'main',
    };
  }

  componentDidMount() {
    this.context.chrome.setBreadcrumbs([BREADCRUMBS.SECURITY_ANALYTICS, BREADCRUMBS.RULES]);
  }

  showFlyout = (type: string) => {
    this.setState({ Flyout: true });
    this.setState({ FlyoutType: type });
    if (type === 'Import') {
      this.context.chrome.setBreadcrumbs([
        BREADCRUMBS.SECURITY_ANALYTICS,
        BREADCRUMBS.RULES_IMPORT,
      ]);
    }
  };

  closeFlyout = () => {
    this.setState({ Flyout: false });
    this.setState({ FlyoutType: '' });
    this.refreshRules?.();
    this.context.chrome.setBreadcrumbs([BREADCRUMBS.SECURITY_ANALYTICS, BREADCRUMBS.RULES]);
  };

  showCreate = () => {
    this.setState({ Mode: 'create' });
    this.context.chrome.setBreadcrumbs([BREADCRUMBS.SECURITY_ANALYTICS, BREADCRUMBS.RULES_CREATE]);
  };

  closeCreate = () => {
    this.setState({ Mode: 'main' });
    this.context.chrome.setBreadcrumbs([BREADCRUMBS.SECURITY_ANALYTICS, BREADCRUMBS.RULES]);
  };

  registerRefreshCallback = (refreshCallback: Function) => {
    this.refreshRules = refreshCallback;
  };

  render() {
    const actions = [
      <EuiButton onClick={() => this.showFlyout('Import')}>Import rule</EuiButton>,
      <EuiButton
        color="primary"
        fill
        onClick={() => this.showCreate()}
        href={`#${ROUTES.RULES_CREATE}`}
      >
        Create new rule
      </EuiButton>,
    ];

    const headerActions = (
      <EuiFlexGroup justifyContent="flexEnd">
        {actions.map((action, idx) => (
          <EuiFlexItem key={idx} grow={false}>
            {action}
          </EuiFlexItem>
        ))}
      </EuiFlexGroup>
    );

    return (
      <>
        {this.state.Mode === 'main' && (
          <EuiFlexGroup direction="column">
            {this.state.Flyout && (
              <EuiFlyout ownFocus onClose={this.closeFlyout}>
                <EuiFlyoutHeader hasBorder>
                  <EuiTitle size="m">
                    <h3>{this.state.FlyoutType} a rule</h3>
                  </EuiTitle>
                </EuiFlyoutHeader>
                <EuiFlyoutBody>
                  <Import {...this.props} close={this.closeFlyout} />
                </EuiFlyoutBody>
              </EuiFlyout>
            )}
            <EuiFlexItem>
              <EuiFlexGroup>
                <EuiFlexItem>
                  <EuiTitle size="l">
                    <h1>Rules</h1>
                  </EuiTitle>
                </EuiFlexItem>
                <EuiFlexItem>{headerActions}</EuiFlexItem>
              </EuiFlexGroup>
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiPanel>
                <Table registerRefreshCallback={this.registerRefreshCallback} />
              </EuiPanel>
            </EuiFlexItem>
          </EuiFlexGroup>
        )}
      </>
    );
  }
}
