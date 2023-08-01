/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { RulesTable } from '../../Rules/components/RulesTable/RulesTable';
import { RuleTableItem } from '../../Rules/utils/helpers';
import { ContentPanel } from '../../../components/ContentPanel';
import { EuiButton } from '@elastic/eui';

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
      <RulesTable loading={loadingRules} ruleItems={rules} showRuleDetails={() => {}} />
    </ContentPanel>
  );
};
