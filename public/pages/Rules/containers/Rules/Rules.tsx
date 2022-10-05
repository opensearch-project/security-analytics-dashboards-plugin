/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useReducer } from 'react';
import { initialState, reducer } from '../../state-management';
import { Home } from '../../containers/Rules/components/Home';
import { Form } from './components/Forms';
import { Import } from './components/Forms/Import';
import { getRules } from '../../requests';
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
  const [state, dispatch] = useReducer(reducer, initialState);
  const [rules, setRules] = useState<any>([]);
  const [data, setData] = useState<any>([]);
  const [Flyout, showFlyout] = useState<boolean>(false);
  const [importFlyout, showImportFlyout] = useState<boolean>(false);
  const [active, setActive] = useState<string>('view');

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
          <Form />
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

  useEffect(() => {
    getRules().then((res: any) => {
      setRules(res[0]);
      setData(res);
    });
  }, []);

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
