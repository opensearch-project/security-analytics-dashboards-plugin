/*
 * Copyright Wazuh Inc.
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React, { useState } from 'react';
import { EuiFlexGroup, EuiFlexItem, EuiText, EuiSpacer } from '@elastic/eui';
import { FieldTextArray } from '../../../../../Rules/components/RuleEditor/components/FieldTextArray';
import {
  MitreState,
  MitreSection,
  MITRE_SECTIONS,
  parseMitreYml,
  dumpMitreYml,
} from '../../../../utils/mitre';

export interface MitreVisualEditorProps {
  mitreYml: string;
  onChange: (yml: string) => void;
}

const makeLabel = (section: MitreSection) => (
  <>
    <EuiFlexGroup gutterSize="s" alignItems="baseline" responsive={false}>
      <EuiFlexItem grow={false}>
        <EuiText size="s">
          <strong>{section.title}</strong>
          <i> - optional</i>
        </EuiText>
      </EuiFlexItem>
    </EuiFlexGroup>
    <EuiSpacer size="xs" />
  </>
);

export const MitreVisualEditor: React.FC<MitreVisualEditorProps> = ({ mitreYml, onChange }) => {
  const [state, setState] = useState<MitreState>(() => parseMitreYml(mitreYml));

  const handleChange = (field: keyof MitreState) => (items: string[]) => {
    const newState = { ...state, [field]: items };
    setState(newState);
    onChange(dumpMitreYml(newState));
  };

  return (
    <>
      {MITRE_SECTIONS.map((section, idx) => (
        <React.Fragment key={section.field}>
          <FieldTextArray
            name={`mitre_${section.field}`}
            label={makeLabel(section)}
            fields={state[section.field]}
            addButtonName={section.addButtonName}
            placeholder={section.placeholder}
            onChange={handleChange(section.field)}
          />
        </React.Fragment>
      ))}
    </>
  );
};
