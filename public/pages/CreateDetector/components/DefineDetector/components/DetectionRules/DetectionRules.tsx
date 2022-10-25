/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import {
  CriteriaWithPagination,
  EuiAccordion,
  EuiHorizontalRule,
  EuiInMemoryTable,
  EuiPanel,
  EuiTitle,
} from '@elastic/eui';
import { getRulesColumns } from './utils/constants';
import { RuleItemInfo, RuleItem, RulesInfoByType } from './types/interfaces';
import { RulesService } from '../../../../../../services';
import { RulesSharedState } from '../../../../../../models/interfaces';
import { ruleItemInfosToItems } from '../../../../../../utils/helpers';

interface DetectionRulesProps extends RouteComponentProps {
  enabledCustomRuleIds: Set<string>;
  enabledPrePackagedRuleIds: Set<string>;
  detectorType: string;
  rulesService: RulesService;
  pageIndex: number;
  onPrepackagedRulesChanged: (enabledRuleIds: string[]) => void;
  onCustomRulesChanged: (enabledRuleIds: string[]) => void;
  onRulesStateChange: (state: Partial<RulesSharedState>) => void;
}

interface DetectionRulesState {
  fieldTouched: boolean;
  selectedRuleType?: string;
  rulesByRuleType: RulesInfoByType;
}

export default class DetectionRules extends Component<DetectionRulesProps, DetectionRulesState> {
  constructor(props: DetectionRulesProps) {
    super(props);
    this.state = {
      fieldTouched: false,
      rulesByRuleType: {},
    };
  }

  async componentDidMount() {
    const {
      detectorType,
      enabledCustomRuleIds: enabledCustomRulesInfo,
      enabledPrePackagedRuleIds: enabledPrePackagedRulesInfo,
    } = this.props;
    const prePackagedRules = await this.getRules(
      true /* prePackaged */,
      enabledPrePackagedRulesInfo
    );
    const customRules = await this.getRules(false /* prePackaged */, enabledCustomRulesInfo);

    const allRules = prePackagedRules.concat(customRules);
    this.setState({
      rulesByRuleType: {
        [detectorType]: allRules,
      },
    });

    this.updateRulesSharedState(allRules);
  }

  async componentDidUpdate(prevProps: Readonly<DetectionRulesProps>) {
    const {
      detectorType,
      enabledCustomRuleIds: enabledCustomRulesInfo,
      enabledPrePackagedRuleIds: enabledPrePackagedRulesInfo,
    } = this.props;
    if (prevProps.detectorType !== detectorType) {
      const prePackagedRules = await this.getRules(
        true /* prePackaged */,
        enabledPrePackagedRulesInfo
      );
      const customRules = await this.getRules(false /* prePackaged */, enabledCustomRulesInfo);

      this.setState({
        rulesByRuleType: {
          [detectorType]: prePackagedRules.concat(customRules),
        },
      });

      this.props.onRulesStateChange({
        page: { index: 0 },
      });
    }
  }

  async getRules(prePackaged: boolean, enabledRuleIds: Set<string>): Promise<RuleItemInfo[]> {
    try {
      const { detectorType } = this.props;

      const rulesRes = await this.props.rulesService.getRules(prePackaged, {
        from: 0,
        size: 5000,
        query: {
          nested: {
            path: 'rule',
            query: {
              bool: {
                must: [{ match: { 'rule.category': `${detectorType}` } }],
              },
            },
          },
        },
      });

      if (rulesRes.ok) {
        const prePackagedRules: RuleItemInfo[] = rulesRes.response.hits.hits.map((ruleInfo) => {
          return {
            ...ruleInfo,
            enabled: enabledRuleIds.has(ruleInfo._id),
            prePackaged,
          };
        });

        return prePackagedRules;
      } else {
        return [];
      }
    } catch (error: any) {
      return [];
    }
  }

  onRuleTypeClick = (selectedRuleType?: string) => {
    this.setState({
      selectedRuleType,
    });
  };

  updateRulesSharedState(ruleItemsInfo: RuleItemInfo[]) {
    const rulesOptions: Pick<RulesSharedState, 'rulesOptions'>['rulesOptions'] = [];
    ruleItemsInfo.forEach((rule) => {
      if (rule.enabled) {
        rulesOptions.push({
          id: rule._id,
          name: rule._source.title,
          tags: rule._source.tags.map((tag) => tag.value),
        });
      }
    });
    this.props.onRulesStateChange({
      rulesOptions,
    });
  }

  onRuleActivationToggle = (changedItem: RuleItem, isActive: boolean) => {
    const ruleItemsInfo = this.state.rulesByRuleType[changedItem.logType];
    const newRuleItemsInfo = ruleItemsInfo.map((item) => {
      return {
        ...item,
        enabled: item._id === changedItem.id ? isActive : item.enabled,
      };
    });
    this.setState({
      rulesByRuleType: {
        [changedItem.logType]: newRuleItemsInfo,
      },
    });
    this.updateRulesSharedState(newRuleItemsInfo);
    const existingEnabledIds =
      changedItem.library === 'Default'
        ? this.props.enabledPrePackagedRuleIds
        : this.props.enabledCustomRuleIds;
    const newEnabledIds = this.getUpdatedEnabledRuleIds(
      existingEnabledIds,
      changedItem.id,
      isActive
    );
    if (newEnabledIds) {
      if (changedItem.library === 'Default') {
        this.props.onPrepackagedRulesChanged(newEnabledIds);
      } else if (changedItem.library === 'Custom') {
        this.props.onCustomRulesChanged(newEnabledIds);
      }
    }
  };

  getUpdatedEnabledRuleIds(existingEnabledIds: Set<string>, ruleId: string, isActive: boolean) {
    let newEnabledIds;
    // 1. not enabled previously
    const wasActive = existingEnabledIds.has(ruleId);
    if (wasActive && !isActive) {
      const clonedIds = new Set(existingEnabledIds);
      clonedIds.delete(ruleId);
      newEnabledIds = [...clonedIds];
    }
    // 2. enabled previously and now disabled
    else if (!wasActive && isActive) {
      const clonedIds = new Set(existingEnabledIds);
      clonedIds.add(ruleId);
      newEnabledIds = [...clonedIds];
    }

    return newEnabledIds;
  }

  onTableChange = (nextValues: CriteriaWithPagination<RuleItem>) => {
    this.props.onRulesStateChange({
      page: nextValues.page,
    });
  };

  render() {
    const { detectorType } = this.props;
    const ruleItems = ruleItemInfosToItems(detectorType, this.state.rulesByRuleType[detectorType]);
    let enabledRulesCount = 0;
    ruleItems.forEach((item) => {
      if (item.active) {
        enabledRulesCount++;
      }
    });

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
          <EuiInMemoryTable
            columns={getRulesColumns(this.onRuleActivationToggle)}
            items={ruleItems}
            itemId={(item: RuleItem) => `${item.name}`}
            pagination={{
              pageIndex: this.props.pageIndex,
            }}
            onTableChange={this.onTableChange}
          />
        </EuiAccordion>
      </EuiPanel>
    );
  }
}
