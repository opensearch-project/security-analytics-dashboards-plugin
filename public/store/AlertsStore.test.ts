/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  ALERTS_SERVER_SIDE_UNSUPPORTED_TTL_MS,
  AlertsStore,
  isAlertsServerSideUnsupportedError,
} from './AlertsStore';
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
    expect(result).toEqual({ ok: true, alerts, total: 10000, nextCursor: null, prevCursor: null });
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
    'returns unsupported and detects the support again after an error of an older backend %s',
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
      dataSourceInfo.activeDataSource = { id: 'upgrading-cluster' };
      // A single request that hit an older node doesn't make the data source unsupported.
      expect(store.getAlertsServerSideSupport()).toBe('unknown');
      expect(getAlerts).toHaveBeenCalledTimes(2);
      expect(addDanger).not.toHaveBeenCalled();

      // The next detection asks the backend again.
      getAlerts.mockResolvedValue({ ok: true, response: { alerts: [], total_alerts: 5 } });
      expect(await store.detectAlertsServerSideSupport()).toEqual({ support: 'supported' });
      expect(getAlerts).toHaveBeenCalledTimes(3);
      expect(getAlerts).toHaveBeenLastCalledWith({
        startIndex: 0,
        size: 0,
        paging: 'cursor',
        dataSource: { id: 'upgrading-cluster' },
      });
    }
  );

  it.each([
    'request [/_plugins/_security_analytics/alerts] contains unrecognized parameter: [foo]',
    'request [/_plugins/_security_analytics/alerts] contains unrecognized parameters: [severityLevels], [foo]',
  ])(
    'returns a newer backend rejecting another param as an error without changing the support: %s',
    async (error) => {
      const getAlerts = jest
        .fn()
        .mockResolvedValueOnce({ ok: true, response: { alerts: [], total_alerts: 5 } })
        .mockResolvedValueOnce({ ok: false, error });
      const store = createStore(getAlerts);
      dataSourceInfo.activeDataSource = { id: 'cluster' };
      await store.detectAlertsServerSideSupport();

      expect(await store.getAlertsPage({ size: 10, severityLevels: '1' })).toEqual({
        ok: false,
        error,
      });
      expect(store.getAlertsServerSideSupport()).toBe('supported');
    }
  );

  it('does not clear the support of other data sources after an error of an older backend', async () => {
    const getAlerts = jest
      .fn()
      .mockResolvedValueOnce({ ok: true, response: { alerts: [], total_alerts: 5 } })
      .mockResolvedValueOnce({ ok: false, error: OLD_BACKEND_ERROR });
    const store = createStore(getAlerts);
    dataSourceInfo.activeDataSource = { id: 'other-cluster' };
    await store.detectAlertsServerSideSupport();

    dataSourceInfo.activeDataSource = { id: 'upgrading-cluster' };
    await store.getAlertsPage({ size: 10, dataSource: { id: 'upgrading-cluster' } });

    dataSourceInfo.activeDataSource = { id: 'other-cluster' };
    expect(store.getAlertsServerSideSupport()).toBe('supported');
  });
});

