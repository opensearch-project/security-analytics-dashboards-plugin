/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  CorrelationFinding,
  CorrelationRule,
  CorrelationRuleHit,
  ICorrelationsStore,
  IRulesStore,
} from '../../types';
import { DetectorsService, FindingsService, CorrelationService } from '../services';
import { NotificationsStart } from 'opensearch-dashboards/public';
import { errorNotificationToast } from '../utils/helpers';
import { DEFAULT_EMPTY_DATA } from '../utils/constants';

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
      correlate: correlationRule.queries?.map((query) => ({
        index: query.index,
        category: query.logType,
        query: query.conditions
          .map((condition) => `${condition.name}:${condition.value}`)
          // TODO: for the phase one only AND condition is supported, add condition once the correlation engine support is implemented
          .join(' AND '),
      })),
    });

    if (!response.ok) {
      errorNotificationToast(this.notifications, 'create', 'correlation rule', response.error);
      return false;
    }

    return response.ok;
  }

  public async getCorrelationRules(index?: string): Promise<CorrelationRuleHit[]> {
    const response = await this.service.getCorrelationRules(index);

    if (response?.ok) {
      return response.response.hits.hits;
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
        const findingRes = await this.findingsService.getFindings({ detectorId: detector._id });

        if (findingRes.ok) {
          findingRes.response.findings.forEach((f) => {
            const rule = allRules.find((rule) => rule._id === f.queries[0].id);

            findings[f.id] = {
              ...f,
              id: f.id,
              logType: detector._source.detector_type,
              detector: detector,
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
        } else {
          this.allFindings = {};
        }
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
      const correlatedFindings = response.response.findings.map((f) => {
        return {
          ...allFindings[f.finding],
          correlationScore: Math.round(100 * f.score) / 100,
        };
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
}
