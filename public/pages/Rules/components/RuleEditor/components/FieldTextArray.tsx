/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiSmallButton,
  EuiButtonIcon,
  EuiFieldText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow,
  EuiSpacer,
  EuiToolTip,
} from '@elastic/eui';
import React, { ChangeEvent, useEffect, useState } from 'react';

export interface FieldTextArrayProps {
  label: string | React.ReactNode;
  name: string;
  fields: string[];
  addButtonName: string;
  onChange: (values: string[]) => void;
  isInvalid?: boolean;
  placeholder?: string;
  error?: string | string[];
}

export const FieldTextArray: React.FC<FieldTextArrayProps> = ({
  addButtonName,
  label,
  name,
  fields,
  onChange,
  placeholder = '',
  error = '',
  isInvalid,
}) => {
  const [values, setValues] = useState<string[]>([]);

  useEffect(() => {
    let newValues = fields.length ? [...fields] : [''];
    setValues(newValues);
  }, []);

  const updateValues = (values: string[]) => {
    setValues(values);

    let eventValue = values.filter((val: string) => val);
    onChange(eventValue);
  };

  return (
    <>
      <EuiFormRow label={label} isInvalid={isInvalid} error={error}>
        <>
          {values.map((ref: string, index: number) => {
            return (
              <EuiFlexGroup key={index}>
                <EuiFlexItem style={{ minWidth: '100%' }}>
                  <EuiFieldText
                    name={name}
                    value={ref}
                    placeholder={placeholder}
                    isInvalid={isInvalid}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      let newValues = [...values];
                      newValues[index] = e.target.value;
                      updateValues(newValues);
                    }}
                    data-test-subj={`rule_${name
                      .toLowerCase()
                      .replaceAll(' ', '_')}_field_${index}`}
                  />
                </EuiFlexItem>
                {values.length > 1 ? (
                  <EuiFlexItem grow={false} className={'field-text-array-remove'}>
                    <EuiToolTip title={'Remove'}>
                      <EuiButtonIcon
                        aria-label={'Remove'}
                        iconType={'trash'}
                        color="danger"
                        onClick={() => {
                          let newValues = [...values];
                          newValues.splice(index, 1);
                          updateValues(newValues);
                        }}
                      />
                    </EuiToolTip>
                  </EuiFlexItem>
                ) : null}
              </EuiFlexGroup>
            );
          })}
          <EuiSpacer size="m" />
          <EuiSmallButton
            type="button"
            className="secondary"
            onClick={() => {
              setValues([...values, '']);
            }}
          >
            {addButtonName}
          </EuiSmallButton>
        </>
      </EuiFormRow>
      <EuiSpacer />
    </>
  );
};
