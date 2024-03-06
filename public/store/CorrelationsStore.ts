/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  CorrelationFieldCondition,
  CorrelationFinding,
  CorrelationRule,
  CorrelationRuleQuery,
  ICorrelationsStore,
  IRulesStore,
} from '../../types';
import { DetectorsService, FindingsService, CorrelationService } from '../services';
import { NotificationsStart } from 'opensearch-dashboards/public';
import { errorNotificationToast } from '../utils/helpers';
import { DEFAULT_EMPTY_DATA } from '../utils/constants';
import { DataStore } from './DataStore';

export interface ICorrelationsCache {
  [key: string]: CorrelationRule[];
}

export class CorrelationsStore implements ICorrelationsStore {
  /**
   * Correlation rules service instance
   *
   * @property {CorrelationService} service
   * @readonly
   */
  readonly service: CorrelationService;
  readonly detectorsService: DetectorsService;
  readonly findingsService: FindingsService;

  /**
   * Notifications
   * @property {NotificationsStart}
   * @readonly
   */
  readonly notifications: NotificationsStart;

  /**
   * Keeps rule's data cached
   *
   * @property {ICorrelationsCache} cache
   */
  private cache: ICorrelationsCache = {};

  /**
   * Invalidates all rules data
   */
  private invalidateCache = () => {
    this.cache = {};
    return this;
  };

  constructor(
    service: CorrelationService,
    detectorsService: DetectorsService,
    findingsService: FindingsService,
    notifications: NotificationsStart,
    private rulesStore: IRulesStore
  ) {
    this.service = service;
    this.notifications = notifications;
    this.detectorsService = detectorsService;
    this.findingsService = findingsService;
  }

  public async createCorrelationRule(correlationRule: CorrelationRule): Promise<boolean> {
    const response = await this.invalidateCache().service.createCorrelationRule({
      name: correlationRule.name,
      time_window: correlationRule.time_window,
      correlate: correlationRule.queries?.map((query) => {
        const queryString = query.conditions
          .map((condition) => `${condition.name}:${condition.value}`)
          // TODO: for the phase one only AND condition is supported, add condition once the correlation engine support is implemented
          .join(' AND ');

        const correlationInput: any = {
          index: query.index,
          category: query.logType,
        };

        if (queryString) {
          correlationInput['query'] = queryString;
        }

        if (query.field) {
          correlationInput['field'] = query.field;
        }

        return correlationInput;
      }),
    });

    if (!response.ok) {
      errorNotificationToast(this.notifications, 'create', 'correlation rule', response.error);
      return false;
    }

    return response.ok;
  }

  public async updateCorrelationRule(correlationRule: CorrelationRule): Promise<boolean> {
    const response = await this.invalidateCache().service.updateCorrelationRule(
      correlationRule.id,
      {
        name: correlationRule.name,
        time_window: correlationRule.time_window,
        correlate: correlationRule.queries?.map((query) => {
          const queryString = query.conditions
            .map((condition) => `${condition.name}:${condition.value}`)
            .join(' AND ');

          const correlationInput: any = {
            index: query.index,
            category: query.logType,
          };

          if (queryString) {
            correlationInput['query'] = queryString;
          }

          if (query.field) {
            correlationInput['field'] = query.field;
          }

          return correlationInput;
        }),
      }
    );

    if (!response.ok) {
      errorNotificationToast(this.notifications, 'update', 'correlation rule', response.error);
      return false;
    }

    return response.ok;
  }

  public async getCorrelationRule(id: string): Promise<CorrelationRule | undefined> {
    const response = await this.service.getCorrelationRules(undefined, {
      terms: {
        _id: [id],
      },
    });

    if (response?.ok && response.response.hits.hits[0]) {
      const hit = response.response.hits.hits[0];

      const queries: CorrelationRuleQuery[] = hit._source.correlate.map((queryData) => {
        return {
          index: queryData.index,
          logType: queryData.category,
          field: queryData.field || '',
          conditions: this.parseRuleQueryString(queryData.query),
        };
      });

      return {
        id: hit._id,
        name: hit._source.name,
        time_window: hit._source.time_window || 300000,
        queries,
      };
    }

    return undefined;
  }

