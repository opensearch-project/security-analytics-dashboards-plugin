/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { AlertsStore } from './AlertsStore';
import notificationsStartMock from '../../test/mocks/services/notifications/NotificationsStart.mock';
import { MAX_ALERTS_RESULT_WINDOW } from '../utils/constants';
import { dataSourceInfo } from '../services/utils/constants';

const createAlerts = (count: number, offset = 0) =>
  Array.from({ length: count }, (_, i) => ({ id: `alert-${offset + i}` }));

const createStore = (getAlerts: jest.Mock) =>
  new AlertsStore({ getAlerts } as any, notificationsStartMock);

describe('AlertsStore.getAlertsByDetector', () => {
  it('stops at the max result window when the backend always returns a full page', async () => {
    const pageSize = 2500;
    const getAlerts = jest.fn(({ startIndex, size }) =>
      Promise.resolve({ ok: true, response: { alerts: createAlerts(size, startIndex) } })
    );
    const store = createStore(getAlerts);

    const alerts = await store.getAlertsByDetector(
      'detector-1',
      'Detector 1',
      new AbortController().signal,
      undefined,
      undefined,
      pageSize
    );

    const startIndexes = getAlerts.mock.calls.map(([params]) => params.startIndex);
    expect(startIndexes).toEqual([0, 2500, 5000, 7500]);
    getAlerts.mock.calls.forEach(([params]) => {
      expect(params.size).toBe(pageSize);
      expect(params.startIndex + params.size).toBeLessThanOrEqual(MAX_ALERTS_RESULT_WINDOW);
    });
    expect(alerts).toHaveLength(MAX_ALERTS_RESULT_WINDOW);
  });

  it('makes a single request with the default page size even if the page is full', async () => {
    const getAlerts = jest.fn(({ size }) =>
      Promise.resolve({ ok: true, response: { alerts: createAlerts(size) } })
    );
    const store = createStore(getAlerts);

    const alerts = await store.getAlertsByDetector(
      'detector-1',
      'Detector 1',
      new AbortController().signal,
      { startTime: 1, endTime: 2 }
    );

    expect(getAlerts).toHaveBeenCalledTimes(1);
    expect(getAlerts).toHaveBeenCalledWith({
      detector_id: 'detector-1',
      startIndex: 0,
      size: MAX_ALERTS_RESULT_WINDOW,
      startTime: 1,
      endTime: 2,
      dataSource: undefined,
    });
    expect(alerts).toHaveLength(MAX_ALERTS_RESULT_WINDOW);
  });

  it('fetches pages until a page is not full', async () => {
    const pages = [createAlerts(3, 0), createAlerts(3, 3), createAlerts(1, 6)];
    const getAlerts = jest.fn(() =>
      Promise.resolve({ ok: true, response: { alerts: pages.shift() } })
    );
    const onPartialAlertsFetched = jest.fn();
    const store = createStore(getAlerts);

    const alerts = await store.getAlertsByDetector(
      'detector-1',
      'Detector 1',
      new AbortController().signal,
      undefined,
      onPartialAlertsFetched,
      3
    );

    expect(getAlerts.mock.calls.map(([params]: any) => params.startIndex)).toEqual([0, 3, 6]);
    expect(onPartialAlertsFetched).toHaveBeenCalledTimes(3);
    expect(alerts.map(({ id }) => id)).toEqual(createAlerts(7).map(({ id }) => id));
    alerts.forEach((alert) => {
      expect(alert.detectorName).toBe('Detector 1');
      expect(alert.detector_id).toBe('detector-1');
    });
  });

  it('stops after an empty page', async () => {
    const getAlerts = jest.fn(() => Promise.resolve({ ok: true, response: { alerts: [] } }));
    const store = createStore(getAlerts);

    const alerts = await store.getAlertsByDetector(
      'detector-1',
      'Detector 1',
      new AbortController().signal,
      undefined,
      undefined,
      0
    );

    expect(getAlerts).toHaveBeenCalledTimes(1);
    expect(alerts).toEqual([]);
  });

  it('tells that loading stopped at the max result window', async () => {
    const getAlerts = jest.fn(({ startIndex, size }) =>
      Promise.resolve({ ok: true, response: { alerts: createAlerts(size, startIndex) } })
    );
    const store = createStore(getAlerts);

    const result = await store.getAlertsByDetectorResult(
      'detector-1',
      'Detector 1',
      new AbortController().signal,
      undefined,
      undefined,
      2500
    );

    expect(result.resultWindowReached).toBe(true);
    expect(result.alerts).toHaveLength(MAX_ALERTS_RESULT_WINDOW);
  });

  it('tells that loading stopped at the max result window with the default page size', async () => {
    const getAlerts = jest.fn(({ size }) =>
      Promise.resolve({ ok: true, response: { alerts: createAlerts(size) } })
    );
    const store = createStore(getAlerts);

    const result = await store.getAlertsByDetectorResult(
      'detector-1',
      'Detector 1',
      new AbortController().signal
    );

    expect(getAlerts).toHaveBeenCalledTimes(1);
    expect(result.resultWindowReached).toBe(true);
    expect(result.alerts).toHaveLength(MAX_ALERTS_RESULT_WINDOW);
  });

  it.each([
    ['a page is not full', () => createAlerts(MAX_ALERTS_RESULT_WINDOW - 1)],
    ['a page is empty', () => []],
  ])('tells that the max result window was not reached when %s', async (_, alerts) => {
    const getAlerts = jest.fn(() => Promise.resolve({ ok: true, response: { alerts: alerts() } }));
    const store = createStore(getAlerts);

    const result = await store.getAlertsByDetectorResult(
      'detector-1',
      'Detector 1',
      new AbortController().signal
    );

    expect(result.resultWindowReached).toBe(false);
  });

  it('tells that the max result window was not reached when a request fails', async () => {
    const getAlerts = jest.fn(() => Promise.resolve({ ok: false, error: 'failed' }));
    const store = createStore(getAlerts);

    const result = await store.getAlertsByDetectorResult(
      'detector-1',
      'Detector 1',
      new AbortController().signal
    );

    expect(result).toEqual({ alerts: [], resultWindowReached: false });
  });

  it('stops and shows an error toast when a request fails', async () => {
    const getAlerts = jest.fn(() => Promise.resolve({ ok: false, error: 'failed' }));
    const store = createStore(getAlerts);
    const addDanger = jest.spyOn(notificationsStartMock.toasts, 'addDanger');

    const alerts = await store.getAlertsByDetector(
      'detector-1',
      'Detector 1',
      new AbortController().signal
    );

    expect(getAlerts).toHaveBeenCalledTimes(1);
    expect(addDanger).toHaveBeenCalledTimes(1);
    expect(alerts).toEqual([]);
  });

  it('stops when the request is aborted', async () => {
    const abortController = new AbortController();
    const getAlerts = jest.fn(({ size }) => {
      abortController.abort();
      return Promise.resolve({ ok: true, response: { alerts: createAlerts(size) } });
    });
    const store = createStore(getAlerts);

    const alerts = await store.getAlertsByDetector(
      'detector-1',
      'Detector 1',
      abortController.signal,
      undefined,
      undefined,
      10
    );

    expect(getAlerts).toHaveBeenCalledTimes(1);
    expect(alerts).toEqual([]);
  });
});

