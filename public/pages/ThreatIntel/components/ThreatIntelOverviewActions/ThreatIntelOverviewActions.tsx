/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EuiButton, EuiFlexGroup, EuiFlexItem } from '@elastic/eui';
import { StatusWithIndicator } from '../../../../components/Utility/StatusWithIndicator';
import { RouteComponentProps } from 'react-router-dom';
import { ROUTES } from '../../../../utils/constants';
import { ThreatIntelScanConfig } from '../../../../../types';
import { ConfigureThreatIntelScanStep } from '../../utils/constants';

export interface ThreatIntelOverviewActionsProps {
  sourceCount: number;
  scanConfig: ThreatIntelScanConfig;
  history: RouteComponentProps['history'];
}

const statusByScanState = {
  notRunning: <StatusWithIndicator text="Real-time scan not running" indicatorColor="text" />,
  running: <StatusWithIndicator text="Real-time scan running" indicatorColor="success" />,
  stopped: <StatusWithIndicator text="Real-time scan stopped" indicatorColor="text" />,
};

export const ThreatIntelOverviewActions: React.FC<ThreatIntelOverviewActionsProps> = ({
  sourceCount,
  scanConfig,
  history,
}) => {
  const scanIsSetup = scanConfig.logSources.length > 0;
  const scanRunning = scanConfig.isRunning;
  const alertTriggerSetup = scanConfig.triggers.length > 0;

  let status: React.ReactNode = null;
  let actions = [];

  if (sourceCount === 0) {
    status = statusByScanState['notRunning'];
    actions.push({
      label: 'Configure scan',
      disabled: true,
      fill: true,
      onClick: () => {},
    });
  } else if (!scanIsSetup) {
    status = statusByScanState['notRunning'];
    actions.push({
      label: 'Configure scan',
      disabled: false,
      fill: true,
      onClick: () => {
        history.push({
          pathname: ROUTES.THREAT_INTEL_SCAN_CONFIG,
        });
      },
    });
  } else if (scanRunning) {
    status = statusByScanState['running'];
    actions.push({
      label: 'View findings',
      disabled: false,
      fill: false,
      onClick: () => {
        history.push({
          pathname: ROUTES.FINDINGS,
          search: '?detectionType=Threat intelligence',
        });
      },
    });

    if (!alertTriggerSetup) {
      actions.push({
        label: 'Set up alerts',
        disabled: false,
        fill: true,
        onClick: () => {
          history.push({
            pathname: ROUTES.THREAT_INTEL_SCAN_CONFIG,
            state: {
              scanConfig,
              step: ConfigureThreatIntelScanStep.SetupAlertTriggers,
            },
          });
        },
      });
    } else {
      actions.push({
        label: 'View alerts',
        disabled: false,
        fill: false,
        onClick: () => {
          history.push({
            pathname: ROUTES.ALERTS,
            search: '?detectionType=Threat intelligence',
          });
        },
      });
    }
  } else {
    status = statusByScanState['stopped'];
    actions.push({
      label: 'Start scan',
      disabled: false,
      fill: true,
      onClick: () => {},
    });
  }

  return (
    <EuiFlexGroup alignItems="center" gutterSize="m">
      <EuiFlexItem>{status}</EuiFlexItem>
      {actions.map((action, idx) => (
        <EuiFlexItem grow={false}>
          <EuiButton fill={action.fill} disabled={action.disabled} onClick={action.onClick}>
            {action.label}
          </EuiButton>
        </EuiFlexItem>
      ))}
    </EuiFlexGroup>
  );
};
