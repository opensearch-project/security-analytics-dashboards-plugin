/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiConfirmModal } from '@elastic/eui';
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
      title={`Delete ${title}?`}
      onCancel={onCancel}
      onConfirm={onConfirm}
      cancelButtonText="Cancel"
      confirmButtonText="Delete"
      buttonColor="danger"
      defaultFocusedButton="confirm"
    >
      <p>Delete the correlation rule permanently? This action cannot be undone.</p>
    </EuiConfirmModal>
  );
};
