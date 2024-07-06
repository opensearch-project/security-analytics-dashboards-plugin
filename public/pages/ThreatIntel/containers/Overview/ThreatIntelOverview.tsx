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
  EuiFlyout,
  EuiLink,
  EuiSpacer,
  EuiTabbedContent,
  EuiTabbedContentTab,
  EuiText,
  EuiTitle,
} from '@elastic/eui';
import React, { MouseEventHandler, useCallback, useContext, useEffect, useMemo } from 'react';
import { CoreServicesContext } from '../../../../components/core_services';
import { BREADCRUMBS, ROUTES } from '../../../../utils/constants';
import { useState } from 'react';
import {
  ThreatIntelNextStepId,
  ThreatIntelScanConfig,
  ThreatIntelSourceItem,
} from '../../../../../types';
import { RouteComponentProps } from 'react-router-dom';
import { ThreatIntelSourcesList } from '../../components/ThreatIntelSourcesList/ThreatIntelSourcesList';
import { deriveFormModelFromConfig, getThreatIntelNextStepsProps } from '../../utils/helpers';
import { ThreatIntelOverviewActions } from '../../components/ThreatIntelOverviewActions/ThreatIntelOverviewActions';
import ThreatIntelService from '../../../../services/ThreatIntelService';
import { ThreatIntelLogScanConfig } from '../../components/ThreatIntelLogScanConfig/ThreatIntelLogScanConfig';

export interface ThreatIntelOverviewProps extends RouteComponentProps {
  threatIntelService: ThreatIntelService;
}

export const ThreatIntelOverview: React.FC<ThreatIntelOverviewProps> = ({
  history,
  threatIntelService,
}) => {
  const context = useContext(CoreServicesContext);
  const [threatIntelSources, setThreatIntelSources] = useState<ThreatIntelSourceItem[]>([]);
  const [scanConfig, setScanConfig] = useState<ThreatIntelScanConfig | undefined>(undefined);
  const [flyoutContent, setFlyoutContent] = useState<React.ReactNode>(null);

  const onEditScanConfig = () => {
    history.push({
      pathname: `${ROUTES.THREAT_INTEL_EDIT_SCAN_CONFIG}`,
      state: { scanConfig },
    });
  };

  const logSources = useMemo(() => {
    if (!scanConfig) {
      return [];
    }

    return deriveFormModelFromConfig(scanConfig).logSources;
  }, [scanConfig]);

  const addThreatIntelSourceActionHandler = useCallback(() => {
    history.push({
      pathname: ROUTES.THREAT_INTEL_ADD_CUSTOM_SOURCE,
    });
  }, []);

  const getScanConfig = async () => {
    try {
      const res = await threatIntelService.getThreatIntelScanConfig();

      if (res.ok) {
        setScanConfig(res.response);
      }
    } catch (e: any) {
      console.log('failed to get scan config');
    }
  };

  const toggleScan = async () => {
    if (scanConfig) {
      const res = await threatIntelService.updateThreatIntelMonitor(scanConfig.id, {
        ...scanConfig,
        enabled: !scanConfig.enabled,
      });

      if (res.ok) {
        getScanConfig();
      }
    }
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
        id: 'log-scan-config',
        name: <span>Scan configuration</span>,
        content: (
          <ThreatIntelLogScanConfig
            scanConfig={scanConfig}
            threatIntelSourceCount={threatIntelSources.length}
            threatIntelService={threatIntelService}
            toggleScan={toggleScan}
            refreshScanConfig={getScanConfig}
            setFlyoutContent={(content) => setFlyoutContent(content)}
            scanConfigActionHandler={onEditScanConfig}
            addThreatIntelActionHandler={addThreatIntelSourceActionHandler}
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

  useEffect(() => {
    const searchSources = async () => {
      const res = await threatIntelService.searchThreatIntelSource();

      if (res.ok) {
        setThreatIntelSources(res.response);
      }
    };

    searchSources();
    getScanConfig();
  }, [threatIntelService]);

  const nextStepClickHandlerById: Record<ThreatIntelNextStepId, MouseEventHandler> = {
    ['add-source']: addThreatIntelSourceActionHandler,
    ['configure-scan']: () => {
      history.push({
        pathname:
          logSources.length > 0
            ? ROUTES.THREAT_INTEL_EDIT_SCAN_CONFIG
            : ROUTES.THREAT_INTEL_CREATE_SCAN_CONFIG,
        state: { scanConfig },
      });
    },
  };

  const threatIntelNextStepsProps = getThreatIntelNextStepsProps(
    threatIntelSources.length > 0,
    logSources.length > 0
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
            toggleScan={toggleScan}
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
        initialIsOpen={threatIntelSources.length === 0 || logSources.length === 0}
      >
        <EuiSpacer />
        <EuiFlexGroup wrap>
          {threatIntelNextStepsProps.map(
            ({ id, title, description, footerButtonProps: { text, disabled } }) => (
              <EuiFlexItem key={id}>
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
      {flyoutContent && (
        <EuiFlyout onClose={() => setFlyoutContent(null)}>
          <EuiSpacer />
          {flyoutContent}
        </EuiFlyout>
      )}
    </>
  );
};
