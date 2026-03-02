/*
 * Copyright Wazuh Inc.
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React, { useState, useMemo } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { BREADCRUMBS, ROUTES } from '../../../utils/constants';
import { DataStore } from '../../../store/DataStore';
import { setBreadcrumbs, successNotificationToast } from '../../../utils/helpers';
import { NotificationsStart } from 'opensearch-dashboards/public';
import {
  EuiButton,
  EuiFlexGroup,
  EuiFlexItem,
  EuiLoadingSpinner,
  EuiPanel,
  EuiSpacer,
  EuiText,
  EuiTextColor,
} from '@elastic/eui';
import { PageHeader } from '../../../components/PageHeader/PageHeader';
import { getNextSpace, withGuardAsync } from '../utils/helpers';
import { PromoteBySpaceModal } from '../components/PromoteModal';
import { GetPromoteBySpaceResponse, PromoteChangeGroup, PromoteSpaces } from '../../../../types';
import { SPACE_ACTIONS } from '../../../../common/constants';
import { compose } from 'redux';
import {
  withConditionalHOC,
  withRootDecoderRequirementGuard,
} from '../components/RootDecoderRequirement';
import { actionIsAllowedOnSpace } from '../../../../common/helpers';

export interface PromoteIntegrationProps extends RouteComponentProps {
  notifications: NotificationsStart;
}

const PromoteEntity: React.FC<{
  label: string;
  entity: Exclude<PromoteChangeGroup, 'policy' | 'filters'>;
  data: GetPromoteBySpaceResponse['response'];
}> = ({ label, entity, data }) => {
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
    <div>
      <EuiText size="s">
        <h3>{label}</h3>
      </EuiText>
      <EuiSpacer size="s"></EuiSpacer>
      <div>
        {memoizedData.map(({ id, name, operation }, i) => (
          <EuiText size="s">
            {name || id} <EuiTextColor color="subdued">({operation})</EuiTextColor>
          </EuiText>
        ))}
      </div>
    </div>
  );
};

const PromoteBySpace: React.FC<{ space: PromoteSpaces }> = compose(
  withConditionalHOC((props) => {
    return actionIsAllowedOnSpace(props.space, SPACE_ACTIONS.DEFINE_ROOT_DECODER);
  }, withRootDecoderRequirementGuard), // This guard is added to make sure that the user has a root decoder defined before promoting, as it is a requirement for the promotion. If the user doesn't have a root decoder defined, it will show a message to the user to define a root decoder before promoting.
  withGuardAsync(
    async ({ space }) => {
      try {
        // Get promotions by space
        const [ok, data] = await DataStore.integrations.getPromote({ space });

        if (!ok) {
          return {
            ok: false,
            data: { errorPromote: 'Error getting the promote data' },
          };
        }

        return {
          ok: true,
          data: { promoteData: data },
        };
      } catch (error) {
        return {
          ok: false,
          data: { errorPromote: error.message || 'Error getting the promote data' },
        };
      }
    },
    ({
      promoteData,
      space,
      notifications,
      history,
    }: {
      promoteData: GetPromoteBySpaceResponse['response'];
      space: PromoteSpaces;
      notifications: PromoteIntegrationProps['notifications'];
    }) => {
      const [modalIsOpen, setModalIsOpen] = useState(false);

      // TODO: add ability to select which entities to promote
      const hasPromotions =
        promoteData?.promote.changes.integrations.length > 0 ||
        promoteData?.promote.changes.decoders.length > 0 ||
        promoteData?.promote.changes.kvdbs.length > 0;

      const onConfirmPromote = async () => {
        // TODO: generate promote payload based on the selected entities to promote. For now, we are promoting all the entities.
        const success = await DataStore.integrations.promoteIntegration({
          space,
          changes: promoteData.promote.changes,
        });
        if (success) {
          successNotificationToast(notifications, 'promoted', `[${space}] space`);
          history.push(ROUTES.INTEGRATIONS);
        }
        return success;
      };

      if (!hasPromotions) {
        return <EuiText>There is nothing to promote.</EuiText>;
      }

      return (
        <>
          {modalIsOpen && (
            <PromoteBySpaceModal
              closeModal={() => setModalIsOpen(false)}
              promote={promoteData}
              onConfirm={onConfirmPromote}
              space={space}
            ></PromoteBySpaceModal>
          )}
          <div>
            {promoteData?.promote.changes.integrations.length > 0 && (
              <PromoteEntity label="Integrations" entity="integrations" data={promoteData} />
            )}
            {promoteData?.promote.changes.decoders.length > 0 && (
              <PromoteEntity label="Decoders" entity="decoders" data={promoteData} />
            )}
            {promoteData?.promote.changes.kvdbs.length > 0 && (
              <PromoteEntity label="KVDBs" entity="kvdbs" data={promoteData} />
            )}
          </div>
          <EuiSpacer size="m" />
          <EuiFlexGroup justifyContent="flexEnd">
            <EuiFlexItem grow={false}>
              <EuiButton disabled={!hasPromotions} onClick={() => setModalIsOpen(true)} fill={true}>
                Promote
              </EuiButton>
            </EuiFlexItem>
          </EuiFlexGroup>
        </>
      );
    },
    EuiLoadingSpinner
  )
)(({ errorPromote }) => {
  return <EuiText color="danger">{errorPromote}</EuiText>;
});

export const PromoteIntegration: React.FC<PromoteIntegrationProps> = ({
  history,
  notifications,
  location,
}) => {
  setBreadcrumbs([BREADCRUMBS.INTEGRATIONS, BREADCRUMBS.PROMOTE]);

  const description =
    'Promote the integrations, decoders and KVDBs to another space. Once promoted, they will be available in the next space.';

  const space = new URLSearchParams(location.search).get('space');

  return (
    <EuiPanel>
      <PageHeader appDescriptionControls={[{ description }]}>
        <EuiText size="s">
          {/* Log Type is replaced with Integration by Wazuh */}
          <h1>Promote</h1>
        </EuiText>
        <EuiText size="s" color="subdued">
          {description}
        </EuiText>
        <EuiSpacer />
      </PageHeader>
      {actionIsAllowedOnSpace(space, SPACE_ACTIONS.PROMOTE) ? (
        <>
          <EuiText size="s">
            You are promoting the entities from <b>{space}</b> to <b>{getNextSpace(space)}</b>{' '}
            space.
          </EuiText>
          <EuiSpacer />
          <PromoteBySpace
            space={space as PromoteSpaces}
            history={history}
            notifications={notifications}
          />
        </>
      ) : (
        <EuiText size="s" color="danger">
          Invalid space for promotion: {space}
        </EuiText>
      )}
    </EuiPanel>
  );
};
