/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserServices } from '../../../models/interfaces';
import { RuleSource } from '../../../../server/models/interfaces';
import { DEFAULT_DATE_RANGE, DEFAULT_EMPTY_DATA } from '../../../utils/constants';
import { NotificationsStart } from 'opensearch-dashboards/public';
import { errorNotificationToast, getDuration, isThreatIntelQuery } from '../../../utils/helpers';
import dateMath from '@elastic/datemath';
import moment from 'moment';
import { DataStore } from '../../../store/DataStore';
import { THREAT_INTEL_ENABLED } from '../../../utils/constants';
import {
  DetectorHit,
  Finding,
  // Wazuh: hide alerts and correlations in overview view model.
  // OverviewAlertItem,
  OverviewFindingItem,
  OverviewViewModel,
  OverviewViewModelRefreshHandler,
  ThreatIntelFinding,
} from '../../../../types';

export class OverviewViewModelActor {
  private overviewViewModel: OverviewViewModel = {
    detectors: [],
    findings: [],
    // Wazuh: hide alerts and correlations in overview view model.
    // alerts: [],
    threatIntelFindings: [],
    // Wazuh: hide alerts and correlations in overview view model.
    // correlations: 0,
  };
  private partialUpdateHandlers: OverviewViewModelRefreshHandler[] = [];
  private fullUpdateHandlers: OverviewViewModelRefreshHandler[] = [];
  private refreshState: 'InProgress' | 'Complete' = 'Complete';

  constructor(
    private services: BrowserServices | undefined,
    private notifications: NotificationsStart | null
  ) {}

  private async updateDetectors() {
    const res = await this.services?.detectorsService.getDetectors();
    if (res?.ok) {
      this.overviewViewModel.detectors = res.response.hits.hits;
    } else if (!res?.error.includes('no such index')) {
      errorNotificationToast(this.notifications, 'retrieve', 'detectors', res?.error);
    }
  }

  private async getRules(ruleIds: string[]): Promise<{ [id: string]: RuleSource }> {
    try {
      const terms = {
        _id: ruleIds,
      };

      const customResponse = await DataStore.rules.getCustomRules(terms);
      const prePackagedResponse = await DataStore.rules.getPrePackagedRules(terms);

      const ruleById: { [id: string]: any } = {};
      prePackagedResponse.forEach((hit) => (ruleById[hit._id] = hit._source));
      customResponse.forEach((hit) => (ruleById[hit._id] = hit._source));

      return ruleById;
    } catch (error: any) {
      errorNotificationToast(this.notifications, 'retrieve', 'rules', error);
      return {};
    }
  }

  private async updateFindings(signal: AbortSignal) {
    const detectorInfo = new Map<
      string,
      { logType: string; name: string; detectorHit: DetectorHit }
    >();
    this.overviewViewModel.detectors.forEach((detectorHit) => {
      detectorInfo.set(detectorHit._id, {
        logType: detectorHit._source.detector_type,
        name: detectorHit._source.name,
        detectorHit,
      });
    });
    const detectorIds = detectorInfo.keys();
    let findingItems: OverviewFindingItem[] = [];
    const ruleIds = new Set<string>();
    const duration = getDuration({
      startTime: this.startTime,
      endTime: this.endTime,
    });

    try {
      for (let id of detectorIds) {
        let detectorFindings: Finding[] = await DataStore.findings.getFindingsPerDetector(
          id,
          detectorInfo.get(id)!.detectorHit,
          signal,
          duration
        );
        const logType = detectorInfo.get(id)?.logType;
        const detectorName = detectorInfo.get(id)?.name || '';
        const detectorFindingItems: OverviewFindingItem[] = detectorFindings.map((finding) => {
          const ruleQueries = finding.queries.filter(({ id }) => !isThreatIntelQuery(id));
          const ids = ruleQueries.map((query) => query.id);
          ids.forEach((id) => ruleIds.add(id));

          const findingTime = new Date(finding.timestamp);
          findingTime.setMilliseconds(0);
          findingTime.setSeconds(0);
          return {
            detector: detectorName,
            findingName: finding.id,
            id: finding.id,
            time: findingTime.getTime(),
            logType: logType || '',
            ruleId: ruleQueries[0]?.id || finding.queries[0].id,
            ruleName: '',
            ruleSeverity: '',
            isThreatIntelOnlyFinding: finding.detectionType === 'Threat intelligence',
          };
        });
        findingItems = findingItems.concat(detectorFindingItems);
      }
    } catch (e: any) {
      errorNotificationToast(this.notifications, 'retrieve', 'findings', e);
    }

    const rulesRes = await this.getRules([...ruleIds]);
    findingItems = findingItems.map((item) => {
      const level = rulesRes[item.ruleId]?.level;
      const severity = level === 'critical' ? level : item['ruleSeverity'] || level;

      return {
        ...item,
        ruleName:
          (item.isThreatIntelOnlyFinding
            ? 'Threat intelligence feed'
            : rulesRes[item.ruleId]?.title) || DEFAULT_EMPTY_DATA,
        ruleSeverity: severity || DEFAULT_EMPTY_DATA,
      };
    });

    this.overviewViewModel.findings = this.filterChartDataByTime(findingItems);
  }

