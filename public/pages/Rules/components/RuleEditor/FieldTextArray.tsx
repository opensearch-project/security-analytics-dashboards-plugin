/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiButton,
  EuiButtonIcon,
  EuiFieldText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow,
  EuiSpacer,
  EuiToolTip,
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
  placeholder?: string;
}

export const FieldTextArray: React.FC<FieldTextArrayProps> = ({
  addButtonName,
  label,
  name,
  fields,
  onFieldEdit,
  onFieldRemove,
  onFieldAdd,
  placeholder = '',
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
                    placeholder={placeholder}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      onFieldEdit(e.target.value, index);
                    }}
                    data-test-subj={`rule_${name
                      .toLowerCase()
                      .replaceAll(' ', '_')}_field_${index}`}
                  />
                </EuiFlexItem>
                {index > 0 ? (
                  <EuiFlexItem grow={false} className={'field-text-array-remove'}>
                    <EuiToolTip title={'Remove'}>
                      <EuiButtonIcon
                        aria-label={'Remove'}
                        iconType={'trash'}
                        color="danger"
                        onClick={() => onFieldRemove(index)}
                      />
                    </EuiToolTip>
                  </EuiFlexItem>
                ) : null}
              </EuiFlexGroup>
            );
          })}
          <EuiSpacer size="m" />
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
