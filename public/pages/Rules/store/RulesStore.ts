import { RuleService } from '../../../services';
import { ruleTypes } from '../utils/constants';
import { load, safeDump } from 'js-yaml';
import { RuleItemInfoBase, IRulesStore, IRulesCache } from '../../../../types';
import { Rule } from '../../../../models/interfaces';
import { NotificationsStart } from 'opensearch-dashboards/public';
import { errorNotificationToast } from '../../../utils/helpers';

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
  cache: IRulesCache = {};

  /**
   * Invalidates all rules data
   */
  invalidateCache = () => {
    this.cache = {};
    return this;
  };

  /**
   * Returns all rules, custom and pre-packaged
   *
   * @method getAllRules
   * @param {{ [key: string]: string[] }} terms
   * @param {any} query
   * @param {boolean} invalidateCache
   * @returns {Promise<RuleItemInfoBase[]>}
   */
  public async getAllRules(
    terms?: { [key: string]: string[] },
    query?: any,
    invalidateCache: boolean = false
  ): Promise<RuleItemInfoBase[]> {
    let prePackagedRules = await this.getRules(true, terms, query, invalidateCache);
    let customRules = await this.getRules(false, terms, query, invalidateCache);

    prePackagedRules = this.validateAndAddDetection(prePackagedRules);
    customRules = this.validateAndAddDetection(customRules);

    return customRules.concat(prePackagedRules);
  }

  /**
   * Makes the request to get pre-packaged or custom rules
   * Pass `invalidateCache` to invalidate cache
   *
   * @param {boolean} prePackaged
   * @param {{ [key: string]: string[] }} terms
   * @param {any} query
   * @param {boolean} invalidateCache
   * @returns {Promise<RuleItemInfoBase[]>}
   */
  async getRules(
    prePackaged: boolean,
    terms?: { [key: string]: string[] },
    query?: any,
    invalidateCache: boolean = false
  ): Promise<RuleItemInfoBase[]> {
    const cacheKey: string = `getRules:${JSON.stringify(arguments)}`;
    if (this.cache[cacheKey] && !invalidateCache) {
      return this.cache[cacheKey];
    }

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
      return (this.cache[cacheKey] = getRulesRes.response.hits.hits.map((hit) => ({
        ...hit,
        _source: {
          ...hit._source,
          prePackaged,
        },
        prePackaged,
      })));
    }

    return [];
  }

  /**
   * Create a new rule
   *
   * @param {Rule} rule
   * @returns {Promise<boolean>}
   */
  createRule = async (rule: Rule): Promise<boolean> => {
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
  updateRule = async (id: string, category: string, rule: Rule): Promise<boolean> => {
    const response = await this.invalidateCache().service.updateRule(id, category, rule);
    if (!response.ok) {
      errorNotificationToast(this.notifications, 'update', 'rule', response.error);
    }

    return response.ok;
  };

  /**
   * Validates and adds detection yaml to rule items
   *
   * @param {RuleItemInfoBase[]} rules
   * @returns {RuleItemInfoBase[]}
   */
  validateAndAddDetection(rules: RuleItemInfoBase[]): RuleItemInfoBase[] {
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
