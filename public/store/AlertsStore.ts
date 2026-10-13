/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { NotificationsStart } from 'opensearch-dashboards/public';
import { AlertsService } from '../services';
import { errorNotificationToast } from '../utils/helpers';
import { AlertResponse, Duration, GetAlertsParams, ThreatIntelAlert } from '../../types';
import { MAX_ALERTS_RESULT_WINDOW } from '../utils/constants';
import { dataSourceInfo } from '../services/utils/constants';

export type AlertsPageResult =
  | {
      ok: true;
      alerts: AlertResponse[];
      total: number;
      // Cursor paging only: the cursors of the next and previous pages, null if there is none
      nextCursor: string | null;
      prevCursor: string | null;
    }
  // unsupported: the backend rejected the request as an older backend would, e.g. a node that
  // wasn't upgraded yet during a rolling upgrade. The support of the data source is then unknown
  // again, so it's detected anew.
  | { ok: false; error: any; unsupported?: boolean };

export interface AlertsByDetectorResult {
  alerts: any[];
  // Whether loading stopped at the max result window, so there might be more alerts
  resultWindowReached: boolean;
}

/**
 * Whether the backend of a data source can page, sort, filter and search the alerts of all
 * detectors. 'unknown' until the backend was asked.
 */
export type AlertsServerSideSupport = 'unknown' | 'supported' | 'unsupported';

export type AlertsServerSideSupportResult =
  { support: 'supported' | 'unsupported' } | { support: 'unknown'; error: any };

/**
 * How long a data source stays known as unsupported after detecting it. It's detected again after
 * that, e.g. because its backend got upgraded meanwhile.
 */
export const ALERTS_SERVER_SIDE_UNSUPPORTED_TTL_MS = 5 * 60 * 1000;

type KnownAlertsServerSideSupport =
  // cursor: whether the backend also supports cursor paging (paging=cursor) for the user
  { support: 'supported'; cursor: boolean } | { support: 'unsupported'; expiresAt: number };

// Older backends require a detector id or type when getting alerts.
const DETECTOR_REQUIRED_ERROR = 'at least one of detector type or detector id needs to be passed';

// The params of cursor paging, which older backends don't know, in lower case.
const ALERTS_CURSOR_PARAMS = ['paging', 'searchafter', 'direction'];

// The params older backends don't know, in lower case.
const ALERTS_SERVER_SIDE_PARAMS = [
  'severitylevels',
  'alertstates',
  'sortstring',
  'searchstring',
  ...ALERTS_CURSOR_PARAMS,
];

// Cursor paging has its own permission, e.g. the security_analytics_read_access role of the
// security plugin doesn't have it (yet). The security plugin rejects requests without it with
// "no permissions for [cluster:admin/opensearch/securityanalytics/alerts/get_page] and User ...".
const ALERTS_CURSOR_PERMISSION_ERROR =
  'no permissions for [cluster:admin/opensearch/securityanalytics/alerts/get_page]';

const getErrorMessage = (error: any) =>
  (typeof error === 'string' ? error : JSON.stringify(error ?? '')).toLowerCase();

// OpenSearch rejects params a REST handler doesn't know, e.g. "request [...] contains unrecognized
// parameter: [severityLevels]" or "contains unrecognized parameters: [alertStates], [foo] -> did
// you mean [bar]?". Matches the rejection in the lower case message.
const UNRECOGNIZED_PARAMS_REGEX =
  /unrecognized parameters?:(?:,?\s*\[[^\]]*\](?:\s*->\s*did you mean (?:any of )?\[[^\]]*\]\?)?)+/g;

// The params an "unrecognized parameter" error rejects, in lower case.
const getUnrecognizedParams = (message: string): string[] =>
  (message.match(UNRECOGNIZED_PARAMS_REGEX) ?? [])
    .flatMap(
      (rejection) =>
        rejection
          .replace(/^unrecognized parameters?:/, '')
          .replace(/->\s*did you mean[^?]*\?/g, '')
          .match(/\[[^\]]*\]/g) ?? []
    )
    .map((param) => param.slice(1, -1).trim());

