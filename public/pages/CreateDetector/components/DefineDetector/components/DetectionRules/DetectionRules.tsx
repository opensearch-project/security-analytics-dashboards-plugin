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
} from '@elastic/eui';
import React, { useMemo } from 'react';
import { DetectionRulesTable } from './DetectionRulesTable';
import { RuleItem, RuleItemInfo } from './types/interfaces';

export interface CreateDetectorRulesState {
  allRules: RuleItemInfo[];
  page: {
    index: number;
  };
}

export interface DetectionRulesProps {
  rulesState: CreateDetectorRulesState;
  onRuleToggle: (changedItem: RuleItem, isActive: boolean) => void;
  onAllRulesToggle: (enabled: boolean) => void;
  onPageChange: (page: { index: number; size: number }) => void;
}

export const DetectionRules: React.FC<DetectionRulesProps> = ({
  rulesState,
  onPageChange,
  onRuleToggle,
  onAllRulesToggle,
}) => {
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
      })),
    [rulesState.allRules]
  );

  const onTableChange = (nextValues: CriteriaWithPagination<RuleItem>) => {
    onPageChange(nextValues.page);
  };

  return (
    <EuiPanel style={{ paddingLeft: '0px', paddingRight: '0px' }}>
      <EuiAccordion
        buttonContent={
          <EuiTitle>
            <h4>{`Detection rules (${enabledRulesCount} selected)`}</h4>
          </EuiTitle>
        }
        buttonProps={{ style: { paddingLeft: '10px', paddingRight: '10px' } }}
        id={'detectorRulesAccordion'}
        initialIsOpen={false}
      >
        <EuiHorizontalRule margin={'xs'} />
        <DetectionRulesTable
          pageIndex={rulesState.page.index}
          ruleItems={ruleItems}
          onAllRulesToggled={onAllRulesToggle}
          onRuleActivationToggle={onRuleToggle}
          onTableChange={onTableChange}
        />
      </EuiAccordion>
    </EuiPanel>
  );
};
