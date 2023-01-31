/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiButton, EuiFlexGroup, EuiFlexItem, EuiSpacer, EuiTitle } from '@elastic/eui';
import { ISavedObjectsService } from '../../../../../types';
import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import DetectorType from '../../../CreateDetector/components/DefineDetector/components/DetectorType';

interface DashboardsProps extends RouteComponentProps {
  savedObjectsService: ISavedObjectsService;
}

interface DashboardsState {
  logType: string;
  creating: boolean;
}

export default class Dashboards extends Component<DashboardsProps, DashboardsState> {
  constructor(props: DashboardsProps) {
    super(props);
    this.state = {
      logType: '',
      creating: false,
    };
  }

  onLogTypeChange = (logType: string) => {
    this.setState({ logType });
  };

  private createDashboard = () => {
    this.setState({ creating: true });
    this.props.savedObjectsService
      .createSavedObject(this.state.logType)
      .then((res) => {
        if (res.ok) {
          window.open(`dashboards#/view/${res.response.id}`, '_self');
        }
      })
      .catch((error: any) => {
        console.error(error);
      })
      .finally(() => {
        this.setState({ creating: false });
      });
  };

  render() {
    return (
      <>
        <EuiTitle size="m">
          <h1>Dashboards</h1>
        </EuiTitle>
        <DetectorType
          detectorType={this.state.logType}
          onDetectorTypeChange={this.onLogTypeChange}
        />
        <EuiSpacer />
        <EuiFlexGroup justifyContent="flexEnd">
          <EuiFlexItem grow={false}>
            <EuiButton
              fill
              onClick={this.createDashboard}
              disabled={this.state.creating}
              isLoading={this.state.creating}
            >
              Create
            </EuiButton>
          </EuiFlexItem>
        </EuiFlexGroup>
      </>
    );
  }
}