  public async getCorrelationRules(index?: string): Promise<CorrelationRule[]> {
    const cacheKey: string = `getCorrelationRules:${JSON.stringify(arguments)}`;

    if (this.cache[cacheKey]) {
      return this.cache[cacheKey];
    }

    const response = await this.service.getCorrelationRules(index);

    if (response?.ok) {
      return (this.cache[cacheKey] = response.response.hits.hits.map((hit) => {
        const queries: CorrelationRuleQuery[] = hit._source.correlate.map((queryData) => {
          return {
            index: queryData.index,
            logType: queryData.category,
            field: queryData.field || '',
            conditions: this.parseRuleQueryString(queryData.query),
          };
        });

        return {
          id: hit._id,
          name: hit._source.name,
          time_window: hit._source.time_window || 300000,
          queries,
        };
      }));
    }

    return [];
  }

  public async deleteCorrelationRule(ruleId: string): Promise<boolean> {
    const response = await this.invalidateCache().service.deleteCorrelationRule(ruleId);

    if (!response.ok) {
      errorNotificationToast(this.notifications, 'delete', 'correlation rule', response.error);
    }

    return response.ok;
  }

  public async getAllCorrelationsInWindow(
    start_time: string,
    end_time: string
  ): Promise<{ finding1: CorrelationFinding; finding2: CorrelationFinding }[]> {
    const allCorrelationsRes = await this.service.getAllCorrelationsInTimeWindow(
      start_time,
      end_time
    );
    const allFindings = await this.fetchAllFindings();

    const result: { finding1: CorrelationFinding; finding2: CorrelationFinding }[] = [];

    if (allCorrelationsRes.ok) {
      allCorrelationsRes.response.findings.forEach(({ finding1, finding2 }) => {
        const f1 = allFindings[finding1];
        const f2 = allFindings[finding2];
        if (f1 && f2)
          result.push({
            finding1: {
              ...f1,
            },
            finding2: {
              ...f2,
            },
          });
      });

      return result;
    }

    return [];
  }

  public allFindings: { [id: string]: CorrelationFinding } = {};

  public async fetchAllFindings(): Promise<{ [id: string]: CorrelationFinding }> {
    const detectorsRes = await this.detectorsService.getDetectors();
    const allRules = await this.rulesStore.getAllRules();

    if (detectorsRes.ok) {
      const detectors = detectorsRes.response.hits.hits;
      let findings: { [id: string]: CorrelationFinding } = {};
      for (let detector of detectors) {
        const detectorFindings = await DataStore.findings.getFindingsPerDetector(detector._id);
        detectorFindings.forEach((f) => {
          const rule = allRules.find((rule) => rule._id === f.queries[0].id);
          findings[f.id] = {
            ...f,
            id: f.id,
            logType: detector._source.detector_type,
            detector: detector,
            detectorName: detector._source.name,
            timestamp: new Date(f.timestamp).toLocaleString(),
            detectionRule: rule
              ? {
                  name: rule._source.title,
                  severity: rule._source.level,
                }
              : { name: DEFAULT_EMPTY_DATA, severity: DEFAULT_EMPTY_DATA },
          };
        });

        this.allFindings = findings;
      }
    }

    return this.allFindings;
  }

  public async getCorrelatedFindings(
    finding: string,
    detector_type: string,
    nearby_findings = 20
  ): Promise<{ finding: CorrelationFinding; correlatedFindings: CorrelationFinding[] }> {
    const allFindings = await this.fetchAllFindings();
    const response = await this.service.getCorrelatedFindings(
      finding,
      detector_type,
      nearby_findings
    );

    if (response?.ok) {
      const correlatedFindings: CorrelationFinding[] = [];
      response.response.findings.forEach((f) => {
        if (allFindings[f.finding]) {
          correlatedFindings.push({
            ...allFindings[f.finding],
            correlationScore: f.score < 0.01 ? '0.01' : f.score.toFixed(2),
            rules: f.rules,
          });
        }
      });

      return {
        finding: allFindings[finding],
        correlatedFindings,
      };
    }

    return {
      finding: {
        ...allFindings[finding],
        id: finding,
        logType: detector_type,
        timestamp: '',
        detectionRule: { name: '', severity: 'high' },
      },
      correlatedFindings: [],
    };
  }

  private parseRuleQueryString(queryString: string): CorrelationFieldCondition[] {
    const queries: CorrelationFieldCondition[] = [];
    if (!queryString) {
      return queries;
    }
    const orConditions = queryString.trim().split(/ OR /gi);

    orConditions.forEach((cond, conditionIndex) => {
      cond.split(/ AND /gi).forEach((fieldInfo: string, index: number) => {
        const s = fieldInfo.match(/(?:\\:|[^:])+/g);
        if (s) {
          const [name, value] = s;
          queries.push({
            name,
            value,
            condition: index === 0 && conditionIndex !== 0 ? 'OR' : 'AND',
          });
        }
      });
    });

    return queries;
  }
}
