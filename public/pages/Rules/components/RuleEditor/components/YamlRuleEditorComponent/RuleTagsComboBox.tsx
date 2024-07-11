/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { EuiCompressedFormRow, EuiText, EuiComboBox, EuiComboBoxOptionOption, EuiSpacer } from '@elastic/eui';

export interface RuleTagsComboBoxProps {
  onCreateOption: (
    searchValue: string,
    options: EuiComboBoxOptionOption<string>[]
  ) => boolean | void;
  onBlur: any;
  onChange: ((options: EuiComboBoxOptionOption<string>[]) => void) | undefined;
  selectedOptions: EuiComboBoxOptionOption<string>[];
}

const STARTS_WITH = 'attack.';

const isValid = (value: string) => {
  if (value === '') return true;
  return value.startsWith(STARTS_WITH) && value.length > STARTS_WITH.length;
};

export const RuleTagsComboBox: React.FC<RuleTagsComboBoxProps> = ({
  onCreateOption,
  onBlur,
  onChange,
  selectedOptions,
}) => {
  const [isCurrentlyTypingValueInvalid, setIsCurrentlyTypingValueInvalid] = useState(false);

  const onSearchChange = (searchValue: string) => {
    setIsCurrentlyTypingValueInvalid(!isValid(searchValue));
  };

  return (
    <>
      <EuiCompressedFormRow
        label={
          <>
            <EuiText size={'m'}>
              <strong>Tags </strong>
              <i>- optional</i>
            </EuiText>

            <EuiSpacer size={'m'} />

            <EuiText size={'xs'}>
              <strong>Tag</strong>
            </EuiText>
          </>
        }
        isInvalid={isCurrentlyTypingValueInvalid}
        error={isCurrentlyTypingValueInvalid ? 'Invalid tag' : ''}
      >
        <EuiComboBox
          noSuggestions
          onSearchChange={onSearchChange}
          placeholder="tag"
          onChange={onChange}
          onCreateOption={(searchValue, options) =>
            isValid(searchValue) && onCreateOption(searchValue, options)
          }
          onBlur={onBlur}
          data-test-subj={'rule_tags_dropdown'}
          selectedOptions={selectedOptions}
          isInvalid={isCurrentlyTypingValueInvalid}
        />
      </EuiCompressedFormRow>
    </>
  );
};
