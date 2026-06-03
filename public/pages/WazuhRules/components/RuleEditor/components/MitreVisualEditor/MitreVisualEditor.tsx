/*
 * Copyright Wazuh Inc.
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React, { useState } from 'react';
import {
  EuiCompressedFieldText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiSmallButton,
  EuiSmallButtonIcon,
  EuiSpacer,
  EuiText,
  EuiToolTip,
} from '@elastic/eui';
import { MitreEntry, MitreState, MITRE_SECTIONS } from '../../../../utils/mitre';

export interface MitreVisualEditorProps {
  mitre: MitreState;
  onChange: (state: MitreState) => void;
}

export const MitreVisualEditor: React.FC<MitreVisualEditorProps> = ({ mitre, onChange }) => {
  const [state, setState] = useState<MitreState>(mitre);

  const isEntryInvalid = (entry: MitreEntry) => !!entry.id !== !!entry.name;

  const update = (newState: MitreState) => {
    setState(newState);
    onChange(newState);
  };

  const handleChange = (
    field: keyof MitreState,
    idx: number,
    key: keyof MitreEntry,
    value: string
  ) => {
    update({
      ...state,
      [field]: state[field].map((entry, i) => (i === idx ? { ...entry, [key]: value } : entry)),
    });
  };

  const handleAdd = (field: keyof MitreState) => {
    update({ ...state, [field]: [...state[field], { id: '', name: '' }] });
  };

  const handleRemove = (field: keyof MitreState, idx: number) => {
    update({ ...state, [field]: state[field].filter((_, i) => i !== idx) });
  };

  return (
    <>
      {MITRE_SECTIONS.map((section, sectionIdx) => (
        <React.Fragment key={section.field}>
          {sectionIdx > 0 && <EuiSpacer size="l" />}

          <EuiText size="s">
            <strong>{section.title}</strong> <i>- optional</i>
          </EuiText>

          <div style={{ maxWidth: 600 }}>
            {state[section.field].length > 0 && (
              <>
                <EuiSpacer size="s" />
                <EuiFlexGroup gutterSize="s" responsive={false}>
                  <EuiFlexItem>
                    <EuiText size="xs" color="subdued">
                      <strong>ID</strong>
                    </EuiText>
                  </EuiFlexItem>
                  <EuiFlexItem>
                    <EuiText size="xs" color="subdued">
                      <strong>Name</strong>
                    </EuiText>
                  </EuiFlexItem>
                  <EuiFlexItem grow={false} style={{ width: 28 }} />
                </EuiFlexGroup>
              </>
            )}

            {state[section.field].map((entry, idx) => {
              const invalid = isEntryInvalid(entry);
              return (
                <React.Fragment key={idx}>
                  <EuiSpacer size="xs" />
                  <EuiFlexGroup gutterSize="s" alignItems="center" responsive={false}>
                    <EuiFlexItem>
                      <EuiCompressedFieldText
                        value={entry.id}
                        placeholder={section.idPlaceholder}
                        isInvalid={!!entry.name && !entry.id}
                        onChange={(e) => handleChange(section.field, idx, 'id', e.target.value)}
                        data-test-subj={`mitre_${section.field}_id_${idx}`}
                      />
                    </EuiFlexItem>
                    <EuiFlexItem>
                      <EuiCompressedFieldText
                        value={entry.name}
                        placeholder={section.namePlaceholder}
                        isInvalid={!!entry.id && !entry.name}
                        onChange={(e) => handleChange(section.field, idx, 'name', e.target.value)}
                        data-test-subj={`mitre_${section.field}_name_${idx}`}
                      />
                    </EuiFlexItem>
                    <EuiFlexItem grow={false}>
                      <EuiToolTip title="Remove">
                        <EuiSmallButtonIcon
                          aria-label="Remove"
                          iconType="trash"
                          color="danger"
                          onClick={() => handleRemove(section.field, idx)}
                        />
                      </EuiToolTip>
                    </EuiFlexItem>
                  </EuiFlexGroup>
                  {invalid && (
                    <EuiText size="xs" color="danger">
                      Both ID and name are required.
                    </EuiText>
                  )}
                </React.Fragment>
              );
            })}
          </div>

          <EuiSpacer size="s" />
          <EuiSmallButton type="button" onClick={() => handleAdd(section.field)}>
            {section.addButtonName}
          </EuiSmallButton>
        </React.Fragment>
      ))}
    </>
  );
};
