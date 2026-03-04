/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { EuiHorizontalRule, EuiLink, EuiPanel, EuiSpacer, EuiSteps, EuiText } from '@elastic/eui';
import { EuiContainedStepProps } from '@elastic/eui/src/components/steps/steps';
import {
  BREADCRUMBS,
  DETECTORS_NAV_ID,
  DETECTION_RULE_NAV_ID,
  FINDINGS_NAV_ID,
  ROUTES,
  // Wazuh: hide Alerts and Correlation rules steps.
  // THREAT_ALERTS_NAV_ID,
  // CORRELATIONS_RULE_NAV_ID,
} from '../../../../utils/constants';
import { RouteComponentProps } from 'react-router-dom';
import { GetStartedStep } from './GetStartedStep';
import { moreLink } from '../../utils/constants';
import { setBreadcrumbs } from '../../../../utils/helpers';
import { getApplication, getUseUpdatedUx } from '../../../../services/utils/constants';
import { PageHeader } from '../../../../components/PageHeader/PageHeader';

export interface GettingStartedPopupProps {
  onStepClicked: () => void;
  history: RouteComponentProps['history'];
}

export const GettingStartedContent: React.FC<GettingStartedPopupProps> = ({
  onStepClicked,
  history,
}) => {
  const useUpdatedUx = getUseUpdatedUx();
  if (useUpdatedUx) {
    setBreadcrumbs([BREADCRUMBS.GETTING_STARTED]);
  }
  const onActionClick = (appId: string, route: string) => {
    if (useUpdatedUx) {
      const url = getApplication().getUrlForApp(appId, { path: `#${route}` });
      getApplication().navigateToUrl(url);
    } else {
      history.push(route);
    }
  };

  const steps: EuiContainedStepProps[] = useMemo(
    () => [
      {
        title: 'Create security detector',
        children: (
          <GetStartedStep
            title={
              // Wazuh: hide alerts messaging in getting started content.
              // 'Identify security findings and threats from your log data with detection rules. Additionally, you can set up alerts based on rule conditions.'
              'Identify security findings and threats from your log data with rules.' // Wazuh: rename 'detection rules' to 'rules'
            }
            buttons={[
              {
                text: 'Create detector',
                onClick: () => {
                  onStepClicked();
                  onActionClick(DETECTORS_NAV_ID, ROUTES.DETECTORS_CREATE);
                },
                opts: {
                  fill: true,
                },
              },
            ]}
          />
        ),
      },
      /* {
        title: 'Set up threat intelligence analytics',
        children: (
          <GetStartedStep
            title={
              'Scan log data for indicators of compromise from threat intel data streams to identify malicious actors and security threats.'
            }
            buttons={[
              {
                text: 'Manage threat intelligence sources',
                onClick: () => {
                  onStepClicked();
                  onActionClick(THREAT_INTEL_NAV_ID, ROUTES.THREAT_INTEL_OVERVIEW);
                },
              },
            ]}
          />
        ),
      }, */
      {
        title: 'Discover security findings',
        children: (
          <GetStartedStep
            title={
              'After detectors are created, you can view insights and analyze security findings.'
            }
            buttons={[
              {
                text: 'View findings',
                onClick: () => {
                  onStepClicked();
                  onActionClick(FINDINGS_NAV_ID, ROUTES.FINDINGS);
                },
              },
            ]}
          />
        ),
      },
      // Wazuh: hide View alerts step.
      // {
      //   title: 'View security alerts',
      //   children: (
      //     <GetStartedStep
      //       title={'View alerts based on conditions you have specified from your detectors.'}
      //       buttons={[
      //         {
      //           text: 'View alerts',
      //           onClick: () => {
      //             onStepClicked();
      //             onActionClick(THREAT_ALERTS_NAV_ID, ROUTES.ALERTS);
      //           },
      //         },
      //       ]}
      //     />
      //   ),
      // },
      {
        title: 'Create custom rules for detectors',
        children: (
          <GetStartedStep
            title={'Create rule or fine tune existing rules that can be added to detectors.'}
            buttons={[
              {
                text: 'Manage rules',
                onClick: () => {
                  onStepClicked();
                  onActionClick(DETECTION_RULE_NAV_ID, ROUTES.RULES);
                },
              },
            ]}
          />
        ),
      },
      // Wazuh: hide Correlation rules step.
      // {
      //   title: 'Set up correlation rules',
      //   children: (
      //     <GetStartedStep
      //       title={'Correlate events across multiple log types to identify potential threats.'}
      //       buttons={[
      //         {
      //           text: 'Manage correlation rules',
      //           onClick: () => {
      //             onStepClicked();
      //             onActionClick(CORRELATIONS_RULE_NAV_ID, ROUTES.CORRELATION_RULES);
      //           },
      //         },
      //       ]}
      //     />
      //   ),
      // },
    ],
    [onStepClicked]
  );

  const stepsComponent = <EuiSteps steps={steps} titleSize={'s'} />;

  return (
    <>
      <PageHeader
        appDescriptionControls={[
          {
            description: 'Generates critical security insights from your event logs.',
            links: [
              {
                controlType: 'link',
                label: 'Learn more',
                href: moreLink,
                target: '_blank',
                flush: 'both',
              },
            ],
          },
        ]}
      >
        <EuiText size="s">
          <h2>Get started with Security analytics</h2>
        </EuiText>
        <EuiHorizontalRule />
        <EuiText size="s">
          <p>
            Generates critical security insights from your event logs.&nbsp;
            <EuiLink href={moreLink} target="_blank">
              Learn more
            </EuiLink>
          </p>
        </EuiText>
        <EuiSpacer />
      </PageHeader>
      {useUpdatedUx ? <EuiPanel>{stepsComponent}</EuiPanel> : stepsComponent}
    </>
  );
};
