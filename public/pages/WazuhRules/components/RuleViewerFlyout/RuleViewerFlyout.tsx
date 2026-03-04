/*
 * Copyright Wazuh Inc.
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiFlyout,
  EuiFlyoutBody,
  EuiFlyoutHeader,
  EuiSmallButtonIcon,
  EuiText,
} from '@elastic/eui';
import { RuleTableItem } from '../../utils/helpers';
import { RuleContentViewer } from '../../../Rules/components/RuleContentViewer/RuleContentViewer';

export interface RuleViewerFlyoutProps {
  ruleTableItem: RuleTableItem;
  hideFlyout: () => void;
}

export const RuleViewerFlyout: React.FC<RuleViewerFlyoutProps> = ({
  ruleTableItem,
  hideFlyout,
}) => {
  return (
    <EuiFlyout
      onClose={hideFlyout}
      hideCloseButton
      ownFocus={true}
      size="m"
      data-test-subj={`rule_flyout_${ruleTableItem.title}`}
    >
      <EuiFlyoutHeader hasBorder>
        <EuiFlexGroup alignItems="center">
          <EuiFlexItem>
            <EuiText size="s">
              <h2>Rule details - {ruleTableItem.title}</h2>
            </EuiText>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiSmallButtonIcon
              aria-label="close"
              iconType="cross"
              display="empty"
              iconSize="m"
              onClick={hideFlyout}
              data-test-subj="close-rule-details-flyout"
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
