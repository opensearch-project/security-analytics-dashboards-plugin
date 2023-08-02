/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { RulesTable } from '../../Rules/components/RulesTable/RulesTable';
import { RuleTableItem } from '../../Rules/utils/helpers';
import { ContentPanel } from '../../../components/ContentPanel';
import { EuiButton, EuiFlexGroup, EuiFlexItem, EuiIcon, EuiSpacer, EuiText } from '@elastic/eui';

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
  return (
    <ContentPanel
      title="Detection rules"
      hideHeaderBorder={true}
      actions={[<EuiButton onClick={refreshRules}>Refresh</EuiButton>]}
    >
      {rules.length === 0 ? (
        <EuiFlexGroup justifyContent="center" alignItems="center" direction="column">
          <EuiFlexItem grow={false}>
            <EuiText color="subdued">
              <p>There are no detection rules associated with this log type. </p>
            </EuiText>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButton
              fill
              href={`opensearch_security_analytics_dashboards#/create-rule`}
              target="_blank"
            >
              Create detection rule&nbsp;
              <EuiIcon type={'popout'} />
            </EuiButton>
            <EuiSpacer size="xl" />
          </EuiFlexItem>
        </EuiFlexGroup>
      ) : (
        <RulesTable loading={loadingRules} ruleItems={rules} showRuleDetails={() => {}} />
      )}
    </ContentPanel>
  );
};
