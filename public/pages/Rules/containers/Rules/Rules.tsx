/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { ContentPanel } from '../../../../components/ContentPanel';
import { CoreServicesContext } from '../../../../components/core_services';
import { BREADCRUMBS, PLUGIN_NAME, ROUTES } from '../../../../utils/constants';
import Main from './components/Main';
import Create from './components/Create';
import { EuiTitle, EuiButton, EuiFlyout, EuiFlyoutBody, EuiFlyoutHeader } from '@elastic/eui';

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
    return (
      <>
        {this.state.Mode === 'main' && (
          <ContentPanel title={'Rules'} actions={actions}>
            {this.state.Flyout && (
              <EuiFlyout ownFocus onClose={this.closeFlyout}>
                <EuiFlyoutHeader hasBorder>
                  <EuiTitle size="m">
                    <h3>{this.state.FlyoutType} a rule</h3>
                  </EuiTitle>
                </EuiFlyoutHeader>
                <EuiFlyoutBody></EuiFlyoutBody>
              </EuiFlyout>
            )}
            <div>
              <Main />
            </div>
          </ContentPanel>
        )}
        {this.state.Mode === 'create' && (
          <div>
            <Create />
            <EuiButton onClick={() => this.closeCreate()} href={`#${ROUTES.RULES}`}>
              Cancel
            </EuiButton>
          </div>
        )}
      </>
    );
  }
}
