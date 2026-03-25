/*
 * Copyright Wazuh Inc.
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { RouteComponentProps, useLocation, useParams } from 'react-router-dom';
import { IntegrationItem, Space } from '../../../../types';
import { SPACE_ACTIONS } from '../../../../common/constants';
import { actionIsAllowedOnSpace, getSpacesAllowAction } from '../../../../common/helpers';
import {
  EuiSmallButton,
  EuiDescriptionList,
  EuiFlexGroup,
  EuiFlexItem,
  EuiHealth,
  EuiLoadingSpinner,
  EuiPanel,
  EuiSpacer,
  EuiTab,
  EuiTabs,
  EuiText,
  EuiTitle,
  EuiPopover,
  EuiContextMenuPanel,
  EuiContextMenuItem,
  EuiHorizontalRule,
} from '@elastic/eui';
import { DataStore } from '../../../store/DataStore';
import { BREADCRUMBS, ROUTES } from '../../../utils/constants';
import { integrationDetailsTabs } from '../utils/constants';
import { IntegrationDetails } from '../components/IntegrationDetails';
import { NotificationsStart } from 'opensearch-dashboards/public';
import { IntegrationDetectionRules } from '../components/IntegrationDetectionRules';
import { IntegrationDecoders } from '../components/IntegrationDecoders';
import { IntegrationKVDBs } from '../components/IntegrationKVDBs';
import { DeleteIntegrationModal } from '../components/DeleteIntegrationModal';
import {
  errorNotificationToast,
  setBreadcrumbs,
  successNotificationToast,
} from '../../../utils/helpers';
import { PageHeader } from '../../../components/PageHeader/PageHeader';
import { useIntegrationDecoders } from '../../Decoders/hooks/useIntegrationDecoders';
import { useIntegrationKVDBs } from '../../KVDBs/hooks/useIntegrationKVDBs';
import { useIntegrationRules } from '../../WazuhRules/hooks/useIntegrationRules';
import { formatIntegrationMetadataDate } from '../utils/helpers';

export interface IntegrationProps extends RouteComponentProps {
  notifications: NotificationsStart;
}

export const Integration: React.FC<IntegrationProps> = ({ notifications, history }) => {
  const isMountedRef = useRef(true);
  const { integrationId } = useParams<{ integrationId: string }>();
  const [selectedTabId, setSelectedTabId] = useState('details');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isActionsMenuOpen, setIsActionsMenuOpen] = useState(false);
  const [infoText, setInfoText] = useState<React.ReactNode | string>(
    <>
      Loading details &nbsp;
      <EuiLoadingSpinner size="l" />
    </>
  );
  const [integrationDetails, setIntegrationDetails] = useState<IntegrationItem | undefined>(
    undefined
  );
  const [initialIntegrationDetails, setInitialIntegrationDetails] = useState<
    IntegrationItem | undefined
  >(undefined);

  const [isEditMode, setIsEditMode] = useState(false);
  const [togglingEnabled, setTogglingEnabled] = useState(false);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const getIntegrationDetails = async () => {
      const details = await DataStore.integrations.getIntegration(integrationId);

      if (!isMountedRef.current) {
        return;
      }

      if (!details) {
        setInfoText('Integration not found!'); // Replace Log Type to Integration by Wazuh
        return;
      }

      setBreadcrumbs([BREADCRUMBS.INTEGRATIONS, { text: details.document.metadata?.title ?? '' }]);
      const integrationItem = {
        ...details,
        detectionRulesCount: details.document?.rules?.length ?? 0,
        decodersCount: details.document.decoders?.length ?? 0,
        kvdbsCount: details.document.kvdbs?.length ?? 0,
      };
      setIntegrationDetails(integrationItem);
      setInitialIntegrationDetails(integrationItem);
    };

    getIntegrationDetails();
  }, [integrationId]);

  const ruleIds = useMemo(() => integrationDetails?.document.rules ?? [], [integrationDetails]);
  const { items: rules, loading: loadingRules, refresh: refreshRules } = useIntegrationRules({
    ruleIds,
    space: integrationDetails?.space?.name ?? '',
  });

  const decoderIds = useMemo(
    () => integrationDetails?.document.decoders ?? [],
    [integrationDetails]
  );
  const {
    items: decoderItems,
    loading: loadingDecoders,
    refresh: refreshDecoders,
  } = useIntegrationDecoders({
    decoderIds,
    space: integrationDetails?.space?.name ?? '',
  });

  const kvdbIds = useMemo(() => integrationDetails?.document.kvdbs ?? [], [integrationDetails]);
  const {
    items: kvdbItems,
    loading: loadingKvdbs,
    refresh: refreshKvdbs,
  } = useIntegrationKVDBs({
    kvdbIds,
    space: integrationDetails?.space?.name ?? '',
  });

  const renderTabContent = () => {
    switch (selectedTabId) {
      case 'decoders':
        return (
          <IntegrationDecoders
            decoders={decoderItems}
            loading={loadingDecoders}
            space={integrationDetails?.space?.name ?? ''}
            onRefresh={refreshDecoders}
          />
        );
      case 'kvdbs':
        return (
          <IntegrationKVDBs
            kvdbs={kvdbItems}
            loading={loadingKvdbs}
            space={integrationDetails?.space?.name ?? ''}
            onRefresh={refreshKvdbs}
          />
        );
      case 'detection_rules':
        return (
          <IntegrationDetectionRules
            loadingRules={loadingRules}
            rules={rules}
            space={integrationDetails?.space?.name ?? ''}
            refreshRules={refreshRules}
          />
        );
      case 'details':
      default:
        return (
          <IntegrationDetails
            integrationDetails={integrationDetails!}
            isEditMode={isEditMode}
            notifications={notifications}
            setIsEditMode={setIsEditMode}
            setIntegrationDetails={setIntegrationDetails}
            integrationId={integrationId}
          />
        );
    }
  };

  const deleteIntegration = async () => {
    const { ok } = await DataStore.integrations.deleteIntegration(integrationDetails!.id);

    if (ok) {
      successNotificationToast(notifications, 'deleted', 'integration');
      history.push(ROUTES.INTEGRATIONS);
    }
  };

  const toggleActionsMenu = () => {
    setIsActionsMenuOpen((state) => !state);
  };

  const closeActionsPopover = () => {
    setIsActionsMenuOpen(false);
  };

  const toggleIntegrationEnabled = async (checked: boolean) => {
    if (!integrationDetails) {
      return;
    }
    setTogglingEnabled(true);
    const next: IntegrationItem = {
      ...integrationDetails,
      document: {
        ...integrationDetails.document,
        enabled: checked,
      },
    };
    const success = await DataStore.integrations.updateIntegration(integrationDetails.id, next);
    if (success) {
      setIntegrationDetails(next);
      setInitialIntegrationDetails(next);
      successNotificationToast(
        notifications,
        'updated',
        `integration ${next.document.metadata?.title ?? ''}`
      );
    }
    setTogglingEnabled(false);
  };

  const spaceName = (integrationDetails?.space.name ?? '') as Space;
  const isCreateDisabled = !actionIsAllowedOnSpace(spaceName, SPACE_ACTIONS.CREATE);
  const isEditDisabled = !actionIsAllowedOnSpace(spaceName, SPACE_ACTIONS.EDIT);
  const isDeleteDisabled = !actionIsAllowedOnSpace(spaceName, SPACE_ACTIONS.DELETE);

  const integrationEnabled = integrationDetails?.document.enabled === true;

  const actionsButton = (
    <EuiPopover
      id={'integrationsActionsPopover'}
      button={
        <EuiSmallButton
          isLoading={togglingEnabled}
          iconType={'arrowDown'}
          iconSide={'right'}
          onClick={toggleActionsMenu}
          data-test-subj={'integrationsActionsButton'}
        >
          Actions
        </EuiSmallButton>
      }
      isOpen={isActionsMenuOpen}
      closePopover={closeActionsPopover}
      panelPaddingSize={'none'}
      anchorPosition={'downLeft'}
      data-test-subj={'integrationsActionsPopover'}
    >
      <EuiContextMenuPanel
        size="s"
        items={[
          <EuiContextMenuItem
            key={'createRule'}
            href={'detection_rules#/create-rule'}
            target="_blank"
            onClick={() => {
              closeActionsPopover();
            }}
            data-test-subj={'createRuleButton'}
            disabled={isCreateDisabled}
            toolTipContent={
              isCreateDisabled
                ? `Rule can only be created in the spaces: ${getSpacesAllowAction(
                    SPACE_ACTIONS.CREATE
                  ).join(', ')}`
                : undefined
            }
          >
            Create rule
          </EuiContextMenuItem>,
          <EuiContextMenuItem
            key={'createDecoder'}
            href={'decoders#/create-decoder'}
            target="_blank"
            onClick={() => {
              closeActionsPopover();
            }}
            data-test-subj={'createDecoderButton'}
            disabled={isCreateDisabled}
            toolTipContent={
              isCreateDisabled
                ? `Decoder can only be created in the spaces: ${getSpacesAllowAction(
                    SPACE_ACTIONS.CREATE
                  ).join(', ')}`
                : undefined
            }
          >
            Create decoder
          </EuiContextMenuItem>,
          <EuiContextMenuItem
            key={'createKVDB'}
            href={'kvdbs#/create-kvdb'}
            target="_blank"
            onClick={() => {
              closeActionsPopover();
            }}
            data-test-subj={'createKVDBButton'}
            disabled={isCreateDisabled}
            toolTipContent={
              isCreateDisabled
                ? `KVDB can only be created in the spaces: ${getSpacesAllowAction(
                    SPACE_ACTIONS.CREATE
                  ).join(', ')}`
                : undefined
            }
          >
            Create KVDB
          </EuiContextMenuItem>,
          <EuiHorizontalRule margin="xs" />,
          <EuiContextMenuItem
            key={'toggleIntegrationEnabled'}
            disabled={isEditDisabled || togglingEnabled}
            onClick={() => {
              closeActionsPopover();
              toggleIntegrationEnabled(!integrationEnabled);
            }}
            data-test-subj={'integrationEnableDisableMenuItem'}
            toolTipContent={
              isEditDisabled
                ? `Integration can only be edited in the spaces: ${getSpacesAllowAction(
                    SPACE_ACTIONS.EDIT
                  ).join(', ')}`
                : undefined
            }
          >
            {integrationEnabled ? 'Disable' : 'Enable'}
          </EuiContextMenuItem>,
          <EuiContextMenuItem
            key={'Edit'}
            onClick={() => {
              closeActionsPopover();
              setIsEditMode(true);
              setSelectedTabId('details');
            }}
            disabled={isEditDisabled}
            data-test-subj={'editIntegrationButton'}
            toolTipContent={
              isEditDisabled
                ? `Integration can only be edited in the spaces: ${getSpacesAllowAction(
                    SPACE_ACTIONS.EDIT
                  ).join(', ')}`
                : undefined
            }
          >
            Edit
          </EuiContextMenuItem>,
          <EuiContextMenuItem
            key={'Delete'}
            onClick={() => {
              closeActionsPopover();
              setShowDeleteModal(true);
            }}
            data-test-subj={'deleteIntegrationButton'}
            disabled={isDeleteDisabled}
            toolTipContent={
              isDeleteDisabled
                ? `Integration can only be deleted in the spaces: ${getSpacesAllowAction(
                    SPACE_ACTIONS.DELETE
                  ).join(', ')}`
                : undefined
            }
          >
            Delete
          </EuiContextMenuItem>,
        ]}
      />
    </EuiPopover>
  );

  return !integrationDetails ? (
    <EuiTitle>
      <h2>{infoText}</h2>
    </EuiTitle>
  ) : (
    <>
      {showDeleteModal && (
        <DeleteIntegrationModal
          integrationId={integrationDetails.id}
          integrationName={integrationDetails.document.metadata?.title ?? ''}
          detectionRulesCount={integrationDetails.detectionRulesCount} // TODO: refactor to avoid passing this prop
          decodersCount={integrationDetails.decodersCount}
          kvdbsCount={integrationDetails.kvdbsCount}
          closeModal={() => setShowDeleteModal(false)}
          onConfirm={deleteIntegration}
        />
      )}
      <PageHeader
        appBadgeControls={[
          {
            renderComponent: (
              <EuiHealth color={integrationEnabled ? 'success' : 'subdued'}>
                {integrationEnabled ? 'Enabled' : 'Disabled'}
              </EuiHealth>
            ),
          },
        ]}
        appRightControls={[{ renderComponent: actionsButton }]}
      >
        <EuiFlexGroup alignItems="center" justifyContent="spaceBetween">
          <EuiFlexItem>
            <EuiFlexGroup alignItems="center" responsive={false} wrap>
              <EuiFlexItem grow={false}>
                <EuiText data-test-subj="integration-detail-title" size="s">
                  <h1>{integrationDetails.document.metadata?.title}</h1>
                </EuiText>
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiHealth color={integrationEnabled ? 'success' : 'subdued'}>
                  {integrationEnabled ? 'Enabled' : 'Disabled'}
                </EuiHealth>
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiFlexGroup justifyContent="flexEnd" alignItems="center">
              <EuiFlexItem grow={false}>{actionsButton}</EuiFlexItem>
            </EuiFlexGroup>
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiSpacer size="m" />
      </PageHeader>
      <EuiSpacer />
      <EuiPanel grow={false}>
        <div className="integration-details-summary-panel">
          <div className="integration-details-summary-panel__id">
            <EuiDescriptionList
              listItems={[
                {
                  title: 'ID',
                  description: (
                    <span style={{ overflowWrap: 'anywhere' }}>
                      {integrationDetails.document.id}
                    </span>
                  ),
                },
              ]}
            />
          </div>
          <div className="integration-details-summary-panel__date">
            <EuiDescriptionList
              listItems={[
                {
                  title: 'Date',
                  description: formatIntegrationMetadataDate(
                    integrationDetails.document.metadata?.date
                  ),
                },
              ]}
            />
          </div>
          <div className="integration-details-summary-panel__modified">
            <EuiDescriptionList
              listItems={[
                {
                  title: 'Modified',
                  description: formatIntegrationMetadataDate(
                    integrationDetails.document.metadata?.modified
                  ),
                },
              ]}
            />
          </div>
          <div className="integration-details-summary-panel__space">
            <EuiDescriptionList
              listItems={[
                {
                  title: 'Space',
                  description: integrationDetails.space.name,
                },
              ]}
            />
          </div>
          <div className="integration-details-summary-panel__rules">
            <EuiDescriptionList
              listItems={[
                {
                  title: 'Rules',
                  description: integrationDetails.detectionRulesCount,
                },
              ]}
            />
          </div>
          <div className="integration-details-summary-panel__decoders">
            <EuiDescriptionList
              listItems={[
                {
                  title: 'Decoders',
                  description: integrationDetails.decodersCount,
                },
              ]}
            />
          </div>
          <div className="integration-details-summary-panel__kvdbs">
            <EuiDescriptionList
              listItems={[
                {
                  title: 'KVDBs',
                  description: integrationDetails.kvdbsCount,
                },
              ]}
            />
          </div>
        </div>
      </EuiPanel>
      <EuiSpacer />
      <EuiTabs size="s">
        {integrationDetailsTabs.map((tab, index) => {
          return (
            <EuiTab
              onClick={() => {
                setSelectedTabId(tab.id);
              }}
              key={index}
              isSelected={selectedTabId === tab.id}
            >
              {tab.name}
            </EuiTab>
          );
        })}
      </EuiTabs>
      <EuiSpacer size="m" />
      {renderTabContent()}
    </>
  );
};
