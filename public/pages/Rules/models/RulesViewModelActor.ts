/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { load, safeDump } from 'js-yaml';
import { RuleInfo } from '../../../../server/models/interfaces';
import { RuleItemInfoBase } from './types';
import { RuleService } from '../../../services';
import { ruleTypes } from '../utils/constants';

export interface RulesViewModel {
  allRules: RuleItemInfoBase[];
}

export class RulesViewModelActor {
  private rulesViewModel: RulesViewModel;

  constructor(private readonly service: RuleService) {
    this.rulesViewModel = {
      allRules: [],
    };
  }

  public get allRules(): RuleInfo[] {
    return this.rulesViewModel.allRules;
  }

  public async fetchRules(
    terms?: { [key: string]: string[] },
    query?: any
  ): Promise<RuleItemInfoBase[]> {
    let prePackagedRules = await this.getRules(true, terms, query);
    let customRules = await this.getRules(false, terms, query);

    prePackagedRules = this.extractAndAddDetection(prePackagedRules);
    customRules = this.extractAndAddDetection(customRules);
    this.rulesViewModel.allRules = customRules.concat(prePackagedRules);

    return this.rulesViewModel.allRules;
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
