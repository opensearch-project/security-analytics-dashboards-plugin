/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { EuiSmallButton, EuiFlexGroup, EuiFlexItem } from '@elastic/eui';
import { StatusWithIndicator } from '../../../../components/Utility/StatusWithIndicator';
import { RouteComponentProps } from 'react-router-dom';
import { AlertTabId, FindingTabId, ROUTES } from '../../../../utils/constants';
import { ThreatIntelScanConfig } from '../../../../../types';
import { ConfigureThreatIntelScanStep } from '../../utils/constants';

export interface ThreatIntelOverviewActionsProps {
  sourceCount: number;
  scanConfig?: ThreatIntelScanConfig;
  history: RouteComponentProps['history'];
  toggleScan: () => Promise<any>;
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
  toggleScan,
}) => {
  const scanIsSetup = !!scanConfig;
  const scanRunning = scanIsSetup && scanConfig.enabled;
  const alertTriggerSetup = scanIsSetup && scanConfig.triggers.length > 0;
  const [togglingScan, setTogglingScan] = useState(false);

  let status: React.ReactNode = null;
  let actions = [];

  if (sourceCount === 0 || !scanIsSetup) {
    status = statusByScanState['notRunning'];
    actions.push({
      label: 'Configure scan',
      disabled: sourceCount === 0,
      fill: true,
      onClick: () => {
        history.push({
          pathname: ROUTES.THREAT_INTEL_CREATE_SCAN_CONFIG,
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
          search: `?detectionType=${FindingTabId.ThreatIntel}`,
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
            pathname: ROUTES.THREAT_INTEL_EDIT_SCAN_CONFIG,
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
            search: `?detectionType=${AlertTabId.ThreatIntel}`,
          });
        },
      });
    }
  } else {
    status = statusByScanState['stopped'];
    actions.push({
      label: 'Start scan',
      disabled: false,
      isLoading: togglingScan,
      fill: true,
      onClick: () => {
        setTogglingScan(true);
        toggleScan().then(() => setTogglingScan(false));
      },
    });
  }

  return (
    <EuiFlexGroup alignItems="center" gutterSize="m">
      <EuiFlexItem>{status}</EuiFlexItem>
      {actions.map((action, idx) => (
        <EuiFlexItem grow={false} key={idx}>
          <EuiSmallButton
            fill={action.fill}
            disabled={action.disabled}
            isLoading={action.isLoading}
            onClick={action.onClick}
          >
            {action.label}
          </EuiSmallButton>
        </EuiFlexItem>
      ))}
    </EuiFlexGroup>
  );
};
