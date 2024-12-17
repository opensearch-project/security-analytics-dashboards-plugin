/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { EuiCompressedCheckbox, EuiLink, EuiText, EuiTitle, htmlIdGenerator } from '@elastic/eui';
import { navigateToRoute } from '../../../../../../utils/helpers';
import { DETECTORS_NAV_ID, ROUTES } from '../../../../../../utils/constants';
import { RouteComponentProps } from 'react-router-dom';

export interface ThreatIntelligenceProps {
  isEdit: boolean;
  history: RouteComponentProps['history'];
  threatIntelChecked: boolean;
  onThreatIntelChange: (checked: boolean) => void;
}

export const ThreatIntelligence: React.FC<ThreatIntelligenceProps> = ({
  threatIntelChecked,
  onThreatIntelChange,
  history,
  isEdit,
}) => {
  const [shouldShowEditUI] = useState(isEdit && threatIntelChecked);

  return (
    <>
      {!shouldShowEditUI && (
        <>
          <EuiText size="m">
            <h3>Threat intelligence feeds</h3>
          </EuiText>
          <EuiText size="s">
            <p>
              To match your data source against known indicators of compromise configure logs scan
              with threat intel sources on the{' '}
              <EuiLink
                onClick={() =>
                  navigateToRoute(history, DETECTORS_NAV_ID, ROUTES.THREAT_INTEL_OVERVIEW)
                }
              >
                Threat intelligence
              </EuiLink>{' '}
              page.
            </p>
          </EuiText>
        </>
      )}
      {shouldShowEditUI && (
        <>
          <EuiTitle size="m">
            <h3>Threat intelligence feeds</h3>
          </EuiTitle>

          <EuiText size="s">
            <p>
              Match your data source against known malicious IP-addresses. Available for standard
              log types only.
            </p>
          </EuiText>
          <EuiCompressedCheckbox
            id={htmlIdGenerator()()}
            label="Enable threat intelligence-based detection"
            checked={threatIntelChecked}
            onChange={(e) => onThreatIntelChange(e.target.checked)}
          />
        </>
      )}
    </>
  );
};
