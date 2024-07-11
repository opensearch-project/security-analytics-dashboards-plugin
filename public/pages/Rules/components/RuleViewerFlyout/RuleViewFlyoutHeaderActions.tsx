/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiSmallButton, EuiButtonEmpty, EuiFlexGroup, EuiFlexItem, EuiPopover } from '@elastic/eui';
import React from 'react';

export interface RuleViewerFlyoutHeaderActionsProps {
  ruleSource: string;
  actionsPopoverOpen: boolean;
  closeActionsPopover: () => void;
  duplicateRule: () => void;
  editRule: () => void;
  deleteRule: () => void;
  toggleActionsPopover: () => void;
}

export const RuleViewerFlyoutHeaderActions: React.FC<RuleViewerFlyoutHeaderActionsProps> = ({
  ruleSource,
  actionsPopoverOpen,
  closeActionsPopover,
  duplicateRule,
  deleteRule,
  editRule,
  toggleActionsPopover,
}) => {
  return ruleSource === 'Standard' ? (
    <EuiSmallButton onClick={duplicateRule}>Duplicate</EuiSmallButton>
  ) : (
    <EuiPopover
      button={
        <EuiSmallButton iconType="arrowDown" iconSide="right" onClick={toggleActionsPopover}>
          Action
        </EuiSmallButton>
      }
      isOpen={actionsPopoverOpen}
      closePopover={closeActionsPopover}
      anchorPosition="downLeft"
    >
      <EuiFlexGroup direction="column">
        <EuiFlexItem>
          <EuiButtonEmpty onClick={editRule}>Edit</EuiButtonEmpty>
        </EuiFlexItem>

        <EuiFlexItem>
          <EuiButtonEmpty onClick={duplicateRule}>Duplicate</EuiButtonEmpty>
        </EuiFlexItem>

        <EuiFlexItem>
          <EuiButtonEmpty onClick={deleteRule}>Delete</EuiButtonEmpty>
        </EuiFlexItem>
      </EuiFlexGroup>
    </EuiPopover>
  );
};
