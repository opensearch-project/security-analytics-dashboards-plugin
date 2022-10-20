/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Home } from '../../containers/Rules/components/Home';
import { Create } from './components/Forms/Create';
import { Import } from './components/Forms/Import';
import {
  EuiPanel,
  EuiTitle,
  EuiFlexGroup,
  EuiFlexItem,
  EuiButton,
  EuiFlyout,
  EuiFlyoutBody,
  EuiHorizontalRule,
  EuiFlyoutHeader,
} from '@elastic/eui';

export const Rules = () => {
  const [Flyout, showFlyout] = useState<boolean>(false);
  const [importFlyout, showImportFlyout] = useState<boolean>(false);

  let flyout;

  const showFlyoutFunc = () => {
    showFlyout(true);
  };
  const closeFlyoutFunc = () => {
    showFlyout(false);
  };

  const showImportFlyoutFunc = () => {
    showImportFlyout(true);
  };
  const closeImportFlyoutFunc = () => {
    showImportFlyout(false);
  };

  if (Flyout) {
    flyout = (
      <EuiFlyout ownFocus onClose={closeFlyoutFunc}>
        <EuiFlyoutHeader hasBorder>
          <EuiTitle size="m">
            <h3>Create new rule</h3>
          </EuiTitle>
        </EuiFlyoutHeader>
        <EuiFlyoutBody>
          <Create />
        </EuiFlyoutBody>
      </EuiFlyout>
    );
  }

  if (importFlyout) {
    flyout = (
      <EuiFlyout ownFocus onClose={closeImportFlyoutFunc}>
        <EuiFlyoutHeader hasBorder>
          <EuiTitle size="m">
            <h3>Import new rules</h3>
          </EuiTitle>
        </EuiFlyoutHeader>
        <EuiFlyoutBody>
          <Import />
        </EuiFlyoutBody>
      </EuiFlyout>
    );
  }

  return (
    <EuiPanel>
      <div>{flyout}</div>
      <div>{importFlyout}</div>
      <EuiFlexGroup style={{ padding: '0px 10px' }} direction="row" justifyContent="spaceBetween">
        <EuiFlexItem>
          <EuiTitle size="l">
            <h3>Rules</h3>
          </EuiTitle>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiButton onClick={showImportFlyoutFunc}>Import rules</EuiButton>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiButton fill onClick={showFlyoutFunc}>
            Create new rule
          </EuiButton>
        </EuiFlexItem>
      </EuiFlexGroup>
      <EuiHorizontalRule />
      <Home />
    </EuiPanel>
  );
};