/**
 * Whether the error is how an older backend rejects getting, paging, sorting, filtering or
 * searching the alerts of all detectors. Rejecting any other param isn't, e.g. a newer backend
 * rejecting a param for another reason, so that error is shown.
 */
export const isAlertsServerSideUnsupportedError = (error: any) => {
  const message = getErrorMessage(error);
  if (message.includes(DETECTOR_REQUIRED_ERROR)) {
    return true;
  }

  const unrecognizedParams = getUnrecognizedParams(message);
  return (
    unrecognizedParams.length > 0 &&
    unrecognizedParams.every((param) => ALERTS_SERVER_SIDE_PARAMS.includes(param))
  );
};

/**
 * Whether the error is how the backend rejects cursor paging when the user lacks its permission.
 */
export const isAlertsCursorPermissionError = (error: any) =>
  getErrorMessage(error).includes(ALERTS_CURSOR_PERMISSION_ERROR);

/**
 * Whether the error is how a backend rejects cursor paging that might support the alerts of all
 * detectors without it: a backend that only rejects the cursor paging params, or a user without
 * the permission of cursor paging.
 */
const isAlertsCursorUnsupportedError = (error: any) => {
  if (isAlertsCursorPermissionError(error)) {
    return true;
  }
  const unrecognizedParams = getUnrecognizedParams(getErrorMessage(error));
  return (
    unrecognizedParams.length > 0 &&
    unrecognizedParams.every((param) => ALERTS_CURSOR_PARAMS.includes(param))
  );
};

export class AlertsStore {
  // Known server side support per data source id
  private readonly serverSideSupport = new Map<string, KnownAlertsServerSideSupport>();
  // Pending support detection per data source id
  private readonly serverSideSupportDetections = new Map<
    string,
    Promise<AlertsServerSideSupportResult>
  >();

  constructor(
    private readonly service: AlertsService,
    private readonly notifications: NotificationsStart,
    // Current time in milliseconds, for when a known unsupported data source expires
    private readonly now: () => number = () => Date.now()
  ) {}

  /**
   * Whether the alerts of all detectors can be paged, sorted, filtered and searched by the backend
   * of the active data source, as far as known without making a request.
   */
  public getAlertsServerSideSupport(): AlertsServerSideSupport {
    return this.getKnownSupport(dataSourceInfo.activeDataSource.id) ?? 'unknown';
  }

  /**
   * Whether the backend of the active data source is known to support cursor paging of the alerts,
   * which pages beyond the max result window and returns exact totals.
   */
  public getAlertsCursorSupport(): boolean {
    const dataSourceId = dataSourceInfo.activeDataSource.id;
    const known =
      this.getKnownSupport(dataSourceId) === 'supported'
        ? this.serverSideSupport.get(dataSourceId)
        : undefined;
    return known?.support === 'supported' && known.cursor;
  }

  private getKnownSupport(dataSourceId: string): 'supported' | 'unsupported' | undefined {
    const known = this.serverSideSupport.get(dataSourceId);
    if (known?.support === 'unsupported' && this.now() >= known.expiresAt) {
      this.serverSideSupport.delete(dataSourceId);
      return undefined;
    }
    return known?.support;
  }

  /**
   * Detects whether the backend of the active data source supports paging, sorting, filtering and
   * searching the alerts of all detectors. While the support is unknown a request for the number
   * of alerts of all detectors in cursor paging is made. If the backend rejects cursor paging, i.e.
   * it doesn't know its params or the user lacks its permission, the number of alerts is requested
   * once more without them. Older backends reject that because it has no detector. A supported
   * data source stays known as supported, along with whether it supports cursor paging, an
   * unsupported one for ALERTS_SERVER_SIDE_UNSUPPORTED_TTL_MS. Other errors leave
   * the support unknown, so it's detected again next time. Errors are returned, not shown.
   */
  public detectAlertsServerSideSupport(): Promise<AlertsServerSideSupportResult> {
    const dataSourceId = dataSourceInfo.activeDataSource.id;
    const support = this.getKnownSupport(dataSourceId);
    if (support) {
      return Promise.resolve({ support });
    }

    let detection = this.serverSideSupportDetections.get(dataSourceId);
    if (!detection) {
      detection = this.probeAlertsServerSideSupport(dataSourceId);
      this.serverSideSupportDetections.set(dataSourceId, detection);
    }

    return detection;
  }

