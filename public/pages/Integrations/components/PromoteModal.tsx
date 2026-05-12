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
import { PROMOTE_ENTITIES_LABELS, PROMOTE_ENTITIES_ORDER, ROUTES } from '../../../utils/constants';
import { DataStore } from '../../../store/DataStore';
import { successNotificationToast } from '../../../utils/helpers';
import { isRootDecoderRequiementError, RootDecoderRequirement } from './RootDecoderRequirement';
import { NotificationsStart } from 'opensearch-dashboards/public';
import { RouteComponentProps } from 'react-router-dom';

export interface PromoteBySpaceModalProps {
  promote: GetPromoteBySpaceResponse['response'];
  closeModal: () => void;
  space: PromoteSpaces;
  notifications: NotificationsStart
  history: RouteComponentProps['history']
}

const PromoteEntity: React.FC<{
  label: string;
  entity: PromoteChangeGroup;
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

const expectedConfirmActionText = 'promote';
export const PromoteBySpaceModal: React.FC<PromoteBySpaceModalProps> = ({
  closeModal,
  promote,
  space,
  notifications,
  history
}) => {
  const [confirmActionText, setconfirmActionText] = useState('');
  const [requireRootDecoderError, setRequireRootDecoderError] = useState(false);

  const onConfirmPromote = async () => {
    // TODO: generate promote payload based on the selected entities to promote. For now, we are promoting all the entities.
    const [success, error] = await DataStore.integrations.promoteIntegration({
      space,
      changes: promote.promote.changes,
    });
    if (success) {
      successNotificationToast(notifications, 'promoted', `[${space}] space`);
      history.push(ROUTES.INTEGRATIONS);
    }else if(isRootDecoderRequiementError(error)){
      setRequireRootDecoderError(true)
    }
    return success;
  };

  const onConfirmClick = async () => {
    // Generate promote payload
    (await onConfirmPromote()) && closeModal();
    
  };

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
        confirmButtonDisabled={confirmActionText !== expectedConfirmActionText && !requireRootDecoderError}
      >
        <EuiForm>
          <p>
            <EuiText size="s">
              The entities will be promoted to <b>{nextSpace}</b>. This action is irreversible.
            </EuiText>
          </p>

          {PROMOTE_ENTITIES_ORDER.map((entity) => {
            const label = PROMOTE_ENTITIES_LABELS[entity];
            if ((promote?.promote?.changes?.[entity]?.length ?? 0) > 0) {
              return (
                <React.Fragment key={entity}>
                  <PromoteEntity label={label} entity={entity} data={promote} />
                  <EuiSpacer size="m" />
                </React.Fragment>
              );
            }
            return null;
          })}

          {
            requireRootDecoderError && (
              <>
                <RootDecoderRequirement space={space} onSucess={() => setRequireRootDecoderError(false)}/>
                <EuiSpacer size="m" />
              </>
            )
          }

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