  // Wazuh: hide alerts in overview view model.
  // private async updateAlerts(signal: AbortSignal) {
  //   let alertItems: OverviewAlertItem[] = [];
  //   const duration = getDuration({
  //     startTime: this.startTime,
  //     endTime: this.endTime,
  //   });
  //
  //   try {
  //     for (let detector of this.overviewViewModel.detectors) {
  //       const id = detector._id;
  //       const detectorAlerts = await DataStore.alerts.getAlertsByDetector(
  //         id,
  //         detector._source.name,
  //         signal,
  //         duration
  //       );
  //       const detectorAlertItems: OverviewAlertItem[] = detectorAlerts.map((alert) => ({
  //         id: alert.id,
  //         severity: alert.severity,
  //         time: alert.last_notification_time,
  //         triggerName: alert.trigger_name,
  //         logType: detector._source.detector_type,
  //         acknowledged: !!alert.acknowledged_time,
  //       }));
  //       alertItems = alertItems.concat(detectorAlertItems);
  //     }
  //   } catch (e: any) {
  //     errorNotificationToast(this.notifications, 'retrieve', 'alerts', e);
  //   }
  //
  //   this.overviewViewModel.alerts = this.filterChartDataByTime(alertItems);
  // }

  private async updateThreatIntelFindings(signal: AbortSignal) {
    if (!THREAT_INTEL_ENABLED) {
      this.overviewViewModel.threatIntelFindings = [];
      return;
    }

    let tIFindings: ThreatIntelFinding[] = [];
    const duration = getDuration({
      startTime: this.startTime,
      endTime: this.endTime,
    });

    try {
      tIFindings = await DataStore.threatIntel.getAllThreatIntelFindings(signal, duration);
    } catch (e: any) {
      errorNotificationToast(this.notifications, 'retrieve', 'threat intel findings', e);
    }

    this.overviewViewModel.threatIntelFindings = this.filterChartDataByTime(
      tIFindings,
      'timestamp'
    );
  }

  // Wazuh: hide correlations count in overview view model.
  // private async updateCorrelationsCount() {
  //   let count = 0;
  //   const duration = getDuration({
  //     startTime: this.startTime,
  //     endTime: this.endTime,
  //   });
  //
  //   try {
  //     count = await DataStore.correlations.getCorrelationsCountInWindow(
  //       duration.startTime.toString(),
  //       duration.endTime.toString()
  //     );
  //   } catch (e: any) {
  //     errorNotificationToast(this.notifications, 'retrieve', 'correlation count', e);
  //   }
  //
  //   this.overviewViewModel.correlations = count;
  // }

  public getOverviewViewModel() {
    return this.overviewViewModel;
  }

  public registerRefreshHandler(
    handler: OverviewViewModelRefreshHandler,
    allowPartialResults: boolean
  ) {
    allowPartialResults
      ? this.partialUpdateHandlers.push(handler)
      : this.fullUpdateHandlers.push(handler);
  }

  startTime = DEFAULT_DATE_RANGE.start;
  endTime = DEFAULT_DATE_RANGE.end;

  public async onRefresh(startTime: string, endTime: string, signal: AbortSignal) {
    this.startTime = startTime;
    this.endTime = endTime;

    if (this.refreshState === 'InProgress') {
      return;
    }

    this.refreshState = 'InProgress';

    await this.runSteps(
      [
        async () => {
          await this.updateDetectors();
          this.updateResults(this.partialUpdateHandlers, false);
        },
        async (signal: AbortSignal) => {
          await this.updateFindings(signal);
          this.updateResults(this.partialUpdateHandlers, false);
        },
        // Wazuh: hide alerts in overview refresh flow.
        // async (signal: AbortSignal) => {
        //   await this.updateAlerts(signal);
        //   this.updateResults(this.partialUpdateHandlers, false);
        // },
        async (signal: AbortSignal) => {
          await this.updateThreatIntelFindings(signal);
          this.updateResults(this.partialUpdateHandlers, false);
        },
        // Wazuh: hide correlations in overview refresh flow.
        // async (_signal: AbortSignal) => {
        //   await this.updateCorrelationsCount();
        //   this.updateResults(this.partialUpdateHandlers, false);
        // },
      ],
      signal
    );

    this.updateResults(this.fullUpdateHandlers, true);
    this.refreshState = 'Complete';
  }

  private filterChartDataByTime = (chartData: any, timeField: string = 'time') => {
    const startMoment = dateMath.parse(this.startTime);
    const endMoment = dateMath.parse(this.endTime);
    return chartData.filter((dataItem: any) => {
      return moment(dataItem[timeField]).isBetween(moment(startMoment), moment(endMoment));
    });
  };

  private updateResults(
    handlers: OverviewViewModelRefreshHandler[],
    modelLoadingComplete: boolean
  ) {
    handlers.forEach((handler) => {
      handler(this.overviewViewModel, modelLoadingComplete);
    });
  }

  private async runSteps(steps: Array<(signal: AbortSignal) => Promise<any>>, signal: AbortSignal) {
    for (let step of steps) {
      if (signal.aborted) {
        break;
      }

      await step(signal);

      if (signal.aborted) {
        break;
      }
    }
  }
}
