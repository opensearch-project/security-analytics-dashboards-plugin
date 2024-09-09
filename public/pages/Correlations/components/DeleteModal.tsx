/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiConfirmModal, EuiText } from '@elastic/eui';
import React from 'react';

export interface DeleteRuleModalProps {
  title: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export const DeleteCorrelationRuleModal: React.FC<DeleteRuleModalProps> = ({
  title,
  onCancel,
  onConfirm,
}) => {
  return (
    <EuiConfirmModal
      title={<EuiText size="s"><h2>Delete {title}?</h2></EuiText>}
      onCancel={onCancel}
      onConfirm={onConfirm}
      cancelButtonText="Cancel"
      confirmButtonText="Delete"
      buttonColor="danger"
      defaultFocusedButton="confirm"
    >
      <EuiText size="s">Delete the correlation rule permanently? This action cannot be undone.</EuiText>
    </EuiConfirmModal>
  );
};
