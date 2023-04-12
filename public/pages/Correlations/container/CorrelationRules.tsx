/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { EuiFlexGroup, EuiFlexItem, EuiSpacer, EuiTitle, EuiPanel, EuiButton } from '@elastic/eui';

export const CorrelationRules: React.FC = () => {
  const headerActions = useMemo(
    () => [
      <EuiButton onClick={} data-test-subj={'create_rule_button'} fill={true}>
        Create new rule
      </EuiButton>,
    ],
    []
  );

  return (
    <EuiFlexGroup direction="column">
      <EuiFlexItem>
        <EuiFlexGroup gutterSize={'s'} justifyContent={'spaceBetween'}>
          <EuiFlexItem>
            <EuiTitle size="m">
              <h1>Rules</h1>
            </EuiTitle>
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiFlexGroup justifyContent="flexEnd">
              {headerActions.map((action, idx) => (
                <EuiFlexItem key={idx} grow={false}>
                  {action}
                </EuiFlexItem>
              ))}
            </EuiFlexGroup>
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiSpacer size={'m'} />
      </EuiFlexItem>
      <EuiFlexItem>
        <EuiPanel></EuiPanel>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};
