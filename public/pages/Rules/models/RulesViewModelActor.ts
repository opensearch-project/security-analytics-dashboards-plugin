/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { load, safeDump } from 'js-yaml';
import { RuleInfo } from '../../../../server/models/interfaces';
import { BrowserServices } from '../../../models/interfaces';
import { RuleItemInfoBase } from './types';

export interface RulesViewModel {
  allRules: RuleItemInfoBase[];
}

export class RulesViewModelActor {
  private rulesViewModel: RulesViewModel;

  constructor(private readonly services: BrowserServices) {
    this.rulesViewModel = {
      allRules: [],
    };
  }

  public get allRules(): RuleInfo[] {
    return this.rulesViewModel.allRules;
  }

  public async fetchRules(): Promise<RuleItemInfoBase[]> {
    let prePackagedRules = await this.getRules(true);
    let customRules = await this.getRules(false);

    prePackagedRules = this.extractAndAddDetection(prePackagedRules);
    customRules = this.extractAndAddDetection(customRules);

    this.rulesViewModel.allRules = customRules.concat(prePackagedRules);

    return this.rulesViewModel.allRules;
  }

  private async getRules(prePackaged: boolean): Promise<RuleItemInfoBase[]> {
    const getRulesRes = await this.services.ruleService.getRules(prePackaged, {
      from: 0,
      size: 5000,
      query: {
        nested: {
          path: 'rule',
          query: {
            match_all: {},
          },
        },
      },
    });

    if (getRulesRes?.ok) {
      return getRulesRes.response.hits.hits.map((hit) => ({
        ...hit,
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
