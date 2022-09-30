/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useReducer } from 'react';
import { initialState, reducer } from '../../state-management';
import { Home } from '../../containers/Rules/components/Home';
import { Add } from '../../containers/Rules/components/Add';
import { getRules } from '../../requests';
import {
  EuiPanel,
  EuiTitle,
  EuiFlexGroup,
  EuiFlexItem,
  EuiButton,
  EuiFlyout,
  EuiFlyoutBody,
} from '@elastic/eui';

export const Rules = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [rules, setRules] = useState<any>([]);
  const [data, setData] = useState<any>([]);
  const [Flyout, showFlyout] = useState<boolean>(false);
  const [active, setActive] = useState<string>('view');

  let flyout;

  const showFlyoutFunc = () => {
    showFlyout(true);
  };
  const closeFlyoutFunc = () => {
    showFlyout(false);
  };

  if (Flyout) {
    flyout = (
      <EuiFlyout ownFocus onClose={closeFlyoutFunc}>
        <EuiFlyoutBody>
          <Add />
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
      <EuiFlexGroup style={{ padding: '0px 10px' }} direction="row" justifyContent="spaceBetween">
        <EuiFlexItem>
          <EuiTitle size="l">
            <h3>Rules</h3>
          </EuiTitle>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiButton fill onClick={showFlyoutFunc}>
            Add new rule
          </EuiButton>
        </EuiFlexItem>
      </EuiFlexGroup>
      <Home />
    </EuiPanel>
  );
};
