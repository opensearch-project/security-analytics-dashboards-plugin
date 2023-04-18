/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  CorrelationFinding,
  CorrelationGraphEventHandler,
  CorrelationRule,
  CorrelationRuleHit,
  ICorrelationsStore,
} from '../../types';
import { DETECTOR_TYPES } from '../pages/Detectors/utils/constants';
import 'font-awesome/css/font-awesome.min.css';
import { iconByLogType } from '../pages/Correlations/utils/constants';
import { DetectorsService, FindingsService } from '../services';
import { ruleSeverity, ruleTypes } from '../pages/Rules/utils/constants';
import CorrelationService from '../services/CorrelationService';
import { NotificationsStart } from 'opensearch-dashboards/public';
import { errorNotificationToast } from '../utils/helpers';
import { FindingItemType } from '../pages/Findings/containers/Findings/Findings';
import { DetectorService } from '../../server/services';

class DummyCorrelationDataProvider {
  private generatedPairs: Set<string> = new Set();
  private severities: ('Critical' | 'Medium' | 'Info' | 'Low')[] = [
    'Critical',
    'Medium',
    'Info',
    'Low',
  ];

  public generateDummyFindings() {
    const now = new Date();
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(now.getDate() - 3);
    const startTime = threeDaysAgo.getTime();
    const diff = now.getTime() - startTime;

    // const eachLogtypeCount = {};
    const findings: { [id: string]: CorrelationFinding } = {};
    Object.values(DETECTOR_TYPES).forEach((type) => {
      const findingCount = Math.ceil(15 * Math.random());
      for (let i = 1; i <= findingCount; i++) {
        const id = `${type.id}-${i}`;
        // const id = `${type.id.charAt(0)}${type.id.charAt(type.id.length - 1)}-${i}`;
        findings[id] = {
          logType: type.id,
          timestamp: new Date(startTime + Math.floor(Math.random() * diff)).toLocaleString(),
          id,
          correlationScore: Math.round(Math.random() * 100) / 100,
          // name: id,
          detectionRule: {
            name: 'Sample rule',
            severity: this.severities[Math.floor(Math.random() * 4)],
          },
        };
      }
    });

    return findings;
  }

  public generateDummyCorrelations(findings: { [id: string]: { logType: string } }) {
    this.generatedPairs = new Set();
    const findingIds = Object.keys(findings);
    const totalFindings = findingIds.length;
    const correlations: { [finding: string]: string[] } = {};
    let correlationCount = 0;

    while (correlationCount < 150) {
      while (true) {
        const pair = this.getNextPair(totalFindings);

        const f1 = findingIds[pair[0]];
        const f2 = findingIds[pair[1]];

        if (findings[f1].logType === findings[f2].logType) {
          continue;
        }

        if (!correlations[f1]) {
          correlations[f1] = [];
        }

        correlations[f1].push(f2);

        if (!correlations[f2]) {
          correlations[f2] = [];
        }

        correlations[f2].push(f1);

        break;
      }

      correlationCount++;
    }

    return correlations;
  }

  private getNextPair(max: number) {
    let next = this.generatePair(max);
    while (this.generatedPairs.has(next)) {
      next = this.generatePair(max);
    }
    this.generatedPairs.add(next);

    const pairIdx = next.split('-');

    return [Number.parseInt(pairIdx[0]), Number.parseInt(pairIdx[1])];
  }

  private generatePair(max: number) {
    const idx1 = Math.floor(Math.random() * max);
    const idx2 = Math.floor(Math.random() * max);

    const small = idx1 < idx2 ? idx1 : idx2;
    const big = idx1 > idx2 ? idx1 : idx2;
    const pair = `${small}-${big}`;

    return pair;
  }
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

  private graphEventHandlers: { [event: string]: CorrelationGraphEventHandler[] } = {};
  public findings;
  private allCorrelations: { [finding: string]: string[] };
  public correlations: { [finding: string]: string[] };

  constructor(
    service: CorrelationService,
    detectorsService: DetectorService,
    findingsService: FindingsService,
    notifications: NotificationsStart
  ) {
    this.service = service;
    this.notifications = notifications;
    this.detectorsService = detectorsService;
    this.findingsService = findingsService;

    const dataProvider = new DummyCorrelationDataProvider();
    this.findings = dataProvider.generateDummyFindings();
    this.allCorrelations = dataProvider.generateDummyCorrelations(this.findings);
    this.correlations = this.allCorrelations;
  }

  public registerGraphEventHandler(event: string, handler: CorrelationGraphEventHandler): void {
    this.graphEventHandlers[event] = this.graphEventHandlers[event] || [];
    this.graphEventHandlers[event].push(handler);
  }

