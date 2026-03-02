/*
 * Copyright Wazuh Inc.
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { EuiCallOut, EuiCompressedComboBox, EuiCompressedFormRow, EuiSpacer } from '@elastic/eui';
import React from 'react';
import FormFieldHeader from '../FormFieldHeader';
import { getLogTypeLabel } from '../../pages/LogTypes/utils/helpers';
import { IntegrationOption } from './useIntegrationSelector';

interface IntegrationComboBoxProps {
  options: IntegrationOption[];
  selectedId: string;
  isLoading: boolean;
  onChange: (options: IntegrationOption[]) => void;
  resourceName: string;
  'data-test-subj'?: string;
}

export const IntegrationComboBox: React.FC<IntegrationComboBoxProps> = ({
  options,
  selectedId,
  isLoading,
  onChange,
  resourceName,
  'data-test-subj': dataTestSubj,
}) => {
  const selectedOption = options.find((o) => o.id === selectedId);

  return (
    <>
      <EuiCompressedFormRow
        label={
          <div>
            <FormFieldHeader headerTitle={'Integration'} />
            <EuiSpacer size={'s'} />
          </div>
        }
        fullWidth={true}
      >
        <EuiCompressedComboBox
          placeholder="Select integration"
          data-test-subj={dataTestSubj}
          options={options}
          singleSelection={{ asPlainText: true }}
          onChange={onChange}
          isLoading={isLoading}
          isDisabled={isLoading || options.length === 0}
          selectedOptions={
            selectedOption
              ? [
                  {
                    value: selectedOption.value,
                    label: getLogTypeLabel(selectedOption.value),
                  },
                ]
              : []
          }
        />
      </EuiCompressedFormRow>
      {!isLoading && options.length === 0 && (
        <>
          <EuiSpacer size="m" />
          <EuiCallOut title="No integrations available" color="warning" iconType="alert">
            <p>
              There are no integrations in draft status available to add {resourceName}. Please
              create or draft an integration first before adding {resourceName}.
            </p>
          </EuiCallOut>
        </>
      )}
    </>
  );
};
