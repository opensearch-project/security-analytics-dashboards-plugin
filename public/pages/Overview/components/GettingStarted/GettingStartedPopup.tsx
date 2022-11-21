/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { EuiHorizontalRule, EuiSpacer, EuiSteps, EuiText, EuiTitle } from '@elastic/eui';
import { EuiContainedStepProps } from '@elastic/eui/src/components/steps/steps';
import { ROUTES } from '../../../../utils/constants';
import { RouteComponentProps } from 'react-router-dom';
import { GetStartedStep } from './GetStartedStep';

export interface GettingStartedPopupProps {
  dismissPopup: () => void;
  history: RouteComponentProps['history'];
}

export const GettingStartedPopup: React.FC<GettingStartedPopupProps> = ({
  dismissPopup,
  history,
}) => {
  const steps: EuiContainedStepProps[] = useMemo(
    () => [
      {
        title: 'Create security detector',
        children: (
          <GetStartedStep
            title={
              'Identify security findings and threats from your log datas with curated detection rules.'
            }
            buttons={[
              {
                text: 'Create detector',
                onClick: () => {
                  dismissPopup();
                  history.push(ROUTES.DETECTORS_CREATE);
                },
                opts: {
                  fill: true,
                },
              },
            ]}
          />
        ),
      },
      {
        title: 'Discover security findings',
        children: (
          <GetStartedStep
            title={
              'After detectors are created, you can view insights and analyse security findings.'
            }
            buttons={[
              {
                text: 'Overview',
                onClick: () => dismissPopup(),
                opts: {
                  fill: true,
                },
              },
              {
                text: 'View findings',
                onClick: () => {
                  dismissPopup();
                  history.push(ROUTES.FINDINGS);
                },
              },
            ]}
          />
        ),
      },
      {
        title: 'View security alerts',
        children: (
          <GetStartedStep
            title={'After detectors are created, you can view alerts triggered by findings.'}
            buttons={[
              {
                text: 'View alerts',
                onClick: () => {
                  dismissPopup();
                  history.push(ROUTES.ALERTS);
                },
                opts: {
                  fill: true,
                },
              },
            ]}
          />
        ),
      },
      {
        title: 'Create custom rules for detectors',
        children: (
          <GetStartedStep
            title={'Create rule or fine tune existing rules that can be added to detectors.'}
            buttons={[
              {
                text: 'Create rule',
                onClick: () => {
                  dismissPopup();
                  history.push(ROUTES.RULES_CREATE);
                },
              },
            ]}
          />
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