  private async probeAlertsServerSideSupport(
    dataSourceId: string
  ): Promise<AlertsServerSideSupportResult> {
    let result: AlertsServerSideSupportResult;
    let cursor = false;
    try {
      // Size 0 only gets the number of alerts.
      let res = await this.service.getAlerts({
        startIndex: 0,
        size: 0,
        paging: 'cursor',
        dataSource: { id: dataSourceId },
      });
      cursor = res.ok;
      if (!res.ok && isAlertsCursorUnsupportedError(res.error)) {
        res = await this.service.getAlerts({
          startIndex: 0,
          size: 0,
          dataSource: { id: dataSourceId },
        });
      }
      if (res.ok) {
        result = { support: 'supported' };
      } else if (isAlertsServerSideUnsupportedError(res.error)) {
        result = { support: 'unsupported' };
      } else {
        result = { support: 'unknown', error: res.error };
      }
    } catch (error: any) {
      result = { support: 'unknown', error };
    }

    if (result.support === 'supported') {
      this.serverSideSupport.set(dataSourceId, { support: 'supported', cursor });
    } else if (result.support === 'unsupported') {
      this.serverSideSupport.set(dataSourceId, {
        support: 'unsupported',
        expiresAt: this.now() + ALERTS_SERVER_SIDE_UNSUPPORTED_TTL_MS,
      });
    }
    this.serverSideSupportDetections.delete(dataSourceId);

    return result;
  }

  /**
   * Gets a single page of alerts with exactly one request. Errors are returned, not shown. Only use
   * it with params other than a detector after detectAlertsServerSideSupport found the backend to
   * support them. If the backend rejects the request as an older backend would, e.g. because it
   * hit a node that wasn't upgraded yet during a rolling upgrade, the result is unsupported and the
   * support of the data source is unknown again. A single request doesn't tell whether the whole
   * backend is older, so the support is detected again instead of known as unsupported. The same
   * goes for a request in cursor paging the backend rejects for missing permissions.
   */
  public async getAlertsPage(params: GetAlertsParams): Promise<AlertsPageResult> {
    const dataSourceId = params.dataSource?.id || dataSourceInfo.activeDataSource.id;
    const res = await this.service.getAlerts(params);

    if (res.ok) {
      const alerts = res.response.alerts ?? [];
      return {
        ok: true,
        alerts,
        total: res.response.total_alerts ?? alerts.length,
        nextCursor: res.response.next_cursor ?? null,
        prevCursor: res.response.prev_cursor ?? null,
      };
    }

    if (
      isAlertsServerSideUnsupportedError(res.error) ||
      (params.paging && isAlertsCursorPermissionError(res.error))
    ) {
      this.serverSideSupport.delete(dataSourceId);
      return { ok: false, error: res.error, unsupported: true };
    }

    return { ok: false, error: res.error };
  }

  public async getAlertsByDetector(
    detectorId: string,
    detectorName: string,
    signal: AbortSignal,
    duration?: Duration,
    onPartialAlertsFetched?: (alerts: AlertResponse[]) => void,
    alertCount?: number,
    dataSource?: any
  ) {
    const { alerts } = await this.getAlertsByDetectorResult(
      detectorId,
      detectorName,
      signal,
      duration,
      onPartialAlertsFetched,
      alertCount,
      dataSource
    );
    return alerts;
  }

