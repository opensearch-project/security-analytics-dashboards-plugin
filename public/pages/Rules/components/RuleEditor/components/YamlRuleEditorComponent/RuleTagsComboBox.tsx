/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { EuiFormRow, EuiText, EuiComboBox, EuiComboBoxOptionOption, EuiSpacer } from '@elastic/eui';

export interface RuleTagsComboBoxProps {
  onCreateOption: (
    searchValue: string,
    options: EuiComboBoxOptionOption<string>[]
  ) => boolean | void;
  onBlur: any;
  onChange: ((options: EuiComboBoxOptionOption<string>[]) => void) | undefined;
  selectedOptions: EuiComboBoxOptionOption<string>[];
}

export const RuleTagsComboBox: React.FC<RuleTagsComboBoxProps> = ({
  onCreateOption,
  onBlur,
  onChange,
  selectedOptions,
}) => {
  return (
    <>
      <EuiFormRow
        label={
          <EuiText size={'s'}>
            <strong>Tags </strong>
            <i>- optional</i>
          </EuiText>
        }
      >
        <EuiComboBox
          noSuggestions
          placeholder="Create tags"
          onChange={onChange}
          onCreateOption={(searchValue, options) => onCreateOption(searchValue, options)}
          onBlur={onBlur}
          data-test-subj={'rule_tags_dropdown'}
          selectedOptions={selectedOptions}
        />
      </EuiFormRow>
    </>
  );
};
