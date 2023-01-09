/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiButton,
  EuiFieldText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow,
  EuiSpacer,
} from '@elastic/eui';
import React, { ChangeEvent } from 'react';

export interface FieldTextArrayProps {
  label: string | React.ReactNode;
  name: string;
  fields: string[];
  addButtonName: string;
  onFieldEdit: (value: string, fieldIndex: number) => void;
  onFieldRemove: (fieldIndex: number) => void;
  onFieldAdd: () => void;
}

export const FieldTextArray: React.FC<FieldTextArrayProps> = ({
  addButtonName,
  label,
  name,
  fields,
  onFieldEdit,
  onFieldRemove,
  onFieldAdd,
}) => {
  return (
    <>
      <EuiFormRow label={label}>
        <>
          {fields.map((ref: string, index: number) => {
            return (
              <EuiFlexGroup key={index}>
                <EuiFlexItem style={{ minWidth: '100%' }}>
                  <EuiFieldText
                    value={ref}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      onFieldEdit(e.target.value, index);
                    }}
                    data-test-subj={`rule_${name
                      .toLowerCase()
                      .replaceAll(' ', '_')}_field_${index}`}
                  />
                </EuiFlexItem>
                {index > 0 ? (
                  <EuiFlexItem grow={false}>
                    <EuiButton onClick={() => onFieldRemove(index)}>Remove</EuiButton>
                  </EuiFlexItem>
                ) : null}
              </EuiFlexGroup>
            );
          })}
          <EuiSpacer size="s" />
          <EuiButton
            type="button"
            className="secondary"
            onClick={() => {
              onFieldAdd();
            }}
          >
            {addButtonName}
          </EuiButton>
        </>
      </EuiFormRow>
      <EuiSpacer />
    </>
  );
};
