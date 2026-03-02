/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiSmallButton,
  EuiCallOut,
  EuiConfirmModal,
  EuiCompressedFieldText,
  EuiForm,
  EuiCompressedFormRow,
  EuiLoadingSpinner,
  EuiModal,
  EuiModalBody,
  EuiModalFooter,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiOverlayMask,
  EuiSpacer,
  EuiText,
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
              <EuiText size="s">
                {/* log type replaced by integration */}
                <h2>This integration can't be deleted</h2>
              </EuiText>
            </EuiModalHeaderTitle>
          </EuiModalHeader>
          <EuiModalBody>
            <EuiCallOut
              size="s"
              title={`This integration is associated with ${detectionRulesCount} detection ${
                detectionRulesCount > 1 ? 'rules' : 'rule'
              }.`}
              iconType={'iInCircle'}
              color="warning"
            />
            <EuiSpacer />
            <EuiText size="s">
              <p>
                Only integrations that don’t have any associated rules can be deleted. Consider editing
                integration or deleting associated detection rules.
              </p>
            </EuiText>
          </EuiModalBody>
          <EuiModalFooter>
            <EuiSmallButton onClick={closeModal} fill>
              Close
            </EuiSmallButton>
          </EuiModalFooter>
        </EuiModal>
      ) : (
        <EuiConfirmModal
          title={<EuiText size="s"><h2>Delete integration?</h2></EuiText>}
          onCancel={closeModal}
          onConfirm={onConfirmClick}
          cancelButtonText={'Cancel'}
          confirmButtonText={`Delete integration`}
          buttonColor={'danger'}
          defaultFocusedButton="confirm"
          confirmButtonDisabled={confirmDeleteText != logTypeName}
        >
          <EuiForm>
            <p>
              <EuiText size="s">
                The integration will be permanently deleted. This action is irreversible.
              </EuiText>
            </p>
            <EuiSpacer size="s"/>
              <p style={{marginBottom: '0.3rem'}}>
                <EuiText size="s">
                  Type {<b>{logTypeName}</b>} to confirm
                </EuiText>
              </p>

            <EuiCompressedFormRow>
              <EuiCompressedFieldText
                value={confirmDeleteText}
                onChange={(e) => setConfirmDeleteText(e.target.value)}
              />
            </EuiCompressedFormRow>
          </EuiForm>
        </EuiConfirmModal>
      )}
    </EuiOverlayMask>
  );
};
