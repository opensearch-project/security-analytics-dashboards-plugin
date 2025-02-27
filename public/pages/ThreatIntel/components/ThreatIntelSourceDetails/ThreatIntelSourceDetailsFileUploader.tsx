/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiCompressedFieldText, EuiCompressedFormRow } from '@elastic/eui';
import React from 'react';
import {
  ThreatIntelSourceFileUploader,
  ThreatIntelSourceFileUploaderProps,
} from '../ThreatIntelSourceFileUploader/ThreatIntelSourceFileUploader';

export interface ThreatIntelSourceDetailsFileUploaderProps {
  isReadOnly: boolean;
  fileName?: string;
  fileError: string;
  helperText: React.ReactNode;
  onFileUploadChange: ThreatIntelSourceFileUploaderProps['onFileUploadChange'];
}

export const ThreatIntelSourceDetailsFileUploader: React.FC<ThreatIntelSourceDetailsFileUploaderProps> = ({
  isReadOnly,
  fileName,
  fileError,
  helperText,
  onFileUploadChange,
}) => {
  return (
    <>
      {isReadOnly && (
        <EuiCompressedFormRow label="Uploaded file">
          <EuiCompressedFieldText readOnly={isReadOnly} value={fileName} icon={'download'} />
        </EuiCompressedFormRow>
      )}
      {!isReadOnly && (
        <ThreatIntelSourceFileUploader
          onFileUploadChange={onFileUploadChange}
          formLabel="Upload file"
          formHelperText={helperText}
          uploaderError={fileError}
        />
      )}
    </>
  );
};
