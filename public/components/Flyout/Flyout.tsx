/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiFlyout, EuiFlyoutHeader, EuiTitle } from '@elastic/eui';
import React, { Component } from 'react';

export interface FlyoutData {
  type: string;
  title: string;
}

export interface FlyoutProps {
  flyoutData: FlyoutData;
  onClose: () => void;
}

export default class Flyout extends Component<FlyoutProps> {
  render() {
    return (
      <EuiFlyout
        onClose={() => {
          this.props.onClose();
        }}
        // type="push"
      >
        <EuiFlyoutHeader>
          <EuiTitle>
            <h2>{this.props.flyoutData.title}</h2>
          </EuiTitle>
        </EuiFlyoutHeader>
      </EuiFlyout>
    );
  }
}
