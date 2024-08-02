/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiAccordion,
  EuiTitle,
  CriteriaWithPagination,
  EuiText,
  EuiEmptyPrompt,
  EuiSmallButton,
  EuiIcon,
  EuiLoadingSpinner,
} from '@elastic/eui';

import React, { useMemo, useState } from 'react';
import { DetectionRulesTable } from './DetectionRulesTable';
import { RuleItem, RuleItemInfo } from './types/interfaces';
import { RuleViewerFlyout } from '../../../../../Rules/components/RuleViewerFlyout/RuleViewerFlyout';
import { RuleTableItem } from '../../../../../Rules/utils/helpers';
import { RuleItemInfoBase } from '../../../../../../../types';
import { ROUTES } from '../../../../../../utils/constants';

export interface CreateDetectorRulesState {
  allRules: RuleItemInfo[];
  page: {
    index: number;
  };
}

export interface DetectionRulesProps {
  detectorType: string;
  rulesState: CreateDetectorRulesState;
  loading?: boolean;
  onRuleToggle: (changedItem: RuleItem, isActive: boolean) => void;
  onAllRulesToggle: (enabled: boolean) => void;
  onPageChange: (page: { index: number; size: number }) => void;
}

export const DetectionRules: React.FC<DetectionRulesProps> = ({
  detectorType,
  rulesState,
  loading,
  onPageChange,
  onRuleToggle,
  onAllRulesToggle,
}) => {
  const [flyoutData, setFlyoutData] = useState<RuleTableItem | null>(null);

  let enabledRulesCountDisplay: React.ReactNode;

  if (loading) {
    enabledRulesCountDisplay = <EuiLoadingSpinner size="m" />;
  } else {
    let count = 0;
    rulesState.allRules.forEach((ruleItem) => {
      if (ruleItem.enabled) {
        count++;
      }
    });

    enabledRulesCountDisplay = <span>{count}</span>;
  }

  const ruleItems: RuleItem[] = useMemo(
    () =>
      rulesState.allRules.map((rule) => ({
        id: rule._id,
        active: rule.enabled,
        description: rule._source.description,
        library: rule.prePackaged ? 'Standard' : 'Custom',
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
    <>
      {flyoutData ? (
        <RuleViewerFlyout
          hideFlyout={() => setFlyoutData(() => null)}
          history={null as any}
          ruleTableItem={flyoutData}
        />
      ) : null}
      <EuiAccordion
        buttonContent={
          <div data-test-subj="detection-rules-btn">
            <EuiTitle size={'s'}>
              <h4>
                {'Selected detection rules ('}
                <>{enabledRulesCountDisplay}</>
                {')'}
              </h4>
            </EuiTitle>
            <EuiText size="s" color="subdued">
              Add or remove detection rules for this detector.
            </EuiText>
          </div>
        }
        extraAction={
          <EuiSmallButton href={`#${ROUTES.RULES}`} target="_blank">
            Manage <EuiIcon type={'popout'} />
          </EuiSmallButton>
        }
        id={'detectorRulesAccordion'}
        initialIsOpen={false}
        isLoading={loading}
      >
        {ruleItems.length ? (
          <DetectionRulesTable
            pageIndex={rulesState.page.index}
            ruleItems={ruleItems}
            onAllRulesToggled={onAllRulesToggle}
            onRuleActivationToggle={onRuleToggle}
            onTableChange={onTableChange}
            onRuleDetails={onRuleDetails}
          />
        ) : (
          <EuiEmptyPrompt
            title={
              <EuiTitle>
                <h1>No detection rules {detectorType ? 'to display' : 'selected'}</h1>
              </EuiTitle>
            }
            body={
              <p>
                {detectorType
                  ? 'There are no applicable detection rules for the selected log type. Consider creating new detection rules.'
                  : 'Select a log type to be able to select detection rules.'}
              </p>
            }
            actions={
              detectorType
                ? [
                    <EuiSmallButton href={`#${ROUTES.RULES}`} target="_blank">
                      Manage&nbsp;
                      <EuiIcon type={'popout'} />
                    </EuiSmallButton>,
                  ]
                : undefined
            }
          />
        )}
      </EuiAccordion>
    </>
  );
};