  public async createCorrelationRule(correlationRule: CorrelationRule): Promise<boolean> {
    const response = await this.service.createCorrelationRule({
      name: correlationRule.name,
      correlate: correlationRule.queries?.map((query) => ({
        index: query.index,
        category: query.logType,
        query: query.conditions
          .map((condition) => `${condition.name}:${condition.value}`)
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

  public getAllCorrelationsInWindow(
    timeWindow?: any
  ): { finding1: CorrelationFinding; finding2: CorrelationFinding }[] {
    return {};
  }

  public allFindings: { [id: string]: CorrelationFinding } = {};

  public async fetchAllFindings(): { [id: string]: CorrelationFinding } {
    const detectorsRes = await this.detectorsService.getDetectors();
    if (detectorsRes.ok) {
      const detectors = detectorsRes.response.hits.hits;
      const ruleIds = new Set<string>();
      let findings: FindingItemType[] = [];

      for (let detector of detectors) {
        const findingRes = await this.findingsService.getFindings({ detectorId: detector._id });

        if (findingRes.ok) {
          findingRes.response.findings.map((finding) => {
            finding.queries.forEach((rule) => ruleIds.add(rule.id));
            findings = Object.assign(findings, {
              [finding.id]: {
                ...finding,
                detector: detector,
              },
            });
          });
        } else {
          this.allFindings = {};
        }
      }

      this.allFindings = findings;
    }

    this.allFindings = {};
  }

  public async getCorrelatedFindings(
    finding: string,
    detector_type: string,
    nearby_findings = 20
  ): Promise<CorrelationFinding[]> {
    const response = await this.service.getCorrelatedFindings(
      finding,
      detector_type,
      nearby_findings
    );

    if (response?.ok) {
      return response.response.findings;
    }

    return [];
  /*
  public getAllFindings(): { [id: string]: CorrelationFinding } {
    return {};
  }

  public getAllCorrelationsInWindow(
    timeWindow?: any
  ): { finding1: CorrelationFinding; finding2: CorrelationFinding }[] {
    const idx = Math.floor(Math.random() * 13);
    const idx2 = Math.floor(Math.random() * ruleSeverity.length);
    return Array(30)
      .fill(undefined)
      .map((_, index) => {
        return {
          finding1: {
            id: `f1-${index}`,
            logType: ruleTypes[idx].value,
            timestamp: 'April 24 2023',
            detectionRule: {
              name: 'Sample rule name',
              severity: ruleSeverity[(idx2 + 1) % ruleSeverity.length].value,
            },
            correlationScore: Math.round(Math.random() * 100) / 100,
          },
          finding2: {
            id: `f2-${index}`,
            logType: ruleTypes[(idx + 1) % 13].value,
            timestamp: 'April 24 2023',
            detectionRule: {
              name: 'Sample rule name',
              severity: ruleSeverity[idx2].value,
            },
            correlationScore: Math.round(Math.random() * 100) / 100,
          },
        };
      });

    // return [
    //   {
    //     finding1: {
    //       id: 'dummy id 1',
    //       logType: 'dns',
    //       timestamp: 'April 24 2023',
    //       detectionRule: {
    //         name: 'Sample rule name',
    //         severity: 'critical',
    //       },
    //       correlationScore: Math.round(Math.random() * 100) / 100,
    //     },
    //     finding2: {
    //       id: 'dummy id 2',
    //       logType: 'network',
    //       timestamp: 'April 24 2023',
    //       detectionRule: {
    //         name: 'Sample rule name',
    //         severity: 'critical',
    //       },
    //       correlationScore: Math.round(Math.random() * 100) / 100,
    //     }
    //   }
    // ];
  }

  public getCorrelatedFindings(
    findingId: string
  ): { finding: CorrelationFinding; correlatedFindings: CorrelationFinding[] } {
    return {
      finding: {
        id: 'dummy id',
        logType: 'dns',
        timestamp: 'April 24 2023',
        detectionRule: {
          name: 'Sample rule name',
          severity: 'critical',
        },
        correlationScore: Math.round(Math.random() * 100) / 100,
      },
      correlatedFindings: [
        {
          id: 'dummy id',
          logType: 'dns',
          timestamp: 'April 24 2023',
          detectionRule: {
            name: 'Sample rule name',
            severity: 'informational',
          },
          correlationScore: Math.round(Math.random() * 100) / 100,
        },
      ],
    };
  }

  public allFindings: { [id: string]: CorrelationFinding } = {};

  public fetchAllFindings(): { [id: string]: CorrelationFinding } {
    return {};
  */
  }
}