  /**
   * Like getAlertsByDetector, but also tells whether loading stopped at the max result window.
   */
  public async getAlertsByDetectorResult(
    detectorId: string,
    detectorName: string,
    signal: AbortSignal,
    duration?: Duration,
    onPartialAlertsFetched?: (alerts: AlertResponse[]) => void,
    alertCount?: number,
    dataSource?: any
  ): Promise<AlertsByDetectorResult> {
    let allAlerts: any[] = [];
    const pageSize = alertCount ?? MAX_ALERTS_RESULT_WINDOW;
    let startIndex = 0;
    let resultWindowReached = false;

    while (!signal.aborted) {
      const getAlertsRes = await this.service.getAlerts({
        detector_id: detectorId,
        startIndex,
        size: pageSize,
        startTime: duration?.startTime,
        endTime: duration?.endTime,
        dataSource,
      });

      if (signal.aborted) {
        break;
      }

      if (!getAlertsRes.ok) {
        errorNotificationToast(this.notifications, 'retrieve', 'alerts', getAlertsRes.error);
        break;
      }

      const alerts = this.extendAlerts(getAlertsRes.response.alerts, detectorId, detectorName);
      onPartialAlertsFetched?.(alerts);
      allAlerts = allAlerts.concat(alerts);
      startIndex += alerts.length;

      // A page that isn't full means there are no more alerts to fetch. The backend also rejects
      // requests where startIndex + size exceeds the max result window, so stop before crossing it.
      if (alerts.length === 0 || alerts.length < pageSize) {
        break;
      }
      if (startIndex + pageSize > MAX_ALERTS_RESULT_WINDOW) {
        resultWindowReached = true;
        break;
      }
    }

    return { alerts: allAlerts, resultWindowReached };
  }

  // Just grab 25 alerts for the analytics all threat alerts card once
  public async getAlertsForThreatAlertsCard(
    detectorId: string,
    detectorName: string,
    duration?: Duration,
    onPartialAlertsFetched?: (alerts: AlertResponse[]) => void,
    alertCount?: number,
    dataSource?: any
  ) {
    let allAlerts: any[] = [];
    const maxAlertsReturned = alertCount ?? 25;
    let startIndex = 0;

    const getAlertsRes = await this.service.getAlerts({
      detector_id: detectorId,
      startIndex,
      size: maxAlertsReturned,
      startTime: duration?.startTime,
      endTime: duration?.endTime,
      dataSource,
    });

    if (getAlertsRes.ok) {
      const alerts = this.extendAlerts(getAlertsRes.response.alerts, detectorId, detectorName);
      onPartialAlertsFetched?.(alerts);
      allAlerts = allAlerts.concat(alerts);
    } else {
      errorNotificationToast(this.notifications, 'retrieve', 'alerts', getAlertsRes.error);
    }
    return allAlerts;
  }

  public async getThreatIntelAlerts(
    signal: AbortSignal,
    duration: Duration,
    onPartialAlertsFetched?: (alerts: ThreatIntelAlert[]) => void
  ) {
    let allAlerts: any[] = [];
    const maxAlertsReturned = MAX_ALERTS_RESULT_WINDOW;
    let startIndex = 0;
    let alertsCount = 0;

    do {
      if (signal.aborted) {
        break;
      }

      const getAlertsRes = await this.service.getThreatIntelAlerts({
        startIndex,
        size: maxAlertsReturned,
        startTime: duration.startTime,
        endTime: duration.endTime,
      });

      if (signal.aborted) {
        break;
      }

      if (getAlertsRes.ok) {
        const alerts = getAlertsRes.response.alerts;
        onPartialAlertsFetched?.(alerts);
        allAlerts = allAlerts.concat(alerts);
        alertsCount = alerts.length;
      } else {
        alertsCount = 0;
        errorNotificationToast(this.notifications, 'retrieve', 'alerts', getAlertsRes.error);
      }

      startIndex += alertsCount;
    } while (
      // If we get 10,000 alerts as part of the previous call then there might be more alerts to fetch,
      // hence we make another call until the number of alerts is less then 10,000. The backend
      // rejects requests where startIndex + size exceeds the max result window, so stop before it.
      alertsCount === maxAlertsReturned &&
      startIndex + maxAlertsReturned <= MAX_ALERTS_RESULT_WINDOW
    );

    return allAlerts;
  }

  private extendAlerts(allAlerts: any[], detectorId: string, detectorName: string) {
    return allAlerts.map((alert) => {
      if (!alert.detector_id) {
        alert.detector_id = detectorId;
      }

      return {
        ...alert,
        detectorName: detectorName,
      };
    });
  }
}
