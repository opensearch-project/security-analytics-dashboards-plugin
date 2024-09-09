/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { ChangeEvent, Component } from 'react';
import {
  EuiConfirmModal,
  EuiCompressedFieldText,
  EuiForm,
  EuiCompressedFormRow,
  EuiOverlayMask,
  EuiSpacer,
  EuiText,
} from '@elastic/eui';

interface DeleteModalProps {
  additionalWarning?: string;
  closeDeleteModal: (event?: any) => void;
  confirmation?: boolean;
  ids: string;
  onClickDelete: (event?: any) => void;
  type: string;
  confirmButtonText?: string;
}

interface DeleteModalState {
  confirmDeleteText: string;
}

export const DEFAULT_DELETION_TEXT = 'delete';

export default class DeleteModal extends Component<DeleteModalProps, DeleteModalState> {
  constructor(props: DeleteModalProps) {
    super(props);
    const { confirmation } = props;
    this.state = {
      confirmDeleteText: confirmation ? '' : DEFAULT_DELETION_TEXT,
    };
  }

  onChange = (e: ChangeEvent<HTMLInputElement>): void => {
    this.setState({ confirmDeleteText: e.target.value });
  };

  render() {
    const {
      type,
      ids,
      closeDeleteModal,
      onClickDelete,
      additionalWarning,
      confirmation,
      confirmButtonText,
    } = this.props;
    const { confirmDeleteText } = this.state;

    return (
      <EuiOverlayMask>
        <EuiConfirmModal
          title={<EuiText size="s"><h2>`Delete ${type}`</h2></EuiText>}
          onCancel={closeDeleteModal}
          onConfirm={() => {
            onClickDelete();
            closeDeleteModal();
          }}
          cancelButtonText={'Cancel'}
          confirmButtonText={confirmButtonText ?? `Delete ${type}`}
          buttonColor={'danger'}
          defaultFocusedButton="confirm"
          confirmButtonDisabled={confirmDeleteText != DEFAULT_DELETION_TEXT}
        >
          <EuiForm>
            <p>
              Delete "<strong>{ids}</strong>" permanently? {additionalWarning}
            </p>
            <EuiSpacer size="s" />
            {!!confirmation && (
              <EuiCompressedFormRow helpText={`To confirm deletion, type "${DEFAULT_DELETION_TEXT}".`}>
                <EuiCompressedFieldText
                  value={confirmDeleteText}
                  placeholder={DEFAULT_DELETION_TEXT}
                  onChange={this.onChange}
                  data-test-subj={'deleteTextField'}
                />
              </EuiCompressedFormRow>
            )}
          </EuiForm>
        </EuiConfirmModal>
      </EuiOverlayMask>
    );
  }
}
