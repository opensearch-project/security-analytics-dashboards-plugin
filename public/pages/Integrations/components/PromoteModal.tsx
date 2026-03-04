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
  EuiAccordion,
} from '@elastic/eui';
import React, { useState, useMemo } from 'react';
import { GetPromoteBySpaceResponse, PromoteChangeGroup, PromoteSpaces } from '../../../../types';
import { getNextSpace } from '../../../../common/helpers';
import { PromoteChangeDiff } from './PromoteChangeDiff';
import { PROMOTE_ENTITIES_LABELS, PROMOTE_ENTITIES_ORDER } from '../../../utils/constants';

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
      <div style={{ marginLeft: '2rem' }}>
        {memoizedData.map(({ id, name, operation }, i) => (
          <PromoteChangeDiff key={`${id}-${i}`} name={name || id} operation={operation} />
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

          {PROMOTE_ENTITIES_ORDER.map((entity) => {
            const label = PROMOTE_ENTITIES_LABELS[entity];
            if (promote?.promote.changes[entity].length > 0) {
              return (
                <React.Fragment key={entity}>
                  <PromoteEntity label={label} entity={entity} data={promote} />
                  <EuiSpacer size="m" />
                </React.Fragment>
              );
            }
            return null;
          })}

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
