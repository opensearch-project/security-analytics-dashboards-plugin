/*
 * Copyright Wazuh Inc.
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React, { useState } from 'react';
import { EuiFlexGroup, EuiFlexItem, EuiText, EuiSpacer } from '@elastic/eui';
import { FieldTextArray } from '../../../../../Rules/components/RuleEditor/components/FieldTextArray';
import {
  ComplianceKey,
  ComplianceState,
  ComplianceFramework,
  COMPLIANCE_FRAMEWORKS,
  parseComplianceYml,
  dumpComplianceYml,
} from '../../../../utils/compliance';

export interface ComplianceVisualEditorProps {
  complianceYml: string;
  onChange: (yml: string) => void;
}

const makeLabel = (framework: ComplianceFramework) => (
  <>
    <EuiFlexGroup gutterSize="s" alignItems="baseline" responsive={false}>
      <EuiFlexItem grow={false}>
        <EuiText size="s">
          <strong>{framework.label}</strong>
        </EuiText>
      </EuiFlexItem>
    </EuiFlexGroup>
    <EuiSpacer size="xs" />
  </>
);

export const ComplianceVisualEditor: React.FC<ComplianceVisualEditorProps> = ({
  complianceYml,
  onChange,
}) => {
  const [state, setState] = useState<ComplianceState>(() => parseComplianceYml(complianceYml));

  const handleChange = (key: ComplianceKey) => (items: string[]) => {
    const newState = { ...state, [key]: items };
    setState(newState);
    onChange(dumpComplianceYml(newState));
  };

  return (
    <>
      {COMPLIANCE_FRAMEWORKS.map((framework, idx) => (
        <React.Fragment key={framework.key}>
          <FieldTextArray
            name={`compliance_${framework.key}`}
            label={makeLabel(framework)}
            fields={state[framework.key]}
            addButtonName={framework.addButtonName}
            placeholder={framework.placeholder}
            onChange={handleChange(framework.key)}
          />
        </React.Fragment>
      ))}
    </>
  );
};
