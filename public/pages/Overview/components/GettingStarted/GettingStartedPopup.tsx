/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiHorizontalRule,
  EuiSpacer,
  EuiSteps,
  EuiText,
  EuiTitle,
} from '@elastic/eui';
import { EuiButton } from '@elastic/eui';
import { EuiContainedStepProps } from '@elastic/eui/src/components/steps/steps';
import { ROUTES } from '../../../../utils/constants';
import { RouteComponentProps } from 'react-router-dom';

export interface GettingStartedPopupProps {
  dismissPopup: () => void;
  history: RouteComponentProps['history'];
}
export interface OverviewStartState {}

export const GettingStartedPopup: React.FC<GettingStartedPopupProps> = ({
  dismissPopup,
  history,
}) => {
  const steps: EuiContainedStepProps[] = useMemo(
    () => [
      {
        title: 'Create security detector',
        children: (
          <div style={{ marginTop: '-20px' }}>
            <EuiText>
              <p>
                Identify security findings and threats from your log datas with curated detection
                rules.
              </p>
            </EuiText>
            <EuiSpacer size="s" />
            <EuiButton
              fill
              onClick={() => {
                dismissPopup();
                history.push(ROUTES.DETECTORS_CREATE);
              }}
            >
              Create detector
            </EuiButton>
          </div>
        ),
      },
      {
        title: 'Discover security findings',
        children: (
          <div style={{ marginTop: '-20px' }}>
            <EuiText>
              <p>
                After detectors are create, you can view insights and analyse security findings.
              </p>
            </EuiText>
            <EuiSpacer size="s" />
            <EuiFlexGroup gutterSize="s">
              <EuiFlexItem grow={false}>
                <EuiButton fill onClick={dismissPopup}>
                  Overview
                </EuiButton>
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiButton
                  onClick={() => {
                    dismissPopup();
                    history.push(ROUTES.FINDINGS);
                  }}
                >
                  View findings
                </EuiButton>
              </EuiFlexItem>
            </EuiFlexGroup>
          </div>
        ),
      },
      {
        title: 'Create custom rules for detectors',
        children: (
          <div style={{ marginTop: '-20px' }}>
            <EuiText>
              <p>Create rule or fine tune existing rules that can be added to detectors.</p>
            </EuiText>
            <EuiSpacer size="s" />
            <EuiFlexGroup gutterSize="s">
              <EuiFlexItem grow={false}>
                <EuiButton
                  fill
                  onClick={() => {
                    dismissPopup();
                    history.push(ROUTES.RULES_CREATE);
                  }}
                >
                  Create rule
                </EuiButton>
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiButton
                  onClick={() => {
                    dismissPopup();
                    history.push(ROUTES.RULES);
                  }}
                >
                  Manage rules
                </EuiButton>
              </EuiFlexItem>
            </EuiFlexGroup>
          </div>
        ),
      },
    ],
    [dismissPopup]
  );

  return (
    <>
      <EuiTitle>
        <h1>Get started with Security analytics</h1>
      </EuiTitle>
      <EuiHorizontalRule />
      <EuiText>
        <p>
          Security analytics generates critical security insights from existing security event logs
        </p>
      </EuiText>
      <EuiSpacer />
      <EuiSteps steps={steps} titleSize={'s'} />
    </>
  );
};
