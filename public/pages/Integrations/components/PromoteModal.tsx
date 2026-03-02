/*
 * Copyright Wazuh Inc.
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {
  EuiConfirmModal,
  EuiCompressedFieldText,
  EuiForm,
  EuiCompressedFormRow,
  EuiOverlayMask,
  EuiSpacer,
  EuiText,
  EuiTextColor,
  EuiAccordion,
} from '@elastic/eui';
import React, { useState, useMemo } from 'react';
import { GetPromoteBySpaceResponse, PromoteChangeGroup, PromoteSpaces } from '../../../../types';
import { getNextSpace } from '../utils/helpers';

export interface PromoteBySpaceModalProps {
  promote: GetPromoteBySpaceResponse['response'];
  closeModal: () => void;
  onConfirm: () => boolean;
  space: PromoteSpaces;
}

const PromoteEntity: React.FC<{
  label: string;
  entity: Exclude<PromoteChangeGroup, 'policy' | 'filters'>;
  data: GetPromoteBySpaceResponse['response'];
}> = ({ label, data, entity }) => {
  const memoizedData = useMemo(
    () =>
      data.promote.changes[entity].map(({ id, ...rest }) => ({
        ...rest,
        id,
        name: data.available_promotions[entity][id],
      })),
    [data.promote.changes[entity]]
  );

  return (
    <EuiAccordion
      id={`promote-${label}`}
      buttonContent={`${label} (${data.promote.changes[entity].length})`}
    >
      <div>
        {memoizedData.map(({ id, name, operation }, i) => (
          <EuiText size="s">
            {name || id} <EuiTextColor color="subdued">({operation})</EuiTextColor>
          </EuiText>
        ))}
      </div>
    </EuiAccordion>
  );
};

export const PromoteBySpaceModal: React.FC<PromoteBySpaceModalProps> = ({
  closeModal,
  onConfirm,
  promote,
  space,
}) => {
  const [confirmActionText, setconfirmActionText] = useState('');

  const onConfirmClick = async () => {
    // Generate promote payload
    (await onConfirm()) && closeModal();
  };

  const expectedConfirmActionText = 'promote';

  const nextSpace = getNextSpace(space);

  return (
    <EuiOverlayMask>
      <EuiConfirmModal
        title={
          <EuiText size="s">
            <h2>
              Promote to <b>{nextSpace}</b> space?
            </h2>
          </EuiText>
        }
        onCancel={closeModal}
        onConfirm={onConfirmClick}
        cancelButtonText={'Cancel'}
        confirmButtonText={`Promote`}
        buttonColor={'primary'}
        defaultFocusedButton="confirm"
        confirmButtonDisabled={confirmActionText !== expectedConfirmActionText}
      >
        <EuiForm>
          <p>
            <EuiText size="s">
              The entities will be promoted to <b>{nextSpace}</b>. This action is irreversible.
            </EuiText>
          </p>

          <PromoteEntity label="Integrations" entity="integrations" data={promote} />
          <EuiSpacer size="s" />
          <PromoteEntity label="Decoders" entity="decoders" data={promote} />
          <EuiSpacer size="s" />
          <PromoteEntity label="KVDBs" entity="kvdbs" data={promote} />
          <EuiSpacer size="m" />

          <p style={{ marginBottom: '0.3rem' }}>
            <EuiText size="s">Type {<b>{expectedConfirmActionText}</b>} to confirm</EuiText>
          </p>
          <EuiCompressedFormRow>
            <EuiCompressedFieldText
              value={confirmActionText}
              onChange={(e) => setconfirmActionText(e.target.value)}
            />
          </EuiCompressedFormRow>
        </EuiForm>
      </EuiConfirmModal>
    </EuiOverlayMask>
  );
};
