/*
 * Copyright Wazuh Inc.
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { RouteComponentProps, useLocation, useParams } from 'react-router-dom';
import { IntegrationItem, Space } from '../../../../types';
import { SPACE_ACTIONS } from '../../../../common/constants';
import { actionIsAllowedOnSpace, getSpacesAllowAction } from '../../../../common/helpers';
import {
  EuiSmallButton,
  EuiDescriptionList,
  EuiFlexGroup,
  EuiFlexItem,
  EuiLoadingSpinner,
  EuiPanel,
  EuiSpacer,
  EuiTab,
  EuiTabs,
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
import { RuleTableItem } from '../../Rules/utils/helpers';
import { DeleteIntegrationModal } from '../components/DeleteIntegrationModal';
import {
  errorNotificationToast,
  setBreadcrumbs,
  successNotificationToast,
} from '../../../utils/helpers';
import { PageHeader } from '../../../components/PageHeader/PageHeader';
import { useIntegrationDecoders } from '../../Decoders/hooks/useIntegrationDecoders';
import { useIntegrationKVDBs } from '../../KVDBs/hooks/useIntegrationKVDBs';

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
  const [rules, setRules] = useState<RuleTableItem[]>([]);
  const [loadingRules, setLoadingRules] = useState(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const updateRules = useCallback(
    async (details: IntegrationItem, intialDetails: IntegrationItem) => {
      const rulesRes = await DataStore.rules.getAllRules({
        'rule.category': [details.document.title.toLowerCase()],
      });
      const ruleItems = rulesRes.map((rule) => ({
        title: rule._source.title,
        level: rule._source.level,
        category: rule._source.category,
        description: rule._source.description,
        source: rule.prePackaged ? 'Standard' : 'Custom',
        ruleInfo: rule,
        ruleId: rule._id,
      }));
      setRules(ruleItems);
      setLoadingRules(false);
      const rulesCount = details?.document?.rules?.length ?? 0;
      setIntegrationDetails({
        ...details,
        detectionRulesCount: rulesCount,
      });
      setInitialIntegrationDetails({
        ...intialDetails,
        detectionRulesCount: rulesCount,
      });
    },
    []
  );

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

      setBreadcrumbs([BREADCRUMBS.INTEGRATIONS, { text: details.document.title }]);
      const integrationItem = {
        ...details,
        detectionRulesCount: details.document?.rules?.length ?? 0,
        decodersCount: details.document.decoders?.length ?? 0,
        kvdbsCount: details.document.kvdbs?.length ?? 0,
      };
      setIntegrationDetails(integrationItem);
      setInitialIntegrationDetails(integrationItem);
      updateRules(integrationItem, integrationItem);
    };

    getIntegrationDetails();
  }, [integrationId, updateRules]);

  const refreshRules = useCallback(() => {
    updateRules(integrationDetails!, initialIntegrationDetails!);
  }, [integrationDetails]);

  const decoderIds = useMemo(() => integrationDetails?.document.decoders ?? [], [
    integrationDetails,
  ]);
  const {
    items: decoderItems,
    loading: loadingDecoders,
    refresh: refreshDecoders,
  } = useIntegrationDecoders({
    decoderIds,
    space: integrationDetails?.space?.name ?? '',
  });

  const kvdbIds = useMemo(() => integrationDetails?.document.kvdbs ?? [], [integrationDetails]);
  const { items: kvdbItems, loading: loadingKvdbs, refresh: refreshKvdbs } = useIntegrationKVDBs({
    kvdbIds,
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

  const spaceName = (integrationDetails?.space.name ?? '') as Space;
  const isCreateDisabled = !actionIsAllowedOnSpace(spaceName, SPACE_ACTIONS.CREATE);
  const isEditDisabled = !actionIsAllowedOnSpace(spaceName, SPACE_ACTIONS.EDIT);
  const isDeleteDisabled = !actionIsAllowedOnSpace(spaceName, SPACE_ACTIONS.DELETE);

  const actionsButton = (
    <EuiPopover
      id={'integrationsActionsPopover'}
      button={
        <EuiSmallButton
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
          integrationName={integrationDetails.document.title}
          detectionRulesCount={integrationDetails.detectionRulesCount} // TODO: refactor to avoid passing this prop
          decodersCount={integrationDetails.decodersCount}
          kvdbsCount={integrationDetails.kvdbsCount}
          closeModal={() => setShowDeleteModal(false)}
          onConfirm={deleteIntegration}
        />
      )}
      <PageHeader appRightControls={[{ renderComponent: actionsButton }]}>
        <EuiFlexGroup>
          <EuiFlexItem>
            <EuiTitle>
              <h1>{integrationDetails.document.title}</h1>
            </EuiTitle>
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
        <EuiDescriptionList
          listItems={[
            {
              title: 'Description',
              description: integrationDetails.document.description,
            },
          ]}
        />
        <EuiSpacer />
        <EuiFlexGroup>
          <EuiFlexItem>
            <EuiDescriptionList
              listItems={[{ title: 'ID', description: integrationDetails.document.id }]}
            />
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiDescriptionList
              listItems={[
                {
                  title: 'Rules',
                  description: integrationDetails.detectionRulesCount,
                },
              ]}
            />
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiDescriptionList
              listItems={[
                {
                  title: 'Decoders',
                  description: integrationDetails.decodersCount,
                },
              ]}
            />
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiDescriptionList
              listItems={[
                {
                  title: 'KVDBs',
                  description: integrationDetails.kvdbsCount,
                },
              ]}
            />
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiDescriptionList
              listItems={[
                {
                  title: 'Space',
                  description: integrationDetails.space.name,
                },
              ]}
            />
          </EuiFlexItem>
        </EuiFlexGroup>
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
