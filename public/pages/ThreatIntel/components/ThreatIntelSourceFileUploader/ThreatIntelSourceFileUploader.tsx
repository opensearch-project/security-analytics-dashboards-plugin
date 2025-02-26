/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiFilePicker, EuiFilePickerProps, EuiFormRow, EuiSpacer, EuiText } from '@elastic/eui';
import React from 'react';

export interface ThreatIntelSourceFileUploaderProps {
  showHeader?: boolean;
  formLabel: string;
  formHelperText: React.ReactNode;
  uploaderError?: string;
  onFileUploadChange: EuiFilePickerProps['onChange'];
}

export const ThreatIntelSourceFileUploader: React.FC<ThreatIntelSourceFileUploaderProps> = ({
  showHeader = false,
  formLabel,
  formHelperText,
  uploaderError,
  onFileUploadChange,
}) => {
  return (
    <>
      {showHeader && (
        <>
          <EuiText>
            <h4>Upload a file</h4>
          </EuiText>
          <EuiSpacer />
        </>
      )}
      <EuiFormRow
        label={formLabel}
        helpText={formHelperText}
        isInvalid={!!uploaderError}
        error={uploaderError}
      >
        <EuiFilePicker
          id={'filePickerId'}
          fullWidth
          initialPromptText="Select or drag and drop a file"
          onChange={onFileUploadChange}
          display={'large'}
          multiple={false}
          aria-label="ioc file picker"
          isInvalid={!!uploaderError}
          data-test-subj="import_ioc_file"
        />
      </EuiFormRow>
      <EuiSpacer />
    </>
  );
};
