/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiAccordion,
  EuiBadge,
  EuiButton,
  EuiCard,
  EuiFlexGroup,
  EuiFlexItem,
  EuiIcon,
  EuiLink,
  EuiPanel,
  EuiSpacer,
  EuiTabbedContent,
  EuiTabbedContentTab,
  EuiText,
  EuiTitle,
} from '@elastic/eui';
import React, { MouseEventHandler, useContext, useEffect } from 'react';
import { CoreServicesContext } from '../../../components/core_services';
import { BREADCRUMBS, ROUTES } from '../../../utils/constants';
import { useState } from 'react';
import { threatIntelNextStepsProps } from '../utils/contants';
import { ThreatIntelNextStepId, ThreatIntelSourceItem, dummySource } from '../../../../types';
import { RouteComponentProps } from 'react-router-dom';

export interface ThreatIntelOverviewProps extends RouteComponentProps {}

export const ThreatIntelOverview: React.FC<ThreatIntelOverviewProps> = ({ history }) => {
  const context = useContext(CoreServicesContext);
  const [showNextSteps, setShowNextSteps] = useState(true);
  const [threatIntelSources, setThreatIntelSources] = useState<ThreatIntelSourceItem[]>([
    dummySource,
  ]);

  useEffect(() => {
    context?.chrome.setBreadcrumbs([
      BREADCRUMBS.SECURITY_ANALYTICS,
      BREADCRUMBS.THREAT_INTEL_OVERVIEW,
    ]);
  }, []);

  const nextStepClickHandlerById: Record<ThreatIntelNextStepId, MouseEventHandler> = {
    ['connect']: () => {},
    ['configure-scan']: () => {},
  };

  const tabs: EuiTabbedContentTab[] = [
    {
      id: 'threat-intel-sources',
      name: <span>Threat intel sources ({threatIntelSources.length})</span>,
      content: (
        <>
          <EuiSpacer />
          <EuiTitle size="s">
            <h4>Threat intelligence sources ({threatIntelSources.length})</h4>
          </EuiTitle>
          <EuiSpacer />
          <EuiFlexGroup>
            <EuiFlexItem style={{ maxWidth: 400 }}>
              <EuiCard className="connect-threat-intel-source-card" title="" description="">
                <EuiFlexGroup justifyContent="center" style={{ height: '100%' }}>
                  <EuiFlexItem style={{ alignSelf: 'center' }}>
                    <span>Connect to your custom threat intel in Amazon S3</span>
                    <EuiSpacer />
                    <EuiButton
                      onClick={() => {
                        history.push({
                          pathname: ROUTES.THREAT_INTEL_CONNECT_CUSTOM_SOURCE,
                        });
                      }}
                    >
                      Connect threat intel source
                    </EuiButton>
                  </EuiFlexItem>
                </EuiFlexGroup>
              </EuiCard>
            </EuiFlexItem>
            {threatIntelSources.map((source) => {
              return (
                <EuiFlexItem style={{ maxWidth: 400 }}>
                  <EuiCard
                    // icon={source.icon}
                    title={source.feedName}
                    description={source.description}
                    footer={
                      <>
                        <EuiButton>View details</EuiButton>
                        <EuiSpacer size="m" />
                        <EuiIcon
                          type={'dot'}
                          color={source.isEnabled ? 'success' : 'text'}
                          style={{ marginBottom: 4 }}
                        />{' '}
                        Connected
                      </>
                    }
                  >
                    {source.iocTypes.map((iocType) => (
                      <EuiBadge>{iocType}</EuiBadge>
                    ))}
                  </EuiCard>
                </EuiFlexItem>
              );
            })}
          </EuiFlexGroup>
        </>
      ),
    },
  ];

  return (
    <>
      <EuiTitle size="m">
        <h1>Threat intelligence</h1>
      </EuiTitle>
      <EuiText color="subdued">
        <span>
          Scan log data for indicators of compromise from threat intel data streams to identify
          malicious actors and security threats.{' '}
          <EuiLink href="" external>
            Learn more
          </EuiLink>
          .
        </span>
      </EuiText>
      <EuiSpacer />
      <EuiAccordion
        id="threat-intel-management-steps"
        buttonContent="Get started"
        initialIsOpen={showNextSteps}
      >
        <EuiSpacer />
        <EuiFlexGroup>
          {threatIntelNextStepsProps.map(({ id, title, description, footerButtonText }) => (
            <EuiFlexItem>
              <EuiCard
                title={title}
                description={description}
                footer={
                  <EuiButton onClick={nextStepClickHandlerById[id]}>{footerButtonText}</EuiButton>
                }
              />
            </EuiFlexItem>
          ))}
        </EuiFlexGroup>
      </EuiAccordion>
      <EuiSpacer />
      <EuiPanel>
        <EuiTabbedContent tabs={tabs} initialSelectedTab={tabs[0]} />
      </EuiPanel>
    </>
  );
};
