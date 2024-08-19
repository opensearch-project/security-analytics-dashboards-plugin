/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback } from 'react';
import { RulesTable } from '../../Rules/components/RulesTable/RulesTable';
import { RuleTableItem } from '../../Rules/utils/helpers';
import { ContentPanel } from '../../../components/ContentPanel';
import { EuiSmallButton, EuiFlexGroup, EuiFlexItem, EuiIcon, EuiSpacer, EuiText } from '@elastic/eui';
import { RuleViewerFlyout } from '../../Rules/components/RuleViewerFlyout/RuleViewerFlyout';

export interface LogTypeDetectionRulesProps {
  rules: RuleTableItem[];
  loadingRules: boolean;
  refreshRules: () => void;
}

export const LogTypeDetectionRules: React.FC<LogTypeDetectionRulesProps> = ({
  rules,
  loadingRules,
  refreshRules,
}) => {
  const [flyoutData, setFlyoutData] = useState<RuleTableItem | undefined>(undefined);
  const hideFlyout = useCallback(() => {
    setFlyoutData(undefined);
  }, []);

  return (
    <>
      {flyoutData && <RuleViewerFlyout hideFlyout={hideFlyout} ruleTableItem={flyoutData} />}
      <ContentPanel
        title="Detection rules"
        hideHeaderBorder={true}
        actions={[<EuiSmallButton onClick={refreshRules}>Refresh</EuiSmallButton>]}
      >
        {rules.length === 0 ? (
          <EuiFlexGroup justifyContent="center" alignItems="center" direction="column">
            <EuiFlexItem grow={false}>
              <EuiText color="subdued">
                <p>There are no detection rules associated with this log type. </p>
              </EuiText>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiSmallButton
                fill
                href={`opensearch_security_analytics_dashboards#/create-rule`}
                target="_blank"
              >
                Create detection rule&nbsp;
                <EuiIcon type={'popout'} />
              </EuiSmallButton>
              <EuiSpacer size="xl" />
            </EuiFlexItem>
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
