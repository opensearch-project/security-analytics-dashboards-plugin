/*
 * Copyright Wazuh Inc.
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React, { useEffect } from 'react';
import { EuiCodeEditor } from '@elastic/eui';

const COMPLIANCE_EXAMPLE = `pci_dss:
  - ""
gdpr:
  - ""
cmmc:
  - ""
nist_800_53:
  - ""
nist_800_171:
  - ""
hipaa:
  - ""
iso_27001:
  - ""
nis2:
  - ""
tsc:
  - ""
fedramp:
  - ""
`;

export interface ComplianceVisualEditorProps {
  complianceYml: string;
  onChange: (yml: string) => void;
}

export const ComplianceVisualEditor: React.FC<ComplianceVisualEditorProps> = ({
  complianceYml,
  onChange,
}) => {
  useEffect(() => {
    if (!complianceYml) {
      onChange(COMPLIANCE_EXAMPLE);
    }
  }, []);

  return (
    <EuiCodeEditor
      mode="yaml"
      width="600px"
      height="200px"
      value={complianceYml || COMPLIANCE_EXAMPLE}
      onChange={onChange}
      setOptions={{ fontSize: '12px' }}
    />
  );
};