describe('AlertsStore.detectAlertsServerSideSupport', () => {
  const OLD_BACKEND_ERROR =
    '[action_request_validation_exception] Validation Failed: 1: At least one of detector type or detector id needs to be passed;';

  afterEach(() => {
    dataSourceInfo.activeDataSource = { id: '' };
  });

  const ok = () => Promise.resolve({ ok: true, response: { alerts: [], total_alerts: 5 } });

  it('asks for the number of alerts of all detectors in cursor paging without other params', async () => {
    const getAlerts = jest.fn(ok);
    const store = createStore(getAlerts);
    dataSourceInfo.activeDataSource = { id: 'cluster' };

    expect(store.getAlertsServerSideSupport()).toBe('unknown');
    expect(store.getAlertsCursorSupport()).toBe(false);
    expect(await store.detectAlertsServerSideSupport()).toEqual({ support: 'supported' });

    expect(getAlerts).toHaveBeenCalledTimes(1);
    expect(getAlerts).toHaveBeenCalledWith({
      startIndex: 0,
      size: 0,
      paging: 'cursor',
      dataSource: { id: 'cluster' },
    });
    expect(store.getAlertsServerSideSupport()).toBe('supported');
    expect(store.getAlertsCursorSupport()).toBe(true);
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

  describe('with fake timers', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('knows a data source as unsupported until it expires and then detects it again', async () => {
      const getAlerts = jest
        .fn()
        .mockResolvedValueOnce({ ok: false, error: OLD_BACKEND_ERROR })
        .mockImplementation(ok);
      const store = createStore(getAlerts);
      dataSourceInfo.activeDataSource = { id: 'old-cluster' };

      expect(await store.detectAlertsServerSideSupport()).toEqual({ support: 'unsupported' });
      jest.advanceTimersByTime(ALERTS_SERVER_SIDE_UNSUPPORTED_TTL_MS - 1);
      expect(store.getAlertsServerSideSupport()).toBe('unsupported');
      expect(await store.detectAlertsServerSideSupport()).toEqual({ support: 'unsupported' });
      expect(getAlerts).toHaveBeenCalledTimes(1);

      jest.advanceTimersByTime(1);
      expect(store.getAlertsServerSideSupport()).toBe('unknown');
      // The backend got upgraded meanwhile.
      expect(await store.detectAlertsServerSideSupport()).toEqual({ support: 'supported' });
      expect(getAlerts).toHaveBeenCalledTimes(2);
    });

    it('detects an expired unsupported data source again even without asking for the support first', async () => {
      const getAlerts = jest.fn(() => Promise.resolve({ ok: false, error: OLD_BACKEND_ERROR }));
      const store = createStore(getAlerts);

      expect(await store.detectAlertsServerSideSupport()).toEqual({ support: 'unsupported' });
      jest.advanceTimersByTime(ALERTS_SERVER_SIDE_UNSUPPORTED_TTL_MS);
      expect(await store.detectAlertsServerSideSupport()).toEqual({ support: 'unsupported' });
      expect(getAlerts).toHaveBeenCalledTimes(2);
      // Known as unsupported for the full time again
      jest.advanceTimersByTime(ALERTS_SERVER_SIDE_UNSUPPORTED_TTL_MS - 1);
      expect(store.getAlertsServerSideSupport()).toBe('unsupported');
    });

    it('keeps knowing a data source as supported', async () => {
      const getAlerts = jest.fn(ok);
      const store = createStore(getAlerts);

      expect(await store.detectAlertsServerSideSupport()).toEqual({ support: 'supported' });
      jest.advanceTimersByTime(ALERTS_SERVER_SIDE_UNSUPPORTED_TTL_MS * 100);
      expect(store.getAlertsServerSideSupport()).toBe('supported');
      expect(await store.detectAlertsServerSideSupport()).toEqual({ support: 'supported' });
      expect(getAlerts).toHaveBeenCalledTimes(1);
    });
  });

  it('uses the given clock for when an unsupported data source expires', async () => {
    let now = 1000;
    const getAlerts = jest.fn(() => Promise.resolve({ ok: false, error: OLD_BACKEND_ERROR }));
    const store = new AlertsStore({ getAlerts } as any, notificationsStartMock, () => now);

    await store.detectAlertsServerSideSupport();
    now += ALERTS_SERVER_SIDE_UNSUPPORTED_TTL_MS - 1;
    expect(store.getAlertsServerSideSupport()).toBe('unsupported');
    now += 1;
    expect(store.getAlertsServerSideSupport()).toBe('unknown');
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

describe('AlertsStore cursor paging support', () => {
  const OLD_BACKEND_ERROR =
    '[action_request_validation_exception] Validation Failed: 1: At least one of detector type or detector id needs to be passed;';
  const NO_CURSOR_ERROR =
    '[illegal_argument_exception] request [/_plugins/_security_analytics/alerts] contains unrecognized parameter: [paging]';
  const NO_CURSOR_PERMISSION_ERROR =
    '[security_exception] no permissions for [cluster:admin/opensearch/securityanalytics/alerts/get_page] and User [name=reader, backend_roles=[], requestedTenant=null]';

  const ok = () => Promise.resolve({ ok: true, response: { alerts: [], total_alerts: 5 } });

  afterEach(() => {
    dataSourceInfo.activeDataSource = { id: '' };
  });

  it.each([
    ['does not know the cursor paging params', NO_CURSOR_ERROR],
    [
      'does not know the cursor paging params and suggests others',
      'request [/_plugins/_security_analytics/alerts] contains unrecognized parameters: [paging] -> did you mean [page]?',
    ],
    ['denies the cursor paging permission', NO_CURSOR_PERMISSION_ERROR],
    [
      'denies the cursor paging permission in an error object',
      {
        type: 'security_exception',
        reason:
          'no permissions for [cluster:admin/opensearch/securityanalytics/alerts/get_page] and User [name=reader]',
      },
    ],
  ])(
    'detects support without cursor paging with a second request if the backend %s',
    async (_, error) => {
      const getAlerts = jest.fn((params) =>
        params.paging ? Promise.resolve({ ok: false, error }) : ok()
      );
      const store = createStore(getAlerts);
      dataSourceInfo.activeDataSource = { id: 'cluster' };

      expect(await store.detectAlertsServerSideSupport()).toEqual({ support: 'supported' });

      expect(getAlerts.mock.calls.map(([params]) => params)).toEqual([
        { startIndex: 0, size: 0, paging: 'cursor', dataSource: { id: 'cluster' } },
        { startIndex: 0, size: 0, dataSource: { id: 'cluster' } },
      ]);
      expect(store.getAlertsServerSideSupport()).toBe('supported');
      expect(store.getAlertsCursorSupport()).toBe(false);
      // Known for the data source
      expect(await store.detectAlertsServerSideSupport()).toEqual({ support: 'supported' });
      expect(getAlerts).toHaveBeenCalledTimes(2);
    }
  );

  it('detects an older backend that requires a detector with a single request', async () => {
    const getAlerts = jest.fn(() => Promise.resolve({ ok: false, error: OLD_BACKEND_ERROR }));
    const store = createStore(getAlerts);

    expect(await store.detectAlertsServerSideSupport()).toEqual({ support: 'unsupported' });
    expect(getAlerts).toHaveBeenCalledTimes(1);
    expect(store.getAlertsCursorSupport()).toBe(false);
  });

  it('detects an older backend that rejects cursor paging and requires a detector', async () => {
    const getAlerts = jest.fn((params) =>
      Promise.resolve({ ok: false, error: params.paging ? NO_CURSOR_ERROR : OLD_BACKEND_ERROR })
    );
    const store = createStore(getAlerts);

    expect(await store.detectAlertsServerSideSupport()).toEqual({ support: 'unsupported' });
    expect(getAlerts).toHaveBeenCalledTimes(2);
    expect(store.getAlertsServerSideSupport()).toBe('unsupported');
    expect(store.getAlertsCursorSupport()).toBe(false);
  });

  it('leaves the support unknown if the second request fails otherwise', async () => {
    const getAlerts = jest.fn((params) =>
      Promise.resolve({ ok: false, error: params.paging ? NO_CURSOR_ERROR : 'Service unavailable' })
    );
    const store = createStore(getAlerts);

    expect(await store.detectAlertsServerSideSupport()).toEqual({
      support: 'unknown',
      error: 'Service unavailable',
    });
    expect(store.getAlertsServerSideSupport()).toBe('unknown');
  });

  it('knows the cursor paging support per data source', async () => {
    const getAlerts = jest.fn((params) =>
      params.paging && params.dataSource.id === 'cluster-without-cursor'
        ? Promise.resolve({ ok: false, error: NO_CURSOR_ERROR })
        : ok()
    );
    const store = createStore(getAlerts);

    dataSourceInfo.activeDataSource = { id: 'cluster-without-cursor' };
    await store.detectAlertsServerSideSupport();
    dataSourceInfo.activeDataSource = { id: 'cluster-with-cursor' };
    expect(store.getAlertsCursorSupport()).toBe(false);
    await store.detectAlertsServerSideSupport();
    expect(store.getAlertsCursorSupport()).toBe(true);
    dataSourceInfo.activeDataSource = { id: 'cluster-without-cursor' };
    expect(store.getAlertsCursorSupport()).toBe(false);
  });

  it('passes the cursor paging params on and returns the cursors of a page', async () => {
    const alerts = createAlerts(3);
    const getAlerts = jest.fn(() =>
      Promise.resolve({
        ok: true,
        response: { alerts, total_alerts: 37512, next_cursor: 'next1', prev_cursor: 'prev1' },
      })
    );
    const store = createStore(getAlerts);
    const params = {
      size: 3,
      paging: 'cursor' as const,
      searchAfter: 'abc_-1',
      direction: 'prev' as const,
    };

    expect(await store.getAlertsPage(params)).toEqual({
      ok: true,
      alerts,
      total: 37512,
      nextCursor: 'next1',
      prevCursor: 'prev1',
    });
    expect(getAlerts).toHaveBeenCalledWith(params);
  });

  it.each([
    ['rejects the cursor paging params', NO_CURSOR_ERROR],
    [
      'rejects searchAfter and direction',
      'request [/_plugins/_security_analytics/alerts] contains unrecognized parameters: [direction], [searchAfter]',
    ],
    ['denies the cursor paging permission', NO_CURSOR_PERMISSION_ERROR],
  ])(
    'returns unsupported and detects the support again if a page in cursor paging hits a node that %s',
    async (_, error) => {
      const getAlerts = jest
        .fn()
        .mockImplementationOnce(ok)
        .mockResolvedValueOnce({ ok: false, error });
      const store = createStore(getAlerts);
      dataSourceInfo.activeDataSource = { id: 'cluster' };
      await store.detectAlertsServerSideSupport();
      expect(store.getAlertsCursorSupport()).toBe(true);

      expect(await store.getAlertsPage({ size: 10, paging: 'cursor', searchAfter: 'a1' })).toEqual({
        ok: false,
        error,
        unsupported: true,
      });
      expect(store.getAlertsServerSideSupport()).toBe('unknown');
      expect(store.getAlertsCursorSupport()).toBe(false);
    }
  );

  it('does not treat the cursor permission error of a request without cursor paging as unsupported', async () => {
    const getAlerts = jest
      .fn()
      .mockImplementationOnce(ok)
      .mockResolvedValueOnce({ ok: false, error: NO_CURSOR_PERMISSION_ERROR });
    const store = createStore(getAlerts);
    await store.detectAlertsServerSideSupport();

    expect(await store.getAlertsPage({ size: 10 })).toEqual({
      ok: false,
      error: NO_CURSOR_PERMISSION_ERROR,
    });
    expect(store.getAlertsServerSideSupport()).toBe('supported');
  });
});

describe('isAlertsServerSideUnsupportedError', () => {
  const REQUEST = 'request [/_plugins/_security_analytics/alerts] contains';

  it.each([
    [
      'requiring a detector',
      '[action_request_validation_exception] Validation Failed: 1: At least one of detector type or detector id needs to be passed;',
    ],
    ['rejecting severityLevels', `${REQUEST} unrecognized parameter: [severityLevels]`],
    ['rejecting alertStates', `${REQUEST} unrecognized parameter: [alertStates]`],
    ['rejecting sortString', `${REQUEST} unrecognized parameter: [sortString]`],
    ['rejecting searchString', `${REQUEST} unrecognized parameter: [searchString]`],
    [
      'rejecting all of the params',
      `${REQUEST} unrecognized parameters: [severityLevels], [alertStates], [sortString], [searchString]`,
    ],
    [
      'rejecting a param with a suggestion',
      `${REQUEST} unrecognized parameter: [severityLevels] -> did you mean [severityLevel]?`,
    ],
    [
      'rejecting params with suggestions',
      `${REQUEST} unrecognized parameters: [severityLevels] -> did you mean [severityLevel]?, [alertStates] -> did you mean any of [alertState, alertStatus]?, [searchString]`,
    ],
    [
      'rejecting a param in other case',
      'Request contains Unrecognized Parameter: [SEVERITYLEVELS]',
    ],
    ['rejecting paging', `${REQUEST} unrecognized parameter: [paging]`],
    [
      'rejecting the cursor paging params',
      `${REQUEST} unrecognized parameters: [direction], [paging], [searchAfter]`,
    ],
    [
      'rejecting cursor paging and filter params',
      `${REQUEST} unrecognized parameters: [alertStates], [paging], [searchAfter]`,
    ],
    [
      'rejecting a param in an error object',
      {
        type: 'illegal_argument_exception',
        reason: `${REQUEST} unrecognized parameter: [severityLevels]`,
      },
    ],
  ])('is true for an older backend %s', (_, error) => {
    expect(isAlertsServerSideUnsupportedError(error)).toBe(true);
  });

  it.each([
    ['rejecting another param', `${REQUEST} unrecognized parameter: [foo]`],
    [
      'rejecting another param with a suggestion of ours',
      `${REQUEST} unrecognized parameter: [severity] -> did you mean [severityLevels]?`,
    ],
    [
      'rejecting another param and ours',
      `${REQUEST} unrecognized parameters: [severityLevels], [foo]`,
    ],
    [
      'rejecting ours and another param with suggestions',
      `${REQUEST} unrecognized parameters: [alertStates] -> did you mean [alertState]?, [foo] -> did you mean [for]?`,
    ],
    [
      'rejecting another param in an error object',
      { type: 'illegal_argument_exception', reason: `${REQUEST} unrecognized parameter: [foo]` },
    ],
    ['rejecting no param in particular', 'unrecognized parameter'],
    [
      'rejecting cursor paging and another param',
      `${REQUEST} unrecognized parameters: [paging], [foo]`,
    ],
    [
      'denying the cursor paging permission',
      'no permissions for [cluster:admin/opensearch/securityanalytics/alerts/get_page] and User [name=reader]',
    ],
    [
      'failing otherwise',
      '[action_request_validation_exception] Validation Failed: 1: invalid sort',
    ],
    ['without an error', undefined],
  ])('is false for %s', (_, error) => {
    expect(isAlertsServerSideUnsupportedError(error)).toBe(false);
  });
});