describe('AlertsStore.getThreatIntelAlerts', () => {
  const createStoreWithThreatIntelAlerts = (getThreatIntelAlerts: jest.Mock) =>
    new AlertsStore({ getThreatIntelAlerts } as any, notificationsStartMock);

  it('stops at the max result window when the backend returns a full page', async () => {
    // Full pages for the first requests, then no more alerts
    const getThreatIntelAlerts = jest.fn(({ startIndex, size }) =>
      Promise.resolve({
        ok: true,
        response: { alerts: startIndex < 2 * size ? createAlerts(size, startIndex) : [] },
      })
    );
    const store = createStoreWithThreatIntelAlerts(getThreatIntelAlerts);

    const alerts = await store.getThreatIntelAlerts(new AbortController().signal, {
      startTime: 1,
      endTime: 2,
    });

    expect(getThreatIntelAlerts).toHaveBeenCalledTimes(1);
    expect(getThreatIntelAlerts).toHaveBeenCalledWith({
      startIndex: 0,
      size: MAX_ALERTS_RESULT_WINDOW,
      startTime: 1,
      endTime: 2,
    });
    expect(alerts).toHaveLength(MAX_ALERTS_RESULT_WINDOW);
  });

  it('makes a single request when the page is not full', async () => {
    const getThreatIntelAlerts = jest.fn(() =>
      Promise.resolve({ ok: true, response: { alerts: createAlerts(5) } })
    );
    const store = createStoreWithThreatIntelAlerts(getThreatIntelAlerts);

    const alerts = await store.getThreatIntelAlerts(new AbortController().signal, {
      startTime: 1,
      endTime: 2,
    });

    expect(getThreatIntelAlerts).toHaveBeenCalledTimes(1);
    expect(alerts).toHaveLength(5);
  });
});

