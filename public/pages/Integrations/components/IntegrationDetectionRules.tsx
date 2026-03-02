/*
 * Copyright Wazuh Inc.
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React, { useState, useCallback } from 'react';
import { RulesTable } from '../../Rules/components/RulesTable/RulesTable';
import { RuleTableItem } from '../../Rules/utils/helpers';
import { ContentPanel } from '../../../components/ContentPanel';
import {
  EuiSmallButton,
  EuiFlexGroup,
  EuiFlexItem,
  EuiIcon,
  EuiSpacer,
  EuiText,
  EuiToolTip,
} from '@elastic/eui';
import { RuleViewerFlyout } from '../../Rules/components/RuleViewerFlyout/RuleViewerFlyout';
import { SpaceTypes, SPACE_ACTIONS } from '../../../../common/constants';
import { actionIsAllowedOnSpace, getSpacesAllowAction } from '../../../../common/helpers';
import { Space } from '../../../../types';

export interface IntegrationDetectionRulesProps {
  rules: RuleTableItem[];
  loadingRules: boolean;
  space: string;
  refreshRules: () => void;
}

export const IntegrationDetectionRules: React.FC<IntegrationDetectionRulesProps> = ({
  rules,
  loadingRules,
  space,
  refreshRules,
}) => {
  const [flyoutData, setFlyoutData] = useState<RuleTableItem | undefined>(undefined);
  const hideFlyout = useCallback(() => {
    setFlyoutData(undefined);
  }, []);

  const isCreateDisabled = !actionIsAllowedOnSpace(space as Space, SPACE_ACTIONS.CREATE);

  return (
    <>
      {flyoutData && <RuleViewerFlyout hideFlyout={hideFlyout} ruleTableItem={flyoutData} />}
      <ContentPanel
        title="Rules"
        hideHeaderBorder={true}
        actions={[<EuiSmallButton onClick={refreshRules}>Refresh</EuiSmallButton>]}
      >
        {rules.length === 0 ? (
          <EuiFlexGroup justifyContent="center" alignItems="center" direction="column">
            <EuiFlexItem grow={false}>
              <EuiText color="subdued" size="s">
                {/* By Wazuh */}
                <p>There are no rules associated with this integration. </p>
              </EuiText>
            </EuiFlexItem>
            {space !== SpaceTypes.STANDARD.value && (
              <EuiFlexItem grow={false}>
                {isCreateDisabled ? (
                  <EuiToolTip
                    content={`Rule can only be created in the spaces: ${getSpacesAllowAction(
                      SPACE_ACTIONS.CREATE
                    ).join(', ')}`}
                  >
                    <span>
                      <EuiSmallButton fill disabled>
                        Create rule&nbsp;
                        <EuiIcon type={'popout'} />
                      </EuiSmallButton>
                    </span>
                  </EuiToolTip>
                ) : (
                  <EuiSmallButton
                    fill
                    href={`opensearch_security_analytics_dashboards#/create-rule`}
                    target="_blank"
                  >
                    Create rule&nbsp;
                    <EuiIcon type={'popout'} />
                  </EuiSmallButton>
                )}
                <EuiSpacer size="xl" />
              </EuiFlexItem>
            )}
          </EuiFlexGroup>
        ) : (
          <RulesTable
            loading={loadingRules}
            ruleItems={rules}
            columnsToHide={['category']}
            showRuleDetails={setFlyoutData}
          />
        )}
      </ContentPanel>
    </>
  );
};
