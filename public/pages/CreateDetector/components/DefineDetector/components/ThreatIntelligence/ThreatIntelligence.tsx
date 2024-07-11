/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EuiCompressedCheckbox, EuiText, EuiTitle, htmlIdGenerator } from '@elastic/eui';

export interface ThreatIntelligenceProps {
  threatIntelChecked: boolean;
  onThreatIntelChange: (checked: boolean) => void;
}

export const ThreatIntelligence: React.FC<ThreatIntelligenceProps> = ({
  threatIntelChecked,
  onThreatIntelChange,
}) => {
  return (
    <>
      <EuiTitle size="m">
        <h3>Threat intelligence feeds</h3>
      </EuiTitle>

      <EuiText>
        <p>
          Match your data source against known malicious IP-addresses. Available for standard log
          types only.
        </p>
      </EuiText>
      <EuiCompressedCheckbox
        id={htmlIdGenerator()()}
        label="Enable threat intelligence-based detection"
        checked={threatIntelChecked}
        onChange={(e) => onThreatIntelChange(e.target.checked)}
      />
    </>
  );
};