describe('AlertsStore.getAlertsPage', () => {
  const OLD_BACKEND_ERROR =
    '[action_request_validation_exception] Validation Failed: 1: At least one of detector type or detector id needs to be passed;';

  afterEach(() => {
    dataSourceInfo.activeDataSource = { id: '' };
  });

  it('gets a single page of alerts and the total', async () => {
    const alerts = createAlerts(10);
    const getAlerts = jest.fn(() =>
      Promise.resolve({ ok: true, response: { alerts, total_alerts: 10000 } })
    );
    const store = createStore(getAlerts);
    const params = { startIndex: 9990, size: 10, sortString: 'severity' as const };

    const result = await store.getAlertsPage(params);

    expect(getAlerts).toHaveBeenCalledTimes(1);
    expect(getAlerts).toHaveBeenCalledWith(params);
    expect(result).toEqual({ ok: true, alerts, total: 10000 });
  });

  it('returns errors without showing them', async () => {
    const getAlerts = jest.fn(() => Promise.resolve({ ok: false, error: 'failed' }));
    const store = createStore(getAlerts);
    const addDanger = jest.spyOn(notificationsStartMock.toasts, 'addDanger');

    const result = await store.getAlertsPage({ size: 10 });

    expect(result).toEqual({ ok: false, error: 'failed' });
    expect(addDanger).not.toHaveBeenCalled();
  });

  it('does not change the server side support for other errors', async () => {
    const getAlerts = jest.fn(() => Promise.resolve({ ok: false, error: 'Service unavailable' }));
    const store = createStore(getAlerts);

    const result = await store.getAlertsPage({ size: 10 });

    expect(result).toEqual({ ok: false, error: 'Service unavailable' });
    expect(store.getAlertsServerSideSupport()).toBe('unknown');
  });

  // Errors of nodes that weren't upgraded yet during a rolling upgrade
  it.each([
    ['requiring a detector', OLD_BACKEND_ERROR],
    [
      'rejecting a param',
      '[illegal_argument_exception] request [/_plugins/_security_analytics/alerts] contains unrecognized parameter: [severityLevels]',
    ],
    [
      'rejecting params',
      'request [/_plugins/_security_analytics/alerts] contains unrecognized parameters: [alertStates], [searchString]',
    ],
    ['rejecting a param in other case', 'Request contains Unrecognized Parameter: [sortString]'],
    [
      'rejecting a param in an error object',
      {
        type: 'illegal_argument_exception',
        reason:
          'request [/_plugins/_security_analytics/alerts] contains unrecognized parameter: [severityLevels]',
      },
    ],
  ])(
    'knows the data source as unsupported after an error of an older backend %s',
    async (_, error) => {
      let resolve: (res: any) => void = () => {};
      const getAlerts = jest
        .fn()
        .mockResolvedValueOnce({ ok: true, response: { alerts: [], total_alerts: 5 } })
        .mockImplementation(() => new Promise((res) => (resolve = res)));
      const store = createStore(getAlerts);
      const addDanger = jest.spyOn(notificationsStartMock.toasts, 'addDanger');
      dataSourceInfo.activeDataSource = { id: 'upgrading-cluster' };
      await store.detectAlertsServerSideSupport();
      expect(store.getAlertsServerSideSupport()).toBe('supported');

      const page = store.getAlertsPage({ size: 10, severityLevels: '1' });
      // The data source of the request is unsupported, not the one active by the response.
      dataSourceInfo.activeDataSource = { id: 'other-cluster' };
      resolve({ ok: false, error });

      expect(await page).toEqual({ ok: false, error, unsupported: true });
      expect(store.getAlertsServerSideSupport()).toBe('unknown');
      dataSourceInfo.activeDataSource = { id: 'upgrading-cluster' };
      expect(store.getAlertsServerSideSupport()).toBe('unsupported');
      expect(await store.detectAlertsServerSideSupport()).toEqual({ support: 'unsupported' });
      expect(getAlerts).toHaveBeenCalledTimes(2);
      expect(addDanger).not.toHaveBeenCalled();
    }
  );
});

