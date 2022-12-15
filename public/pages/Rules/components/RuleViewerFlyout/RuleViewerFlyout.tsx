/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiFlyout,
  EuiFlyoutBody,
  EuiFlyoutHeader,
  EuiTitle,
  EuiButtonIcon,
} from '@elastic/eui';
import { errorNotificationToast } from '../../../../utils/helpers';
import { ROUTES } from '../../../../utils/constants';
import React, { useMemo, useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { RuleTableItem } from '../../utils/helpers';
import { DeleteRuleModal } from '../DeleteModal/DeleteModal';
import { RuleContentViewer } from '../RuleContentViewer/RuleContentViewer';
import { RuleViewerFlyoutHeaderActions } from './RuleViewFlyoutHeaderActions';
import { RuleService, NotificationsStart } from '../../../../services';

export interface RuleViewerFlyoutProps {
  history?: RouteComponentProps['history'];
  ruleTableItem: RuleTableItem;
  ruleService?: RuleService;
  notifications?: NotificationsStart;
  hideFlyout: (refreshRules?: boolean) => void;
}

export const RuleViewerFlyout: React.FC<RuleViewerFlyoutProps> = ({
  history,
  hideFlyout,
  ruleTableItem,
  ruleService,
  notifications,
}) => {
  const [actionsPopoverOpen, setActionsPopoverOpen] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const toggleActionsPopover = () => {
    setActionsPopoverOpen(!actionsPopoverOpen);
  };
  const closeActionsPopover = () => {
    setActionsPopoverOpen(false);
  };
  const duplicateRule = () => {
    history?.push({
      pathname: ROUTES.RULES_DUPLICATE,
      state: { ruleItem: ruleTableItem.ruleInfo },
    });
  };

  const editRule = () => {
    history?.push({
      pathname: ROUTES.RULES_EDIT,
      state: { ruleItem: ruleTableItem.ruleInfo },
    });
  };

  const headerActions = (
    <RuleViewerFlyoutHeaderActions
      ruleSource={ruleTableItem.source}
      actionsPopoverOpen={actionsPopoverOpen}
      closeActionsPopover={closeActionsPopover}
      duplicateRule={duplicateRule}
      editRule={editRule}
      deleteRule={() => {
        setIsDeleteModalVisible(true);
      }}
      toggleActionsPopover={toggleActionsPopover}
    />
  );

  const closeDeleteModal = () => {
    setIsDeleteModalVisible(false);
  };

  const onDeleteRuleConfirmed = async () => {
    if (!ruleService) {
      return;
    }
    const deleteRuleRes = await ruleService.deleteRule(ruleTableItem.ruleId);

    if (deleteRuleRes.ok) {
      closeDeleteModal();
      hideFlyout(true);
    } else {
      errorNotificationToast(notifications, 'delete', 'rule', deleteRuleRes.error);
    }
  };

  const deleteModal = useMemo(
    () =>
      ruleTableItem.source === 'Custom' ? (
        <DeleteRuleModal
          title={ruleTableItem.title}
          onCancel={closeDeleteModal}
          onConfirm={onDeleteRuleConfirmed}
        />
      ) : null,
    [ruleTableItem, closeDeleteModal, onDeleteRuleConfirmed]
  );

  return (
    <EuiFlyout
      onClose={hideFlyout}
      hideCloseButton
      ownFocus={true}
      size={'m'}
      data-test-subj={`rule_flyout_${ruleTableItem.title}`}
    >
      {isDeleteModalVisible && deleteModal ? deleteModal : null}
      <EuiFlyoutHeader hasBorder={true}>
        <EuiFlexGroup alignItems="center">
          <EuiFlexItem>
            <EuiTitle size="m">
              <h3>{ruleTableItem.title}</h3>
            </EuiTitle>
          </EuiFlexItem>
          {ruleService && history && (
            <EuiFlexItem grow={false} style={{ marginRight: '50px' }}>
              {headerActions}
            </EuiFlexItem>
          )}
          <EuiFlexItem grow={false}>
            <EuiButtonIcon
              aria-label="close"
              iconType="cross"
              display="empty"
              iconSize="m"
              onClick={() => hideFlyout()}
              data-test-subj={`close-finding-details-flyout`}
            />
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiFlyoutHeader>
      <EuiFlyoutBody>
        <RuleContentViewer rule={ruleTableItem.ruleInfo} />
      </EuiFlyoutBody>
    </EuiFlyout>
  );
};
