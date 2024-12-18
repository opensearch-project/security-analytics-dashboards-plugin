/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import {
  EuiCallOut,
  EuiCompressedCheckbox,
  EuiLink,
  EuiSpacer,
  EuiText,
  htmlIdGenerator,
} from '@elastic/eui';
import { buildRouteUrl } from '../../../../../../utils/helpers';
import { ROUTES, THREAT_INTEL_NAV_ID } from '../../../../../../utils/constants';

export interface ThreatIntelligenceProps {
  isEdit: boolean;
  threatIntelChecked: boolean;
  onThreatIntelChange: (checked: boolean) => void;
}

export const ThreatIntelligence: React.FC<ThreatIntelligenceProps> = ({
  threatIntelChecked,
  onThreatIntelChange,
  isEdit,
}) => {
  const [shouldShowEditUI] = useState(isEdit && threatIntelChecked);
  const threatIntelUrl = useMemo(() => {
    return buildRouteUrl(THREAT_INTEL_NAV_ID, ROUTES.THREAT_INTEL_OVERVIEW);
  }, []);

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
              <EuiLink target="_blank" href={threatIntelUrl}>
                Threat intelligence
              </EuiLink>{' '}
              page.
            </p>
          </EuiText>
        </>
      )}
      {shouldShowEditUI && (
        <>
          <EuiText size="m">
            <h3>Threat intelligence feeds</h3>
          </EuiText>

          <EuiText size="s">
            <p>
              Match your data source against known malicious IP-addresses. Available for standard
              log types only.
            </p>
          </EuiText>
          <EuiSpacer size="s" />
          <EuiCallOut
            size="s"
            title={
              <p>
                To match your data against known indicators of compromise we recommend configuring
                scan using the new{' '}
                <EuiLink target="_blank" href={threatIntelUrl}>
                  Threat Intelligence
                </EuiLink>{' '}
                platform and disabling threat intelligence in the detector.
              </p>
            }
          />
          <EuiSpacer size="s" />
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
