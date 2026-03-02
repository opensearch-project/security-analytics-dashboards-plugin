/*
 * Copyright Wazuh Inc.
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React, { useEffect, useState, useRef } from 'react';
import {
  EuiSmallButton,
  EuiFlexGroup,
  EuiFlexItem,
  EuiInMemoryTable,
  EuiPanel,
  EuiSpacer,
  EuiText,
  EuiContextMenuItem,
  EuiContextMenuPanel,
  EuiPopover,
  EuiConfirmModal,
} from '@elastic/eui';
import { BREADCRUMBS, ROUTES } from '../../../utils/constants';
import { DataSourceProps, IntegrationBase } from '../../../../types';
import { DataStore } from '../../../store/DataStore';
import {
  getIntegrationsTableColumns,
  getIntegrationsTableSearchConfig,
  IntegrationTableItem,
  mapPolicyToIntegrationTableItems,
  hasRelatedEntity,
} from '../utils/helpers';
import { RouteComponentProps } from 'react-router-dom';
import { useCallback } from 'react';
import { NotificationsStart } from 'opensearch-dashboards/public';
import { setBreadcrumbs, successNotificationToast } from '../../../utils/helpers';
import { DeleteIntegrationModal } from '../components/DeleteIntegrationModal';
import { PageHeader } from '../../../components/PageHeader/PageHeader';
import { SPACE_ACTIONS } from '../../../../common/constants';
import { PolicyInfoCard } from '../components/PolicyInfo';
import { actionIsAllowedOnSpace, getSpacesAllowAction } from '../../../../common/helpers';
import { RearrangeIntegrations } from '../components/RearrangeIntegrations';
import { useSpaceSelector } from '../../../hooks/useSpaceSelector';

export interface IntegrationsProps extends RouteComponentProps, DataSourceProps {
  notifications: NotificationsStart;
}

const DELETE_SELECTED_ACTION = 'delete_selected' as const;

type ItemForAction =
  | {
      item: IntegrationTableItem;
      action: typeof SPACE_ACTIONS.DELETE;
    }
  | {
      action: typeof SPACE_ACTIONS.REARRANGE_INTEGRATIONS;
    }
  | {
      action: typeof DELETE_SELECTED_ACTION;
    };

export const Integrations: React.FC<IntegrationsProps> = ({
  history,
  notifications,
  dataSource,
}) => {
  const isMountedRef = useRef(true);
  const [integrations, setIntegrations] = useState<IntegrationTableItem[]>([]);
  const { component: spaceSelector, spaceFilter } = useSpaceSelector();
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedItems, setSelectedItems] = useState<IntegrationTableItem[]>([]);
  const [itemForAction, setItemForAction] = useState<ItemForAction | null>(null);
  const [isPopoverOpen, setIsPopoverOpen] = useState<boolean>(false);
  const loadIntegrations = useCallback(async () => {
    setLoading(true);

    const policiesResult = await DataStore.policies.searchPolicies(spaceFilter, {
      includeIntegrationFields: ['document', 'space'],
    });
    const policy = policiesResult.items[0];
    const integrations = mapPolicyToIntegrationTableItems(policy);

    if (!isMountedRef.current) {
      return;
    }
    setIntegrations(integrations);
    setLoading(false);
  }, [spaceFilter, dataSource]);

  const deleteIntegration = async (id: string) => {
    const { ok } = await DataStore.integrations.deleteIntegration(id);

    if (ok) {
      successNotificationToast(notifications, 'deleted', 'integration');
      await loadIntegrations();
    }
  };

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    setBreadcrumbs([BREADCRUMBS.INTEGRATIONS]);
  }, []);

  const isCreateActionDisabled = !actionIsAllowedOnSpace(spaceFilter, SPACE_ACTIONS.CREATE);
  const isPromoteActionDisabled = !actionIsAllowedOnSpace(spaceFilter, SPACE_ACTIONS.PROMOTE);
  const isDeleteActionDisabledBySpace = !actionIsAllowedOnSpace(spaceFilter, SPACE_ACTIONS.DELETE);

  const selectedItemsWithoutRelatedEntities = selectedItems.filter(
    (item) => !item.rules?.length && !item.decoders?.length && !item.kvdbs?.length
  );
  const selectedItemsWithRelatedEntities = selectedItems.filter(
    (item) => item.rules?.length || item.decoders?.length || item.kvdbs?.length
  );
  const selectedItemsWithRelatedEntitiesCount = selectedItemsWithRelatedEntities.length;
  const selectedItemsRelatedEntitiesMessage = DataStore.integrations.getRelatedEntitiesMessage({
    hasRules: selectedItemsWithRelatedEntities.some((item) => hasRelatedEntity(item, 'rules')),
    hasDecoders: selectedItemsWithRelatedEntities.some((item) =>
      hasRelatedEntity(item, 'decoders')
    ),
    hasKVDBs: selectedItemsWithRelatedEntities.some((item) => hasRelatedEntity(item, 'kvdbs')),
  });

  const isDeleteSelectedActionDisabled =
    isDeleteActionDisabledBySpace ||
    selectedItems.length === 0 ||
    selectedItemsWithoutRelatedEntities.length === 0;
  const isRearrangeIntegrationsActionDisabled = !actionIsAllowedOnSpace(
    spaceFilter,
    SPACE_ACTIONS.REARRANGE_INTEGRATIONS
  );

  const deleteSelectedIntegrations = useCallback(async () => {
    setLoading(true);

    try {
      const deleteResults = await Promise.all(
        selectedItemsWithoutRelatedEntities.map(async (item) => {
          const { ok } = await DataStore.integrations.deleteIntegration(item?.id);
          return ok;
        })
      );
      const deletedCount = deleteResults.filter(Boolean).length;
      const failedCount = deleteResults.length - deletedCount;

      if (deletedCount > 0) {
        successNotificationToast(
          notifications,
          'deleted',
          deletedCount === 1 ? 'integration' : 'integrations'
        );
      }

      if (failedCount > 0) {
        notifications.toasts.addWarning({
          title: 'Some integrations could not be deleted',
          text: `${failedCount} integration${failedCount !== 1 ? 's' : ''} could not be deleted.`,
          toastLifeTimeMs: 5000,
        });
      }

      if (selectedItemsWithRelatedEntitiesCount > 0) {
        notifications.toasts.addWarning({
          title: 'Some integrations were skipped',
          text: `${selectedItemsWithRelatedEntitiesCount} integration${
            selectedItemsWithRelatedEntitiesCount !== 1 ? 's were' : ' was'
          } not deleted because ${
            selectedItemsWithRelatedEntitiesCount !== 1 ? 'they have' : 'it has'
          } associated ${selectedItemsRelatedEntitiesMessage}.`,
          toastLifeTimeMs: 5000,
        });
      }

      await loadIntegrations();
      if (isMountedRef.current) {
        setSelectedItems([]);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
        setItemForAction(null);
      }
    }
  }, [
    selectedItemsWithoutRelatedEntities,
    selectedItemsRelatedEntitiesMessage,
    selectedItemsWithRelatedEntitiesCount,
    loadIntegrations,
    notifications,
  ]);

  const panels = [
    <EuiContextMenuItem
      key="create"
      icon="plusInCircle"
      href={`#${ROUTES.INTEGRATIONS_CREATE}`}
      disabled={isCreateActionDisabled}
      toolTipContent={
        isCreateActionDisabled
          ? `Integration can only be created in the spaces: ${getSpacesAllowAction(
              SPACE_ACTIONS.CREATE
            ).join(', ')}`
          : undefined
      }
    >
      Create
    </EuiContextMenuItem>,
    <EuiContextMenuItem
      key="promote"
      icon="share"
      onClick={() => {
        history.push({
          pathname: `${ROUTES.PROMOTE}`,
          search: `?space=${spaceFilter}`,
        });
      }}
      disabled={isPromoteActionDisabled}
      toolTipContent={
        isPromoteActionDisabled
          ? `Integration can only be promoted in the spaces: ${getSpacesAllowAction(
              SPACE_ACTIONS.PROMOTE
            ).join(', ')}`
          : undefined
      }
    >
      Promote
    </EuiContextMenuItem>,
    <EuiContextMenuItem
      key="delete"
      icon="trash"
      onClick={() => {
        setItemForAction({ action: DELETE_SELECTED_ACTION });
        setIsPopoverOpen(false);
      }}
      disabled={isDeleteSelectedActionDisabled}
      toolTipContent={
        isDeleteActionDisabledBySpace
          ? `Integrations can only be deleted in the space: ${getSpacesAllowAction(
              SPACE_ACTIONS.DELETE
            ).join(', ')}`
          : selectedItems.length === 0
          ? 'Select integrations to delete.'
          : selectedItemsWithoutRelatedEntities.length === 0
          ? 'Integrations with associated Rules, Decoders, or KVDBs cannot be deleted.'
          : selectedItemsWithRelatedEntitiesCount > 0
          ? `${selectedItemsWithRelatedEntitiesCount} selected integration${
              selectedItemsWithRelatedEntitiesCount !== 1 ? 's have' : ' has'
            } associated ${selectedItemsRelatedEntitiesMessage} and will be skipped.`
          : undefined
      }
    >
      Delete selected ({selectedItems.length})
    </EuiContextMenuItem>,
    <EuiContextMenuItem
      key="rearrange_integrations"
      icon="sortable"
      onClick={() => {
        setItemForAction({
          action: SPACE_ACTIONS.REARRANGE_INTEGRATIONS,
        });
        setIsPopoverOpen(false);
      }}
      disabled={isRearrangeIntegrationsActionDisabled}
      toolTipContent={
        isRearrangeIntegrationsActionDisabled
          ? `Integration can only be rearranged in the spaces: ${getSpacesAllowAction(
              SPACE_ACTIONS.REARRANGE_INTEGRATIONS
            ).join(', ')}`
          : undefined
      }
    >
      Rearrange
    </EuiContextMenuItem>,
  ];

  const handlerShowActionsButton = () => setIsPopoverOpen((prevState) => !prevState);

  const actionsButton = (
    <EuiPopover
      id={'integrationsActionsPopover'}
      button={
        <EuiSmallButton
          iconType={'arrowDown'}
          iconSide={'right'}
          onClick={handlerShowActionsButton}
          data-test-subj={'integrationsActionsButton'}
        >
          Actions
        </EuiSmallButton>
      }
      isOpen={isPopoverOpen}
      closePopover={handlerShowActionsButton}
      panelPaddingSize={'none'}
      anchorPosition={'downLeft'}
      data-test-subj={'integrationsActionsPopover'}
    >
      <EuiContextMenuPanel items={panels} size="s" />
    </EuiPopover>
  );

  useEffect(() => {
    loadIntegrations();
  }, [dataSource, spaceFilter, loadIntegrations]);

  const onSelectionChange = (selectedItems: IntegrationTableItem[]) => {
    setSelectedItems(selectedItems);
  };

  const showIntegrationDetails = useCallback(
    (id: string) => {
      history.push(`${ROUTES.INTEGRATIONS}/${id}?space=${spaceFilter}`);
    },
    [spaceFilter]
  );

  const createIntegrationAction = (
    <EuiSmallButton fill={true} onClick={() => history.push(ROUTES.INTEGRATIONS_CREATE)}>
      Create integration
    </EuiSmallButton>
  );

  return (
    <>
      {itemForAction && (
        <>
          {itemForAction.action === SPACE_ACTIONS.DELETE && (
            <DeleteIntegrationModal
              integrationName={itemForAction.item.title}
              detectionRulesCount={itemForAction.item.rules?.length ?? 0}
              decodersCount={itemForAction.item.decoders?.length ?? 0}
              kvdbsCount={itemForAction.item.kvdbs?.length ?? 0}
              closeModal={() => setItemForAction(null)}
              onConfirm={() => deleteIntegration(itemForAction.item.id)}
            />
          )}
          {itemForAction.action === SPACE_ACTIONS.REARRANGE_INTEGRATIONS && (
            <RearrangeIntegrations
              space={spaceFilter}
              onClose={() => {
                setItemForAction(null);
                loadIntegrations();
              }}
              notifications={notifications}
            />
          )}
        </>
      )}
      {itemForAction?.action === DELETE_SELECTED_ACTION && (
        <EuiConfirmModal
          title={`Delete ${selectedItemsWithoutRelatedEntities.length} integration${
            selectedItemsWithoutRelatedEntities.length !== 1 ? 's' : ''
          }`}
          onCancel={() => setItemForAction(null)}
          onConfirm={deleteSelectedIntegrations}
          cancelButtonText="Cancel"
          confirmButtonText="Delete"
          buttonColor="danger"
          defaultFocusedButton="cancel"
        >
          <p>
            {`Are you sure you want to delete ${
              selectedItemsWithoutRelatedEntities.length
            } integration${
              selectedItemsWithoutRelatedEntities.length !== 1 ? 's' : ''
            }? This action cannot be undone.`}
          </p>
          {selectedItemsWithRelatedEntitiesCount > 0 && (
            <p>
              {`${selectedItemsWithRelatedEntitiesCount} selected integration${
                selectedItemsWithRelatedEntitiesCount !== 1 ? 's have' : ' has'
              } associated ${selectedItemsRelatedEntitiesMessage} and will be skipped.`}
            </p>
          )}
        </EuiConfirmModal>
      )}

      <PageHeader appRightControls={[{ renderComponent: createIntegrationAction }]}>
        <EuiFlexItem>
          <EuiFlexGroup alignItems="center" justifyContent={'spaceBetween'}>
            <EuiFlexItem>
              <EuiText size="s">
                <h1>Integrations</h1>
              </EuiText>
              <EuiText size="s" color="subdued">
                Integrations describe the data sources to which the detection rules are meant to be
                applied.
              </EuiText>
              <EuiSpacer size="s"></EuiSpacer>
              <PolicyInfoCard space={spaceFilter} notifications={notifications} />
            </EuiFlexItem>
            {/* <EuiFlexItem grow={false}>{createIntegrationAction}</EuiFlexItem> */}
            <EuiFlexItem grow={false}>{spaceSelector}</EuiFlexItem>
            <EuiFlexItem grow={false}>{actionsButton}</EuiFlexItem>
          </EuiFlexGroup>
          <EuiSpacer size={'m'} />
        </EuiFlexItem>
      </PageHeader>
      <EuiPanel>
        <EuiInMemoryTable
          itemId={'id'}
          items={integrations}
          columns={getIntegrationsTableColumns({
            showDetails: showIntegrationDetails,
            setItemForAction,
          })}
          pagination={{
            initialPageSize: 25,
          }}
          search={getIntegrationsTableSearchConfig()}
          selection={{
            onSelectionChange: onSelectionChange,
            initialSelected: [],
          }}
          isSelectable={true}
          sorting={true}
          loading={loading}
        />
      </EuiPanel>
    </>
  );
};
