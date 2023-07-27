/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiButton,
  EuiCallOut,
  EuiConfirmModal,
  EuiFieldText,
  EuiForm,
  EuiFormRow,
  EuiLoadingSpinner,
  EuiModal,
  EuiModalBody,
  EuiModalFooter,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiOverlayMask,
  EuiSpacer,
} from '@elastic/eui';
import React from 'react';
import { useState } from 'react';

export interface DeleteLogTypeModalProps {
  logTypeName: string;
  detectionRulesCount: number;
  loading?: boolean;
  closeModal: () => void;
  onConfirm: () => void;
}

export const DeleteLogTypeModal: React.FC<DeleteLogTypeModalProps> = ({
  detectionRulesCount,
  logTypeName,
  loading,
  closeModal,
  onConfirm,
}) => {
  const [confirmDeleteText, setConfirmDeleteText] = useState('');

  if (loading) {
    return (
      <EuiOverlayMask>
        <EuiModal onClose={closeModal}>
          <EuiLoadingSpinner size="l" />
        </EuiModal>
      </EuiOverlayMask>
    );
  }

  const onConfirmClick = () => {
    onConfirm();
    closeModal();
  };

  return (
    <EuiOverlayMask>
      {detectionRulesCount > 0 ? (
        <EuiModal onClose={closeModal}>
          <EuiModalHeader>
            <EuiModalHeaderTitle>
              <h1>This log type can't be deleted</h1>
            </EuiModalHeaderTitle>
          </EuiModalHeader>
          <EuiModalBody>
            <EuiCallOut
              size="s"
              title={`This log type is associated with ${detectionRulesCount} detection rules.`}
              iconType={'iInCircle'}
              color="warning"
            />
            <EuiSpacer />
            <p>
              Only log types that don’t have any associated rules can be deleted. Consider editing
              log type or deleting associated detection rules.
            </p>
          </EuiModalBody>
          <EuiModalFooter>
            <EuiButton onClick={closeModal} fill>
              Close
            </EuiButton>
          </EuiModalFooter>
        </EuiModal>
      ) : (
        <EuiConfirmModal
          title={`Delete log type?`}
          onCancel={closeModal}
          onConfirm={onConfirmClick}
          cancelButtonText={'Cancel'}
          confirmButtonText={`Delete log type`}
          buttonColor={'danger'}
          defaultFocusedButton="confirm"
          confirmButtonDisabled={confirmDeleteText != logTypeName}
        >
          <EuiForm>
            <p>The log type will be permanently deleted. This action is irreversible.</p>
            <EuiSpacer size="s" />
            <p style={{ marginBottom: '0.3rem' }}>
              Type <b>{logTypeName}</b> to confirm
            </p>
            <EuiFormRow>
              <EuiFieldText
                value={confirmDeleteText}
                onChange={(e) => setConfirmDeleteText(e.target.value)}
              />
            </EuiFormRow>
          </EuiForm>
        </EuiConfirmModal>
      )}
    </EuiOverlayMask>
  );
};
