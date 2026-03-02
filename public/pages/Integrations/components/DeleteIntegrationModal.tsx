/*
 * Copyright Wazuh Inc.
 * SPDX-License-Identifier: AGPL-3.0-or-later
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
import { withGuardAsync } from '../utils/helpers';
import { DataStore } from '../../../store/DataStore';

export interface DeleteIntegrationModalProps {
  integrationName: string;
  integrationId: string;
  detectionRulesCount?: number;
  decodersCount?: number;
  kvdbsCount?: number;
  loading?: boolean;
  closeModal: () => void;
  onConfirm: () => void;
}

const DELETE_INTEGRATION_ASSOCIATED_ENTITIES_MESSAGE =
  "Only integrations that don't have associated rules, decoders, or KVDBs can be deleted. Consider editing integration or deleting the associated entities.";

const LoadingModal = ({ closeModal }) => (
  <EuiOverlayMask>
    <EuiModal onClose={closeModal}>
      <EuiLoadingSpinner size="l" />
    </EuiModal>
  </EuiOverlayMask>
);

export const DeleteIntegrationModal: React.FC<DeleteIntegrationModalProps> = ({
  detectionRulesCount = 0,
  decodersCount = 0,
  kvdbsCount = 0,
  integrationName,
  closeModal,
  onConfirm,
}) => {
  const [confirmDeleteText, setConfirmDeleteText] = useState('');
  const hasRelatedEntities = detectionRulesCount > 0 || decodersCount > 0 || kvdbsCount > 0;
  const relatedEntitiesMessage = DataStore.integrations.getRelatedEntitiesMessage({
    hasRules: detectionRulesCount > 0,
    hasDecoders: decodersCount > 0,
    hasKVDBs: kvdbsCount > 0,
  });

  const onConfirmClick = async () => {
    await onConfirm();
    closeModal();
  };

  return (
    <EuiOverlayMask>
      {hasRelatedEntities ? (
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
              title={`This integration is associated with ${relatedEntitiesMessage}.`}
              iconType={'iInCircle'}
              color="warning"
            />
            <EuiSpacer />
            <EuiText size="s">
              <p>{DELETE_INTEGRATION_ASSOCIATED_ENTITIES_MESSAGE}</p>
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
          title={
            <EuiText size="s">
              <h2>Delete integration?</h2>
            </EuiText>
          }
          onCancel={closeModal}
          onConfirm={onConfirmClick}
          cancelButtonText={'Cancel'}
          confirmButtonText={`Delete integration`}
          buttonColor={'danger'}
          defaultFocusedButton="confirm"
          confirmButtonDisabled={confirmDeleteText != integrationName}
        >
          <EuiForm>
            <p>
              <EuiText size="s">
                The integration will be permanently deleted. This action is irreversible.
              </EuiText>
            </p>
            <EuiSpacer size="s" />
            <p style={{ marginBottom: '0.3rem' }}>
              <EuiText size="s">Type {<b>{integrationName}</b>} to confirm</EuiText>
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
