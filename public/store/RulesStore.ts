/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { RuleService } from '../services';
import { load, safeDump } from 'js-yaml';
import { RuleItemInfoBase, IRulesStore, IRulesCache } from '../../types';
import { Rule } from '../../models/interfaces';
import { NotificationsStart } from 'opensearch-dashboards/public';
import { errorNotificationToast } from '../utils/helpers';
import { ruleTypes } from '../pages/Rules/utils/constants';
import _ from 'lodash';

/**
 * Class is used to make rule's API calls and cache the rules.
 * If there is a cache data requests are skipped and result is returned from the cache.
 * If cache is invalidated then the request is made to get a new set of data.
 *
 * @class RulesStore
 * @implements IRulesStore
 * @param {BrowserServices} services Uses services to make API requests
 */
export class RulesStore implements IRulesStore {
  /**
   * Rule service instance
   *
   * @property {RuleService} service
   * @readonly
   */
  readonly service: RuleService;

  /**
   * Notifications
   * @property {NotificationsStart}
   * @readonly
   */
  readonly notifications: NotificationsStart;

  constructor(service: RuleService, notifications: NotificationsStart) {
    this.service = service;
    this.notifications = notifications;
  }

  /**
   * Keeps rule's data cached
   *
   * @property {IRulesCache} cache
   */
  private cache: IRulesCache = {};

  /**
   * Invalidates all rules data
   */
  private invalidateCache = () => {
    this.cache = {};
    return this;
  };

  /**
   * Returns all rules, custom and pre-packaged
   *
   * @method getAllRules
   * @param {terms?: { [key: string]: string[] }} [terms]
   * @returns {Promise<RuleItemInfoBase[]>}
   */
  public async getAllRules(terms?: { [key: string]: string[] }): Promise<RuleItemInfoBase[]> {
    let customRules = await this.getCustomRules(terms);
    let prePackagedRules = await this.getPrePackagedRules(terms);

    prePackagedRules = this.validateAndAddDetection(prePackagedRules);
    customRules = this.validateAndAddDetection(customRules);

    return customRules.concat(prePackagedRules);
  }

  /**
   * Returns only pre-packaged rules
   * @param {{[p: string]: string[]}} terms
   * @returns {Promise<RuleItemInfoBase[]>}
   */
  public async getPrePackagedRules(terms?: { [key: string]: string[] }) {
    return this.getRules(true, terms);
  }

  /**
   * Returns only custom rules
   * @param {{[p: string]: string[]}} terms
   * @returns {Promise<RuleItemInfoBase[]>}
   */
  public async getCustomRules(terms?: { [key: string]: string[] }) {
    return this.getRules(false, terms);
  }

  /**
   * Makes the request to get pre-packaged or custom rules
   *
   * @param {boolean} prePackaged
   * @param {terms?: { [key: string]: string[] }} terms
   * @returns {Promise<RuleItemInfoBase[]>}
   */
  public async getRules(
    prePackaged: boolean,
    terms?: { [key: string]: string[] }
  ): Promise<RuleItemInfoBase[]> {
    const cacheKey: string = `getRules:${JSON.stringify(arguments)}`;

    if (this.cache[cacheKey]) {
      return this.cache[cacheKey];
    }

    if (!terms) {
      terms = {
        'rule.category': _.map(ruleTypes, 'value'),
      };
    }

    const body = {
      from: 0,
      size: 5000,
      query: {
        nested: {
          path: 'rule',
          query: {
            terms: { ...terms },
          },
        },
      },
    };

    const response = await this.service.getRules(prePackaged, body);

    if (response?.ok) {
      return (this.cache[cacheKey] = response.response.hits.hits.map((hit) => ({
        ...hit,
        _source: {
          ...hit._source,
          prePackaged,
        },
        prePackaged,
      })));
    } else {
      if (!response.error?.includes('index doesnt exist')) {
        errorNotificationToast(this.notifications, 'retrieve', 'rules', response.error);
      }
    }

    return [];
  }

  /**
   * Create a new rule
   *
   * @param {Rule} rule
   * @returns {Promise<boolean>}
   */
  public createRule = async (rule: Rule): Promise<boolean> => {
    const response = await this.invalidateCache().service.createRule(rule);
    if (!response.ok) {
      errorNotificationToast(this.notifications, 'create', 'rule', response.error);
    }

    return response.ok;
  };

  /**
   * Update a rule
   *
   * @param {string} id
   * @param {string} category
   * @param {Rule} rule
   * @returns {Promise<boolean>}
   */
  public updateRule = async (id: string, category: string, rule: Rule): Promise<boolean> => {
    const response = await this.invalidateCache().service.updateRule(id, category, rule);
    if (!response.ok) {
      errorNotificationToast(this.notifications, 'update', 'rule', response.error);
    }

    return response.ok;
  };

  /**
   * Update a rule
   *
   * @param {string} id
   * @returns {Promise<boolean>}
   */
  public deleteRule = async (id: string): Promise<boolean> => {
    const response = await this.invalidateCache().service.deleteRule(id);
    if (!response.ok) {
      errorNotificationToast(this.notifications, 'delete', 'rule', response.error);
    }

    return response.ok;
  };

  /**
   * Validates and adds detection yaml to rule items
   *
   * @param {RuleItemInfoBase[]} rules
   * @returns {RuleItemInfoBase[]}
   */
  private validateAndAddDetection(rules: RuleItemInfoBase[]): RuleItemInfoBase[] {
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