describe('AlertsStore.detectAlertsServerSideSupport', () => {
  const OLD_BACKEND_ERROR =
    '[action_request_validation_exception] Validation Failed: 1: At least one of detector type or detector id needs to be passed;';

  afterEach(() => {
    dataSourceInfo.activeDataSource = { id: '' };
  });

  const ok = () => Promise.resolve({ ok: true, response: { alerts: [], total_alerts: 5 } });

  it('asks for the number of alerts of all detectors without other params', async () => {
    const getAlerts = jest.fn(ok);
    const store = createStore(getAlerts);
    dataSourceInfo.activeDataSource = { id: 'cluster' };

    expect(store.getAlertsServerSideSupport()).toBe('unknown');
    expect(await store.detectAlertsServerSideSupport()).toEqual({ support: 'supported' });

    expect(getAlerts).toHaveBeenCalledTimes(1);
    expect(getAlerts).toHaveBeenCalledWith({
      startIndex: 0,
      size: 0,
      dataSource: { id: 'cluster' },
    });
    expect(store.getAlertsServerSideSupport()).toBe('supported');
  });

  it('detects the support once per data source', async () => {
    const getAlerts = jest.fn((params) =>
      params.dataSource.id === 'old-cluster'
        ? Promise.resolve({ ok: false, error: OLD_BACKEND_ERROR })
        : ok()
    );
    const store = createStore(getAlerts);

    dataSourceInfo.activeDataSource = { id: 'old-cluster' };
    // Concurrent detections share the request.
    const detections = await Promise.all([
      store.detectAlertsServerSideSupport(),
      store.detectAlertsServerSideSupport(),
    ]);
    expect(detections).toEqual([{ support: 'unsupported' }, { support: 'unsupported' }]);
    expect(await store.detectAlertsServerSideSupport()).toEqual({ support: 'unsupported' });
    expect(store.getAlertsServerSideSupport()).toBe('unsupported');
    expect(getAlerts).toHaveBeenCalledTimes(1);

    dataSourceInfo.activeDataSource = { id: 'new-cluster' };
    expect(store.getAlertsServerSideSupport()).toBe('unknown');
    expect(await store.detectAlertsServerSideSupport()).toEqual({ support: 'supported' });
    expect(await store.detectAlertsServerSideSupport()).toEqual({ support: 'supported' });
    expect(getAlerts).toHaveBeenCalledTimes(2);

    dataSourceInfo.activeDataSource = { id: 'old-cluster' };
    expect(store.getAlertsServerSideSupport()).toBe('unsupported');
    expect(getAlerts).toHaveBeenCalledTimes(2);
  });

  it('keeps the data source of the request when the data source changes meanwhile', async () => {
    let resolve: (res: any) => void = () => {};
    const getAlerts = jest.fn(() => new Promise((res) => (resolve = res)));
    const store = createStore(getAlerts);

    dataSourceInfo.activeDataSource = { id: 'old-cluster' };
    const detection = store.detectAlertsServerSideSupport();
    dataSourceInfo.activeDataSource = { id: 'new-cluster' };
    resolve({ ok: false, error: OLD_BACKEND_ERROR });

    expect(await detection).toEqual({ support: 'unsupported' });
    expect(store.getAlertsServerSideSupport()).toBe('unknown');
    dataSourceInfo.activeDataSource = { id: 'old-cluster' };
    expect(store.getAlertsServerSideSupport()).toBe('unsupported');
  });

  it.each([
    ['an error response', () => Promise.resolve({ ok: false, error: 'Service unavailable' })],
    ['a failed request', () => Promise.reject('Service unavailable')],
  ])('leaves the support unknown after %s and detects it again', async (_, failure) => {
    const getAlerts = jest.fn().mockImplementationOnce(failure).mockImplementation(ok);
    const store = createStore(getAlerts);
    const addDanger = jest.spyOn(notificationsStartMock.toasts, 'addDanger');

    expect(await store.detectAlertsServerSideSupport()).toEqual({
      support: 'unknown',
      error: 'Service unavailable',
    });
    expect(store.getAlertsServerSideSupport()).toBe('unknown');
    expect(addDanger).not.toHaveBeenCalled();

    expect(await store.detectAlertsServerSideSupport()).toEqual({ support: 'supported' });
    expect(getAlerts).toHaveBeenCalledTimes(2);
  });
});
