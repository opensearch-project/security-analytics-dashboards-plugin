/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiAccordion,
  EuiButton,
  EuiCard,
  EuiFlexGroup,
  EuiFlexItem,
  EuiLink,
  EuiSpacer,
  EuiTabbedContent,
  EuiTabbedContentTab,
  EuiText,
  EuiTitle,
} from '@elastic/eui';
import React, { MouseEventHandler, useContext, useEffect, useMemo } from 'react';
import { CoreServicesContext } from '../../../../components/core_services';
import { BREADCRUMBS, ROUTES } from '../../../../utils/constants';
import { useState } from 'react';
import {
  ThreatIntelNextStepId,
  ThreatIntelScanConfig,
  ThreatIntelSourceItem,
  dummyLogSource,
  dummySource,
} from '../../../../../types';
import { RouteComponentProps } from 'react-router-dom';
import { ThreatIntelSourcesList } from '../../components/ThreatIntelSourcesList/ThreatIntelSourcesList';
import { ThreatIntelLogSources } from '../../components/ThreatIntelLogSources/ThreatIntelLogSources';
import { getEmptyThreatIntelAlertTrigger, getThreatIntelNextStepsProps } from '../../utils/helpers';
import { ThreatIntelAlertTriggers } from '../../components/ThreatIntelAlertTriggers/ThreatIntelAlertTriggers';
import { ThreatIntelOverviewActions } from '../../components/ThreatIntelOverviewActions/ThreatIntelOverviewActions';

export interface ThreatIntelOverviewProps extends RouteComponentProps {}

export const ThreatIntelOverview: React.FC<ThreatIntelOverviewProps> = ({ history }) => {
  const context = useContext(CoreServicesContext);
  const [threatIntelSources, setThreatIntelSources] = useState<ThreatIntelSourceItem[]>([
    dummySource,
  ]);
  const [scanConfig, setScanConfig] = useState<ThreatIntelScanConfig>({
    isRunning: true,
    logSources: threatIntelSources.length ? [dummyLogSource] : [],
    triggers: [getEmptyThreatIntelAlertTrigger()],
  });

  const onEditScanConfig = () => {
    history.push({
      pathname: `${ROUTES.THREAT_INTEL_SCAN_CONFIG}`,
      state: { scanConfig },
    });
  };

  const tabs: EuiTabbedContentTab[] = useMemo(
    () => [
      {
        id: 'threat-intel-sources',
        name: <span>Threat intel sources ({threatIntelSources.length})</span>,
        content: (
          <ThreatIntelSourcesList threatIntelSources={threatIntelSources} history={history} />
        ),
      },
      {
        id: 'log-sources',
        name: <span>Log sources</span>,
        content: (
          <ThreatIntelLogSources
            logSources={scanConfig.logSources}
            threatIntelSourceCount={threatIntelSources.length}
            scanConfigActionHandler={onEditScanConfig}
          />
        ),
      },
      {
        id: 'alert-triggers',
        name: <span>Alert triggers</span>,
        content: (
          <ThreatIntelAlertTriggers
            triggers={scanConfig.triggers}
            threatIntelSourceCount={threatIntelSources.length}
            scanConfigActionHandler={onEditScanConfig}
          />
        ),
      },
    ],
    [scanConfig, threatIntelSources]
  );

  useEffect(() => {
    context?.chrome.setBreadcrumbs([
      BREADCRUMBS.SECURITY_ANALYTICS,
      BREADCRUMBS.THREAT_INTEL_OVERVIEW,
    ]);
  }, []);

  const nextStepClickHandlerById: Record<ThreatIntelNextStepId, MouseEventHandler> = {
    ['add-source']: () => {
      history.push({
        pathname: ROUTES.THREAT_INTEL_ADD_CUSTOM_SOURCE,
      });
    },
    ['configure-scan']: () => {
      history.push({
        pathname: ROUTES.THREAT_INTEL_SCAN_CONFIG,
        state: { scanConfig },
      });
    },
  };

  const threatIntelNextStepsProps = getThreatIntelNextStepsProps(
    threatIntelSources.length > 0,
    scanConfig.logSources.length > 0
  );

  return (
    <>
      <EuiFlexGroup alignItems="flexStart">
        <EuiFlexItem>
          <EuiTitle size="m">
            <h1>Threat intelligence</h1>
          </EuiTitle>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <ThreatIntelOverviewActions
            history={history}
            scanConfig={scanConfig}
            sourceCount={threatIntelSources.length}
          />
        </EuiFlexItem>
      </EuiFlexGroup>
      <EuiSpacer size="s" />
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
        initialIsOpen={threatIntelSources.length === 0}
      >
        <EuiSpacer />
        <EuiFlexGroup>
          {threatIntelNextStepsProps.map(
            ({ id, title, description, footerButtonProps: { text, disabled } }) => (
              <EuiFlexItem>
                <EuiCard
                  title={title}
                  description={description}
                  footer={
                    <EuiButton disabled={disabled} onClick={nextStepClickHandlerById[id]}>
                      {text}
                    </EuiButton>
                  }
                />
              </EuiFlexItem>
            )
          )}
        </EuiFlexGroup>
      </EuiAccordion>
      <EuiSpacer />
      <EuiTabbedContent tabs={tabs} initialSelectedTab={tabs[0]} />
    </>
  );
};
