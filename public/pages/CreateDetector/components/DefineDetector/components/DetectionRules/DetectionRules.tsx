/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiPanel,
  EuiAccordion,
  EuiTitle,
  EuiHorizontalRule,
  CriteriaWithPagination,
  EuiText,
} from '@elastic/eui';

import React, { useMemo, useState } from 'react';
import { DetectionRulesTable } from './DetectionRulesTable';
import { RuleItem, RuleItemInfo } from './types/interfaces';
import { RuleViewerFlyout } from '../../../../../Rules/components/RuleViewerFlyout/RuleViewerFlyout';
import { RuleTableItem } from '../../../../../Rules/utils/helpers';
import { RuleItemInfoBase } from '../../../../../Rules/models/types';

export interface CreateDetectorRulesState {
  allRules: RuleItemInfo[];
  page: {
    index: number;
  };
}

export interface DetectionRulesProps {
  rulesState: CreateDetectorRulesState;
  loading?: boolean;
  onRuleToggle: (changedItem: RuleItem, isActive: boolean) => void;
  onAllRulesToggle: (enabled: boolean) => void;
  onPageChange: (page: { index: number; size: number }) => void;
}

export const DetectionRules: React.FC<DetectionRulesProps> = ({
  rulesState,
  loading,
  onPageChange,
  onRuleToggle,
  onAllRulesToggle,
}) => {
  const [flyoutData, setFlyoutData] = useState<RuleTableItem | null>(null);

  let enabledRulesCount = 0;
  rulesState.allRules.forEach((ruleItem) => {
    if (ruleItem.enabled) {
      enabledRulesCount++;
    }
  });

  const ruleItems: RuleItem[] = useMemo(
    () =>
      rulesState.allRules.map((rule) => ({
        id: rule._id,
        active: rule.enabled,
        description: rule._source.description,
        library: rule.prePackaged ? 'Sigma' : 'Custom',
        logType: rule._source.category,
        name: rule._source.title,
        severity: rule._source.level,
        ruleInfo: rule,
      })),
    [rulesState.allRules]
  );

  const onTableChange = (nextValues: CriteriaWithPagination<RuleItem>) => {
    onPageChange(nextValues.page);
  };

  const onRuleDetails = (ruleItem: RuleItem) => {
    setFlyoutData(() => ({
      title: ruleItem.name,
      level: ruleItem.severity,
      category: ruleItem.logType,
      description: ruleItem.description,
      source: ruleItem.library,
      ruleInfo: rulesState.allRules.find((r) => r._id === ruleItem.id) as RuleItemInfoBase,
      ruleId: ruleItem.id,
    }));
  };

  return (
    <EuiPanel style={{ paddingLeft: '0px', paddingRight: '0px' }}>
      {flyoutData ? (
        <RuleViewerFlyout
          hideFlyout={() => setFlyoutData(() => null)}
          history={null as any}
          ruleTableItem={flyoutData}
          ruleService={null as any}
        />
      ) : null}
      <EuiAccordion
        buttonContent={
          <div data-test-subj="detection-rules-btn">
            <EuiTitle>
              <h4>{`Detection rules (${enabledRulesCount} selected)`}</h4>
            </EuiTitle>
            <EuiText size="s" color="subdued">
              Detection rules are automatically added based on your chosen log types. Additionally,
              you may add or remove detection rules for this detector.
            </EuiText>
          </div>
        }
        buttonProps={{ style: { paddingLeft: '10px', paddingRight: '10px' } }}
        id={'detectorRulesAccordion'}
        initialIsOpen={false}
        isLoading={loading}
      >
        <EuiHorizontalRule margin={'xs'} />
        <DetectionRulesTable
          pageIndex={rulesState.page.index}
          ruleItems={ruleItems}
          onAllRulesToggled={onAllRulesToggle}
          onRuleActivationToggle={onRuleToggle}
          onTableChange={onTableChange}
          onRuleDetails={onRuleDetails}
        />
      </EuiAccordion>
    </EuiPanel>
  );
};
