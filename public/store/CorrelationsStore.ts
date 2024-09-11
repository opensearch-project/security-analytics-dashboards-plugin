/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  AckCorrelationAlertsResponse,
  CorrelationFieldCondition,
  CorrelationFinding,
  CorrelationRule,
  CorrelationRuleQuery,
  DetectorHit,
  GetCorrelationAlertsResponse,
  ICorrelationsStore,
  IRulesStore,
} from '../../types';
import { DetectorsService, FindingsService, CorrelationService } from '../services';
import { NotificationsStart } from 'opensearch-dashboards/public';
import { errorNotificationToast } from '../utils/helpers';
import { DEFAULT_EMPTY_DATA } from '../utils/constants';
import { DataStore } from './DataStore';
import { RuleSource } from '../../server/models/interfaces';
import { RuleSeverityPriority, RuleSeverityValue } from '../pages/Rules/utils/constants';

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
    const response = await this.service.createCorrelationRule({
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
      trigger: correlationRule.trigger,
    });
    if (!response.ok) {
      errorNotificationToast(this.notifications, 'create', 'correlation rule', response.error);
      return false;
    }

    return response.ok;
  }

  public async updateCorrelationRule(correlationRule: CorrelationRule): Promise<boolean> {
    const response = await this.service.updateCorrelationRule(correlationRule.id, {
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
      trigger: correlationRule.trigger,
    });
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
        trigger: hit._source?.trigger
      };
    }

    return undefined;
  }

  public async getCorrelationRules(index?: string): Promise<CorrelationRule[]> {
    const response = await this.service.getCorrelationRules(index);

    if (response?.ok) {
      return response.response.hits.hits.map((hit) => {
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
          trigger: hit._source?.trigger
        };
      });
    }

    return [];
  }

  public async deleteCorrelationRule(ruleId: string): Promise<boolean> {
    const response = await this.service.deleteCorrelationRule(ruleId);

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

    const result: { finding1: CorrelationFinding; finding2: CorrelationFinding }[] = [];

    if (allCorrelationsRes.ok) {
      const firstTenGrandCorrelations = allCorrelationsRes.response.findings.slice(0, 10000);
      const allFindingIdsSet = new Set<string>();
      firstTenGrandCorrelations.forEach(({ finding1, finding2 }) => {
        allFindingIdsSet.add(finding1);
        allFindingIdsSet.add(finding2);
      });

      const allFindingIds = Array.from(allFindingIdsSet);
      let allFindings: { [id: string]: CorrelationFinding } = {};
      const maxFindingsFetchedInSingleCall = 10000;

      for (let i = 0; i < allFindingIds.length; i += maxFindingsFetchedInSingleCall) {
        const findingIds = allFindingIds.slice(i, i + maxFindingsFetchedInSingleCall);
        const findings = await this.fetchAllFindings(findingIds);
        allFindings = {
          ...allFindings,
          ...findings,
        };
      }

      const maxNumberOfCorrelationsDisplayed = 10000;
      allCorrelationsRes.response.findings
        .slice(0, maxNumberOfCorrelationsDisplayed)
        .forEach(({ finding1, finding2 }) => {
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

  private async fetchAllFindings(
    findingIds: string[]
  ): Promise<{ [id: string]: CorrelationFinding }> {
    const detectorsRes = await this.detectorsService.getDetectors();
    const allRules = await this.rulesStore.getAllRules();

    if (detectorsRes.ok) {
      const detectorsMap: { [id: string]: DetectorHit } = {};
      detectorsRes.response.hits.hits.forEach((detector) => {
        detectorsMap[detector._id] = detector;
      });
      let findingsMap: { [id: string]: CorrelationFinding } = {};
      const findings = await DataStore.findings.getFindingsByIds(findingIds);
      findings.forEach((f) => {
        const detector = detectorsMap[f.detectorId];
        const queryIds = f.queries.map((query) => query.id);
        const matchedRules = allRules.filter((rule) => queryIds.includes(rule._id));
        matchedRules.sort((a, b) => {
          return RuleSeverityPriority[a._source.level as RuleSeverityValue] <
            RuleSeverityPriority[b._source.level as RuleSeverityValue]
            ? -1
            : 1;
        });

        const rule = allRules.find((rule) => rule._id === matchedRules[0]?._id);

        findingsMap[f.id] = {
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
                tags: rule._source.tags,
              }
            : { name: DEFAULT_EMPTY_DATA, severity: DEFAULT_EMPTY_DATA },
        };
      });

      this.allFindings = findingsMap;
    }

    return this.allFindings;
  }

  public async getCorrelatedFindings(
    findingId: string,
    detector_type: string,
    nearby_findings = 20
  ): Promise<{ finding: CorrelationFinding; correlatedFindings: CorrelationFinding[] }> {
    const response = await this.service.getCorrelatedFindings(
      findingId,
      detector_type,
      nearby_findings
    );

    if (response?.ok) {
      const correlatedFindings: CorrelationFinding[] = [];
      const allFindingIds = response.response.findings.map((f) => f.finding);
      const allFindings = await this.fetchAllFindings([...allFindingIds, findingId]);
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
        finding: allFindings[findingId],
        correlatedFindings,
      };
    }

    const finding = (await DataStore.findings.getFindingsByIds([findingId]))[0];

    return {
      finding: {
        ...finding,
        id: findingId,
        logType: detector_type,
        timestamp: '',
        detectionRule: { name: '', severity: 'high' },
      },
      correlatedFindings: [],
    };
  }

  public async getAllCorrelationAlerts(): Promise<GetCorrelationAlertsResponse> {
    const response = await this.service.getCorrelationAlerts();
    if (response?.ok) {
      return {
        correlationAlerts: response.response.correlationAlerts,
        total_alerts: response.response.total_alerts,
      };
    } else {
      throw new Error('Failed to fetch correlated alerts');
    }
  }

  public async acknowledgeCorrelationAlerts(
    alertIds: string[]
  ): Promise<AckCorrelationAlertsResponse> {
    const response = await this.service.acknowledgeCorrelationAlerts(alertIds);
    if (response?.ok) {
      return {
        acknowledged: response.response.acknowledged,
        failed: response.response.failed,
      };
    } else {
      throw new Error('Failed to acknowledge correlated alerts');
    }
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
