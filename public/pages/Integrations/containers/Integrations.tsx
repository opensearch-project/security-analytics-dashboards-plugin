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
  EuiSpacer,
  EuiText,
  EuiCard,
  EuiContextMenuItem,
  EuiContextMenuPanel,
  EuiPopover,
  EuiConfirmModal,
  EuiTab,
  EuiTabs,
} from '@elastic/eui';
import { BREADCRUMBS, ROUTES } from '../../../utils/constants';
import { OVERVIEW_TAB, OverviewTabId } from '../utils/constants';
import { DataSourceProps } from '../../../../types';
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
import { PolicyInfoCard } from '../components/PolicyInfoCard';
import { actionIsAllowedOnSpace, getSpacesAllowAction } from '../../../../common/helpers';
import { RearrangeIntegrations } from '../components/RearrangeIntegrations';
import { useSpaceSelector } from '../../../hooks/useSpaceSelector';
import { EditPolicy } from '../components/EditPolicy';
import { FiltersTab } from '../../Filters/components/FiltersTab';

export interface IntegrationsProps extends RouteComponentProps, DataSourceProps {
  notifications: NotificationsStart;
}

const DELETE_SELECTED_ACTION = 'delete_selected' as const;
const CLEAR_SPACE_ACTION = 'clear_space' as const;

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
    }
  | {
      action: typeof CLEAR_SPACE_ACTION;
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
  const [isOverviewActionsOpen, setIsOverviewActionsOpen] = useState<boolean>(false);
  const [isClearingSpace, setIsClearingSpace] = useState<boolean>(false);
  const [policyRefresh, setPolicyRefresh] = useState(0);
  // This trusts the changes in the history location causes a rerender in the componnet
  const selectedTab =
    history.location.pathname === ROUTES.FILTERS ? OVERVIEW_TAB.FILTERS : OVERVIEW_TAB.INTEGRATIONS;

  const onTabChange = (tab: OverviewTabId) => {
    const path = tab === OVERVIEW_TAB.FILTERS ? ROUTES.FILTERS : ROUTES.INTEGRATIONS;
    history.replace(path + history.location.search);
  };
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
  const canEditSpaceDetails =
    actionIsAllowedOnSpace(spaceFilter, SPACE_ACTIONS.DEFINE_ROOT_DECODER) ||
    actionIsAllowedOnSpace(spaceFilter, SPACE_ACTIONS.EDIT_POLICY_ENRICHMENTS) ||
    actionIsAllowedOnSpace(spaceFilter, SPACE_ACTIONS.EDIT_POLICY_INDEXING_SETTINGS);
  const isEditSpaceDetailsDisabled = !canEditSpaceDetails;
  const spacesAllowingSpacePolicyEdit = Array.from(
    new Set([
      ...getSpacesAllowAction(SPACE_ACTIONS.DEFINE_ROOT_DECODER),
      ...getSpacesAllowAction(SPACE_ACTIONS.EDIT_POLICY_ENRICHMENTS),
      ...getSpacesAllowAction(SPACE_ACTIONS.EDIT_POLICY_INDEXING_SETTINGS),
    ])
  );
  const isClearSpaceDisabled = !actionIsAllowedOnSpace(spaceFilter, SPACE_ACTIONS.CLEAR_SPACE);

  const clearSpace = useCallback(async () => {
    setIsClearingSpace(true);
    try {
      const ok = await DataStore.policies.deleteSpace(spaceFilter);
      if (ok) {
        successNotificationToast(notifications, 'cleared', 'space');
        setPolicyRefresh((prev) => prev + 1);
        await loadIntegrations();
      }
    } finally {
      if (isMountedRef.current) {
        setIsClearingSpace(false);
        setItemForAction(null);
      }
    }
  }, [spaceFilter, loadIntegrations, notifications]);

  const onEditPolicy = () => {
    setItemForAction({ action: SPACE_ACTIONS.EDIT_POLICY });
    setIsPopoverOpen(false);
    setIsOverviewActionsOpen(false);
  };

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

  const buildActionsPopOver = (
    id: string,
    isOpen: boolean,
    onToggle: () => void,
    items: React.ReactElement[]
  ) => (
    <EuiPopover
      id={id}
      button={
        <EuiSmallButton
          iconType={'arrowDown'}
          iconSide={'right'}
          onClick={onToggle}
          data-test-subj={id}
        >
          Actions
        </EuiSmallButton>
      }
      isOpen={isOpen}
      closePopover={onToggle}
      panelPaddingSize={'none'}
      anchorPosition={'downLeft'}
    >
      <EuiContextMenuPanel items={items} size="s" />
    </EuiPopover>
  );

  const overviewActionsMenuItems: React.ReactElement[] = [
    <EuiContextMenuItem
      key="edit-space"
      icon="pencil"
      onClick={onEditPolicy}
      disabled={isEditSpaceDetailsDisabled}
      toolTipContent={
        isEditSpaceDetailsDisabled
          ? `Space policy can only be edited in the spaces: ${spacesAllowingSpacePolicyEdit.join(
              ', '
            )}`
          : undefined
      }
      data-test-subj="overviewEditSpaceDetails"
    >
      Edit
    </EuiContextMenuItem>,
    <EuiContextMenuItem
      key="clear-space"
      icon="trash"
      onClick={() => {
        setItemForAction({ action: CLEAR_SPACE_ACTION });
        setIsOverviewActionsOpen(false);
      }}
      disabled={isClearSpaceDisabled}
      toolTipContent={
        isClearSpaceDisabled
          ? `Clear space is only available in the spaces: ${getSpacesAllowAction(
              SPACE_ACTIONS.CLEAR_SPACE
            ).join(', ')}`
          : undefined
      }
      data-test-subj="overviewClearSpace"
    >
      Clear space
    </EuiContextMenuItem>,
  ];
  overviewActionsMenuItems.push(
    <EuiContextMenuItem
      key="promote"
      icon="share"
      onClick={() => {
        history.push({ pathname: ROUTES.PROMOTE, search: `?space=${spaceFilter}` });
        setIsOverviewActionsOpen(false);
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
    </EuiContextMenuItem>
  );

  const overviewActionsButton = buildActionsPopOver(
    'overviewActionsPopover',
    isOverviewActionsOpen,
    () => setIsOverviewActionsOpen((prev) => !prev),
    overviewActionsMenuItems
  );

  const actionsButton = buildActionsPopOver(
    'integrationsActionsPopover',
    isPopoverOpen,
    () => setIsPopoverOpen((prev) => !prev),
    [
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
          setItemForAction({ action: SPACE_ACTIONS.REARRANGE_INTEGRATIONS });
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
    ]
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
          {itemForAction.action === SPACE_ACTIONS.EDIT_POLICY && (
            <EditPolicy
              space={spaceFilter}
              notifications={notifications}
              onClose={() => setItemForAction(null)}
              onSuccess={() => setPolicyRefresh((prevState) => prevState + 1)}
            />
          )}
        </>
      )}
      {itemForAction?.action === CLEAR_SPACE_ACTION && (
        <EuiConfirmModal
          title="Clear draft space"
          onCancel={() => setItemForAction(null)}
          onConfirm={clearSpace}
          cancelButtonText="Cancel"
          confirmButtonText="Clear space"
          buttonColor="danger"
          defaultFocusedButton="cancel"
          isLoading={isClearingSpace}
        >
          <p>
            This will reset the <strong>draft</strong> space to its initial state, removing all
            integrations, rules, decoders, KVDBs, and filters.
          </p>
          <p>Detectors will not be affected. This action cannot be undone.</p>
        </EuiConfirmModal>
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
                <h1>Overview</h1>
              </EuiText>
              <EuiSpacer size="s"></EuiSpacer>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>{spaceSelector}</EuiFlexItem>
            <EuiFlexItem grow={false}>{overviewActionsButton}</EuiFlexItem>
          </EuiFlexGroup>
          <EuiSpacer size={'s'} />
        </EuiFlexItem>
      </PageHeader>
      <PolicyInfoCard space={spaceFilter} notifications={notifications} refresh={policyRefresh} />
      <EuiSpacer size={'m'} />
      <EuiCard
        textAlign="left"
        paddingSize="m"
        title={
          <EuiTabs size="s">
            <EuiTab
              isSelected={selectedTab === OVERVIEW_TAB.INTEGRATIONS}
              onClick={() => onTabChange(OVERVIEW_TAB.INTEGRATIONS)}
            >
              Integrations
            </EuiTab>
            <EuiTab
              isSelected={selectedTab === OVERVIEW_TAB.FILTERS}
              onClick={() => onTabChange(OVERVIEW_TAB.FILTERS)}
            >
              Filters
            </EuiTab>
          </EuiTabs>
        }
      >
        <EuiSpacer size={'l'} />
        {selectedTab === OVERVIEW_TAB.INTEGRATIONS ? (
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
            search={getIntegrationsTableSearchConfig({ toolsRight: [actionsButton] })}
            selection={{
              onSelectionChange: onSelectionChange,
              initialSelected: [],
            }}
            isSelectable={true}
            sorting={true}
            loading={loading}
          />
        ) : (
          <FiltersTab spaceFilter={spaceFilter} notifications={notifications} history={history} />
        )}
      </EuiCard>
    </>
  );
};
