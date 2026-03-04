/*
 * Copyright Wazuh Inc.
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { RuleService } from '../services';
import { dump } from 'js-yaml';
import { RuleItemInfoBase, IRulesCache, Rule, IWazuhRulesStore } from '../../types/Rule';
import { NotificationsStart } from 'opensearch-dashboards/public';
import { errorNotificationToast } from '../utils/helpers';

/**
 * Class is used to make rule's API calls and cache the rules.
 * If there is a cache data requests are skipped and result is returned from the cache.
 * If cache is invalidated then the request is made to get a new set of data.
 *
 * @class RulesStore
 * @implements IRulesStore
 * @param {BrowserServices} services Uses services to make API requests
 */
export class RulesStore implements IWazuhRulesStore {
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
    this.invalidateCache();
    const [customRules, prePackagedRules] = await Promise.all([
      this.getCustomRules(terms),
      this.getPrePackagedRules(terms),
    ]);
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

    let query: object;
    if (terms?.['_id']) {
      query = { ids: { values: terms['_id'] } };
    } else if (terms?.['rule.category']) {
      const categories = terms['rule.category'].map((c) => c.toLowerCase());
      query = {
        bool: {
          should: [
            { terms: { 'document.logsource.category': categories } },
            { terms: { 'document.logsource.product': categories } },
          ],
          minimum_should_match: 1,
        },
      };
    } else {
      query = { match_all: {} };
    }

    const body = {
      from: 0,
      size: 5000,
      query,
    };

    const response = await this.service.getRules(prePackaged, body);

    if (response?.ok) {
      return (this.cache[cacheKey] = response.response.hits.hits.map((hit: any) =>
        this.mapToRuleItem(hit, prePackaged)
      ));
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
   * @param {string} integrationId
   * @returns {Promise<boolean>}
   */
  public createRule = async (rule: Rule, integrationId: string): Promise<boolean> => {
    const response = await this.invalidateCache().service.createRule({
      document: rule,
      integrationId,
    });
    if (!response.ok) {
      errorNotificationToast(this.notifications, 'create', 'rule', response.error);
    }

    return response.ok;
  };

  /**
   * Update a rule
   *
   * @param {string} id
   * @param {Rule} rule
   * @returns {Promise<boolean>}
   */
  public updateRule = async (id: string, rule: Rule): Promise<boolean> => {
    const response = await this.invalidateCache().service.updateRule(id, { document: rule });
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

  private normalizeSpace(space: unknown): string | undefined {
    if (!space) return undefined;
    if (typeof space === 'string') return space;
    if (typeof space === 'object') {
      const record = space as Record<string, unknown>;
      if (typeof record.name === 'string') return record.name;
      if (typeof record.id === 'string') return record.id;
      if (typeof record.value === 'string') return record.value;
    }
    return undefined;
  }

  public async searchRules(
    params: { query?: any; from?: number; size?: number; sort?: Array<Record<string, any>> },
    space: string
  ): Promise<{ total: number; items: RuleItemInfoBase[] }> {
    const body: any = {
      from: params.from ?? 0,
      size: params.size ?? 25,
      track_total_hits: true,
      query: params.query ?? { match_all: {} },
    };
    if (params.sort) body.sort = params.sort;

    const isStandard = space === 'standard';
    const response = await this.service.getRules(isStandard, body, space);

    if (!response?.ok) {
      if (!response?.error?.includes('index doesnt exist')) {
        errorNotificationToast(this.notifications, 'retrieve', 'rules', response?.error);
      }
      return { total: 0, items: [] };
    }

    const items = response.response.hits.hits.map((hit: any) =>
      this.mapToRuleItem(hit, isStandard)
    );
    const total = response.response.hits.total?.value ?? items.length;
    return { total, items };
  }

  private mapToRuleItem(hit: any, prePackaged: boolean): RuleItemInfoBase {
    const doc = hit._source?.document ?? {};
    const logsource = doc.logsource ?? {};

    return {
      ...hit,
      prePackaged,
      space: this.normalizeSpace(hit._source?.space),
      _source: {
        id: hit._id,
        title: doc.title ?? '',
        level: doc.level ?? '',
        category: logsource.category ?? logsource.product ?? logsource.service ?? '',
        description: doc.description ?? '',
        author: doc.author ?? '',
        status: doc.status ?? '',
        detection: doc.detection ? dump(doc.detection) : '',
        references: (doc.references ?? []).map((r: string) => ({ value: r })),
        tags: (doc.tags ?? []).map((t: string) => ({ value: t })),
        false_positives: (doc.falsepositives ?? []).map((fp: string) => ({ value: fp })),
        log_source: logsource,
        last_update_time: doc.modified ?? doc.date ?? '',
        rule: '',
        queries: [],
        query_field_names: [],
      },
    };
  }
}
