/*
 * Copyright Wazuh Inc.
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {
  EuiButtonEmpty,
  EuiButtonIcon,
  EuiCompressedFieldText,
  EuiCompressedTextArea,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow,
  EuiSpacer,
  EuiText,
  EuiToolTip,
} from '@elastic/eui';
import { FieldArray, FormikErrors, FormikTouched, useFormikContext } from 'formik';
import { KVDBFormModel } from '../utils/mappers';

export interface ContentEntry {
  key: string;
  value: string;
}

export const KVDBContentEditor: React.FC = () => {
  const { values, errors, touched, setFieldValue, setFieldTouched, submitCount } = useFormikContext<
    KVDBFormModel
  >();

  const contentErrors = errors.contentEntries as FormikErrors<ContentEntry>[] | undefined;
  const contentTouched = touched.contentEntries as FormikTouched<ContentEntry>[] | undefined;

  return (
    <FieldArray name="contentEntries">
      {({ push, remove }) => (
        <div>
          {values.contentEntries.length === 0 && (
            <EuiText size="s" color="subdued">
              <p>No content entries yet.</p>
            </EuiText>
          )}
          {values.contentEntries.map((entry, index) => {
            const entryErrors = contentErrors?.[index];
            const entryTouched = contentTouched?.[index];
            const afterSubmit = submitCount > 0;

            const showKeyError = (entryTouched?.key || afterSubmit) && !!entryErrors?.key;
            const showValueError = (entryTouched?.value || afterSubmit) && !!entryErrors?.value;

            const textareaRows = Math.min(Math.max(entry.value.split('\n').length, 1), 8);

            return (
              <div key={index}>
                {index > 0 && <EuiSpacer size="s" />}
                <EuiFlexGroup alignItems="flexStart" gutterSize="s" responsive={false}>
                  <EuiFlexItem grow={3}>
                    <EuiFormRow
                      isInvalid={showKeyError}
                      error={showKeyError ? entryErrors?.key : undefined}
                      fullWidth
                    >
                      <EuiCompressedFieldText
                        style={{ height: '37px', padding: '6px 8px' }}
                        placeholder="Key"
                        value={entry.key}
                        onChange={(e) =>
                          setFieldValue(`contentEntries[${index}].key`, e.target.value)
                        }
                        onBlur={() => setFieldTouched(`contentEntries[${index}].key`, true)}
                        isInvalid={showKeyError}
                        fullWidth
                      />
                    </EuiFormRow>
                  </EuiFlexItem>
                  <EuiFlexItem grow={6}>
                    <EuiFormRow
                      isInvalid={showValueError}
                      error={showValueError ? entryErrors?.value : undefined}
                      fullWidth
                    >
                      <EuiFlexGroup gutterSize="xs" alignItems="flexStart" responsive={false}>
                        <EuiFlexItem>
                          <EuiCompressedTextArea
                            placeholder='Value (text or JSON, e.g. {"action": "executed"})'
                            value={entry.value}
                            onChange={(e) =>
                              setFieldValue(`contentEntries[${index}].value`, e.target.value)
                            }
                            onBlur={() => setFieldTouched(`contentEntries[${index}].value`, true)}
                            isInvalid={showValueError}
                            rows={textareaRows}
                            fullWidth
                          />
                        </EuiFlexItem>
                      </EuiFlexGroup>
                    </EuiFormRow>
                  </EuiFlexItem>
                  <EuiFlexItem grow={false}>
                    <EuiFormRow>
                      <EuiToolTip content="Remove entry">
                        <EuiButtonIcon
                          iconType="trash"
                          color="danger"
                          aria-label="Remove entry"
                          onClick={() => remove(index)}
                        />
                      </EuiToolTip>
                    </EuiFormRow>
                  </EuiFlexItem>
                </EuiFlexGroup>
              </div>
            );
          })}
          <EuiSpacer size="s" />
          <EuiButtonEmpty
            size="s"
            iconType="plusInCircle"
            onClick={() => push({ key: '', value: '' })}
          >
            Add
          </EuiButtonEmpty>
        </div>
      )}
    </FieldArray>
  );
};
