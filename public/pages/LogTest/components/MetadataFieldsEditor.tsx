/*
 * Copyright Wazuh Inc.
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiComboBox,
  EuiFieldText,
  EuiFieldNumber,
  EuiButtonIcon,
  EuiButton,
  EuiSpacer,
} from '@elastic/eui';
import { METADATA_FIELDS } from '../constants';
import { MetadataEntry } from '../utils';

const UNIQUE_METADATA_FIELDS = (() => {
  const seen = new Set<string>();
  return METADATA_FIELDS.filter((f) => {
    if (seen.has(f.key)) {
      return false;
    }
    seen.add(f.key);
    return true;
  });
})();

export interface MetadataFieldsEditorProps {
  entries: MetadataEntry[];
  onChange: (entries: MetadataEntry[]) => void;
  disabled?: boolean;
}

export const MetadataFieldsEditor: React.FC<MetadataFieldsEditorProps> = ({
  entries,
  onChange,
  disabled = false,
}) => {
  const selectedKeys = entries.map((e) => e.key);
  const allFieldsSelected =
    selectedKeys.filter(Boolean).length >= UNIQUE_METADATA_FIELDS.length;

  const handleKeyChange = (index: number, newKey: string) => {
    const updated = entries.map((entry, i) => (i === index ? { key: newKey, value: '' } : entry));
    onChange(updated);
  };

  const handleValueChange = (index: number, newValue: string) => {
    const updated = entries.map((entry, i) =>
      i === index ? { ...entry, value: newValue } : entry
    );
    onChange(updated);
  };

  const handleRemove = (index: number) => {
    onChange(entries.filter((_, i) => i !== index));
  };

  const handleAdd = () => {
    onChange([...entries, { key: '', value: '' }]);
  };

  return (
    <>
      {entries.map((entry, index) => {
        const fieldDef = UNIQUE_METADATA_FIELDS.find((f) => f.key === entry.key);
        const isNumber = fieldDef?.type === 'number';

        const availableOptions = UNIQUE_METADATA_FIELDS.filter(
          (f) => !selectedKeys.includes(f.key) || f.key === entry.key
        ).map((f) => ({ label: f.key, value: f.key }));

        const selectedOption = entry.key ? [{ label: entry.key, value: entry.key }] : [];

        return (
          <React.Fragment key={index}>
            {index > 0 && <EuiSpacer size="s" />}
            <EuiFlexGroup gutterSize="s">
              <EuiFlexItem style={{ maxWidth: '400px' }}>
                <EuiComboBox
                  singleSelection={{ asPlainText: true }}
                  options={availableOptions}
                  selectedOptions={selectedOption}
                  onChange={(selected) => {
                    const opt = selected[0];
                    handleKeyChange(index, opt?.value ?? opt?.label ?? '');
                  }}
                  placeholder="Select a field..."
                  isDisabled={disabled}
                  isClearable={false}
                  compressed
                />
              </EuiFlexItem>
              <EuiFlexItem grow>
                {isNumber ? (
                  <EuiFieldNumber
                    value={entry.value}
                    onChange={(e) => handleValueChange(index, e.target.value)}
                    disabled={disabled || !entry.key}
                    placeholder="Value"
                    compressed
                    fullWidth
                  />
                ) : (
                  <EuiFieldText
                    value={entry.value}
                    onChange={(e) => handleValueChange(index, e.target.value)}
                    disabled={disabled || !entry.key}
                    placeholder="Value"
                    compressed
                    fullWidth
                  />
                )}
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiButtonIcon
                  iconType="trash"
                  color="danger"
                  aria-label="Remove field"
                  onClick={() => handleRemove(index)}
                  disabled={disabled}
                />
              </EuiFlexItem>
            </EuiFlexGroup>
          </React.Fragment>
        );
      })}
      {entries.length > 0 && <EuiSpacer size="s" />}
      <EuiButton
        size="s"
        iconType="plus"
        onClick={handleAdd}
        disabled={disabled || allFieldsSelected}
      >
        Add field
      </EuiButton>
    </>
  );
};
