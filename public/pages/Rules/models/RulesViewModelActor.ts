/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { load, safeDump } from 'js-yaml';
import {
  GetAllRuleCategoriesResponse,
  RuleCategory,
  RuleInfo,
} from '../../../../server/models/interfaces';
import { RuleItemInfoBase } from './types';
import { RuleService } from '../../../services';
import { ruleTypes } from '../utils/constants';
import { setRuleTypes } from '../utils/helpers';

export interface RulesViewModel {
  allRules: RuleItemInfoBase[];
}

export class RulesViewModelActor {
  private rulesViewModel: RulesViewModel;
  private allRuleCategories: RuleCategory[] = [];
  private initRuleCategoriesPromise;
  public static instance: RulesViewModelActor | undefined = undefined;

  constructor(private readonly service: RuleService) {
    this.rulesViewModel = {
      allRules: [],
    };
    this.initRuleCategoriesPromise = this.initRuleCategories();
  }

  public get allRules(): RuleInfo[] {
    return this.rulesViewModel.allRules;
  }

  public static setupRulesViewModelActor(service: RuleService): RulesViewModelActor {
    if (!this.instance) {
      this.instance = new RulesViewModelActor(service);
    }

    return this.instance;
  }

  public async fetchRules(
    terms?: { [key: string]: string[] },
    query?: any
  ): Promise<RuleItemInfoBase[]> {
    await this.initRuleCategoriesPromise;
    let prePackagedRules = await this.getRules(true, terms, query);
    let customRules = await this.getRules(false, terms, query);

    prePackagedRules = this.extractAndAddDetection(prePackagedRules);
    customRules = this.extractAndAddDetection(customRules);
    this.rulesViewModel.allRules = customRules.concat(prePackagedRules);

    return this.rulesViewModel.allRules;
  }

  public async getAllRuleCategories(): Promise<GetAllRuleCategoriesResponse['rule_categories']> {
    const allRuleCategories = await this.service.getAllRuleCategories();

    if (allRuleCategories.ok) {
      return allRuleCategories.response.rule_categories;
    }

    return [];
  }

  private async initRuleCategories() {
    this.allRuleCategories = await this.getAllRuleCategories();
    setRuleTypes(this.allRuleCategories);
  }

  private async getRules(
    prePackaged: boolean,
    terms?: {
      [key: string]: string[];
    },
    query?: any
  ): Promise<RuleItemInfoBase[]> {
    const getRulesRes = await this.service.getRules(prePackaged, {
      from: 0,
      size: 5000,
      query: {
        nested: {
          path: 'rule',
          query: query || {
            terms: terms
              ? terms
              : {
                  'rule.category': ruleTypes,
                },
          },
        },
      },
    });

    if (getRulesRes?.ok) {
      return getRulesRes.response.hits.hits.map((hit) => ({
        ...hit,
        _source: {
          ...hit._source,
          prePackaged,
        },
        prePackaged,
      }));
    }

    return [];
  }

  private extractAndAddDetection(rules: RuleItemInfoBase[]): RuleItemInfoBase[] {
    return rules.map((ruleInfo) => {
      let detectionYaml = '';

      try {
        const detectionJson = load(ruleInfo._source.rule).detection;
        detectionYaml = safeDump(detectionJson);
      } catch (_error: any) {}

      return {
        ...ruleInfo,
        _source: {
          ...ruleInfo._source,
          detection: detectionYaml,
        },
      };
    });
  }
}
