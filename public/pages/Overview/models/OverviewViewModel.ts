/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserServices } from '../../../models/interfaces';
import { DetectorHit, RuleSource } from '../../../../server/models/interfaces';
import { AlertItem, FindingItem } from './interfaces';
import { RulesService } from '../../../services';
import { DEFAULT_EMPTY_DATA } from '../../../utils/constants';

export interface OverviewViewModel {
  detectors: DetectorHit[];
  findings: FindingItem[];
  alerts: AlertItem[];
}

export type OverviewViewModelRefreshHandler = (overviewState: OverviewViewModel) => void;

export class OverviewViewModelActor {
  private overviewViewModel: OverviewViewModel = {
    detectors: [],
    findings: [],
    alerts: [],
  };
  private refreshHandlers: OverviewViewModelRefreshHandler[] = [];
  private refreshState: 'InProgress' | 'Complete' = 'Complete';

  constructor(private services: BrowserServices | null) {}

  private async updateDetectors() {
    const res = await this.services?.detectorsService.getDetectors();
    if (res?.ok) {
      this.overviewViewModel.detectors = res.response.hits.hits;
    }
  }

  private async getRules(ruleIds: string[]): Promise<{ [id: string]: RuleSource }> {
    try {
      const rulesService = this.services?.ruleService as RulesService;
      const body = {
        from: 0,
        size: 5000,
        query: {
          nested: {
            path: 'rule',
            query: {
              terms: {
                _id: ruleIds,
              },
            },
          },
        },
      };

      const prePackagedResponse = await rulesService.getRules(true, body);
      const customResponse = await rulesService.getRules(false, body);

      const ruleById: { [id: string]: any } = {};
      if (prePackagedResponse.ok) {
        prePackagedResponse.response.hits.hits.forEach((hit) => (ruleById[hit._id] = hit._source));
      } else {
        console.error('Failed to retrieve pre-packaged rules:', prePackagedResponse.error);
      }
      if (customResponse.ok) {
        customResponse.response.hits.hits.forEach((hit) => (ruleById[hit._id] = hit._source));
      } else {
        console.error('Failed to retrieve custom rules:', customResponse.error);
        // TODO: Display toast with error details
      }

      return ruleById;
    } catch (error: any) {
      return {};
    }
  }

  private async updateFindings() {
    const detectorInfo = new Map<string, { logType: string; name: string }>();
    this.overviewViewModel.detectors.forEach((detector) => {
      detectorInfo.set(detector._id, {
        logType: detector._source.detector_type,
        name: detector._source.name,
      });
    });
    const detectorIds = detectorInfo.keys();
    let findingItems: FindingItem[] = [];
    const ruleIds = new Set<string>();

    for (let id of detectorIds) {
      const findingRes = await this.services?.findingsService.getFindings({ detectorId: id });

      if (findingRes?.ok) {
        const logType = detectorInfo.get(id)?.logType;
        const detectorName = detectorInfo.get(id)?.name || '';
        const detectorFindings: FindingItem[] = findingRes.response.findings.map((finding) => {
          ruleIds.add(finding.queries[0].id);
          // finding.queries.forEach((rule) => ruleIds.add(rule.id));

          return {
            detector: detectorName,
            findingName: finding.id,
            id: finding.id,
            time: finding.timestamp,
            logType: logType || '',
            ruleId: finding.queries[0].id,
            ruleName: '',
            ruleSeverity: '',
          };
        });
        findingItems = findingItems.concat(detectorFindings);
      }
    }

    const rulesRes = await this.getRules([...ruleIds]);
    findingItems = findingItems.map((item) => ({
      ...item,
      ruleName: rulesRes[item.ruleId]?.title || DEFAULT_EMPTY_DATA,
      ruleSeverity: rulesRes[item.ruleId]?.level || DEFAULT_EMPTY_DATA,
    }));

    this.overviewViewModel.findings = findingItems;
  }

  private async updateAlerts() {
    const detectorInfo = new Map<string, string>();
    this.overviewViewModel.detectors.forEach((detector) => {
      detectorInfo.set(detector._id, detector._source.detector_type);
    });
    const detectorIds = detectorInfo.keys();
    let alertItems: AlertItem[] = [];

    for (let id of detectorIds) {
      const alertsRes = await this.services?.alertService.getAlerts({ detector_id: id });

      if (alertsRes?.ok) {
        const logType = detectorInfo.get(id) as string;
        const detectorAlertItems: AlertItem[] = alertsRes.response.alerts.map((alert) => ({
          id: alert.id,
          severity: alert.severity,
          time: alert.last_notification_time,
          triggerName: alert.trigger_name,
          logType,
          acknowledged: !!alert.acknowledged_time,
        }));
        alertItems = alertItems.concat(detectorAlertItems);
      }
    }

    this.overviewViewModel.alerts = alertItems;
  }

  public getOverviewViewModel() {
    return this.overviewViewModel;
  }

  public registerRefreshHandler(handler: OverviewViewModelRefreshHandler) {
    this.refreshHandlers.push(handler);
  }

  public async onRefresh() {
    if (this.refreshState === 'InProgress') {
      return;
    }

    this.refreshState = 'InProgress';
    await this.updateDetectors();
    await this.updateFindings();
    await this.updateAlerts();

    this.refreshHandlers.forEach((handler) => {
      handler(this.overviewViewModel);
    });

    this.refreshState = 'Complete';
  }
}
