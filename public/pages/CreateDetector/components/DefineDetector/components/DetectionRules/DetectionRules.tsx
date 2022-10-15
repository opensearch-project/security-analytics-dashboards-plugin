/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { ContentPanel } from '../../../../../../components/ContentPanel';
import {
  EuiAccordion,
  EuiBasicTable,
  EuiButtonEmpty,
  EuiFlexGroup,
  EuiFlexItem,
  EuiHorizontalRule,
  EuiPanel,
  EuiSpacer,
  EuiText,
  EuiTitle,
} from '@elastic/eui';
import { Rule } from '../../../../../../../models/interfaces';
import { getRulesColumns } from './utils/constants';
import { RuleItem, RulesInfoByType } from './types/interfaces';
import { dummyDetectorRules } from './utils/dummyData';

interface DetectionRulesProps extends RouteComponentProps {
  hasSubmitted: boolean;
  isEdit: boolean;
  detectorRules: Rule[];
}

interface DetectionRulesState {
  fieldTouched: boolean;
  selectedRuleType?: string;
  rulesByRuleType: RulesInfoByType;
}

export default class DetectionRules extends Component<DetectionRulesProps, DetectionRulesState> {
  constructor(props: DetectionRulesProps) {
    super(props);
    this.state = this.deriveInitialState();
  }

  deriveInitialState(): DetectionRulesState {
    const detectorRules =
      this.props.detectorRules.length > 0 ? this.props.detectorRules : dummyDetectorRules;
    const rulesByRuleType: {
      [ruleType: string]: { ruleItems: RuleItem[]; activeCount: number };
    } = {};
    detectorRules.forEach((rule) => {
      rulesByRuleType[rule.type] = rulesByRuleType[rule.type] || { ruleItems: [], activeCount: 0 };
      rulesByRuleType[rule.type].ruleItems.push({
        ruleName: rule.name,
        ruleType: rule.type,
        description: rule.description || '',
        active: rule.active,
      });

      if (rule.active) {
        rulesByRuleType[rule.type].activeCount++;
      }
    });

    return {
      fieldTouched: false,
      selectedRuleType: undefined,
      rulesByRuleType,
    };
  }

  getActiveRulesCount(selectedRuleType?: string): number {
    if (selectedRuleType) {
      return this.state.rulesByRuleType[selectedRuleType]?.activeCount || 0;
    }

    return Object.values(this.state.rulesByRuleType).reduce((aggregate, rulesInfo) => {
      return aggregate + rulesInfo.activeCount;
    }, 0);
  }

  getRuleItems(selectedRuleType?: string): RuleItem[] {
    if (selectedRuleType) {
      return this.state.rulesByRuleType[selectedRuleType].ruleItems;
    }

    return Object.values(this.state.rulesByRuleType).reduce(
      (aggregate: RuleItem[], currentRulesInfo) => {
        return aggregate.concat(currentRulesInfo.ruleItems);
      },
      []
    );
  }

  onRuleTypeClick = (selectedRuleType?: string) => {
    this.setState({
      selectedRuleType,
    });
  };

  onRuleActivationToggle = (changedItem: RuleItem, changeToActive: boolean) => {
    const { rulesByRuleType } = this.state;
    const ruleItems = rulesByRuleType[changedItem.ruleType].ruleItems;
    const changedIdx = ruleItems.findIndex((item) => item.ruleName === changedItem.ruleName);

    if (changedIdx > -1) {
      const newRuleItems = [
        ...ruleItems.slice(0, changedIdx),
        { ...ruleItems[changedIdx], active: changeToActive },
        ...ruleItems.slice(changedIdx + 1),
      ];
      const newRulesByRuleType: RulesInfoByType = {
        ...rulesByRuleType,
        [changedItem.ruleType]: {
          ruleItems: newRuleItems,
          activeCount:
            rulesByRuleType[changedItem.ruleType].activeCount + (changeToActive ? 1 : -1),
        },
      };
      this.setState({ rulesByRuleType: newRulesByRuleType });
    }
  };

  render() {
    const { rulesByRuleType, selectedRuleType } = this.state;
    const detectorRules =
      this.props.detectorRules.length > 0 ? this.props.detectorRules : dummyDetectorRules;

    const totalRulesCountForSelectedType = selectedRuleType
      ? rulesByRuleType[selectedRuleType]?.ruleItems.length || 0
      : detectorRules.length;
    const activeRulesCountForSelectedType = this.getActiveRulesCount(selectedRuleType);
    const allRulesCount = this.props.detectorRules.length || dummyDetectorRules.length;
    const ruleTypes = Object.keys(rulesByRuleType);

    return (
      <EuiPanel style={{ paddingLeft: '0px', paddingRight: '0px' }}>
        <EuiAccordion
          buttonContent={
            <EuiTitle>
              <h4>{`Threat detection rules (${allRulesCount})`}</h4>
            </EuiTitle>
          }
          buttonProps={{ style: { paddingLeft: '10px', paddingRight: '10px' } }}
          id={'detectorRulesAccordion'}
          initialIsOpen={false}
        >
          <EuiHorizontalRule margin={'xs'} />
          <div style={{ paddingLeft: '10px', paddingRight: '10px' }}>
            <EuiSpacer size={'m'} />
            <EuiFlexGroup>
              <EuiFlexItem grow={false}>
                <EuiText>
                  <EuiButtonEmpty onClick={() => this.onRuleTypeClick()}>
                    View all rules {`(${allRulesCount})`}
                  </EuiButtonEmpty>
                  <EuiSpacer />
                  {ruleTypes.map((ruleType) => (
                    <React.Fragment key={ruleType}>
                      <EuiButtonEmpty
                        onClick={() => this.onRuleTypeClick(ruleType)}
                      >{`${ruleType} (${rulesByRuleType[ruleType].ruleItems.length})`}</EuiButtonEmpty>
                      <EuiSpacer size="xs" />
                    </React.Fragment>
                  ))}
                </EuiText>
              </EuiFlexItem>
              <EuiFlexItem>
                <ContentPanel
                  title={`${
                    selectedRuleType || 'All'
                  } rules (${activeRulesCountForSelectedType}/${totalRulesCountForSelectedType} enabled)`}
                >
                  <EuiBasicTable
                    columns={getRulesColumns(this.onRuleActivationToggle)}
                    items={this.getRuleItems(selectedRuleType)}
                    itemId={(item: RuleItem) => `${item.ruleName}`}
                  />
                </ContentPanel>
              </EuiFlexItem>
            </EuiFlexGroup>
          </div>
        </EuiAccordion>
      </EuiPanel>
    );
  }
}
