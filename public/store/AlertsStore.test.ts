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

    expect(result).toEqual({ ok: false, error: 'failed', allDetectorsQueryUnsupported: false });
    expect(addDanger).not.toHaveBeenCalled();
    expect(store.isAllDetectorsQuerySupported()).toBe(true);
  });

  it('remembers per data source if the backend requires a detector', async () => {
    const getAlerts = jest.fn(() => Promise.resolve({ ok: false, error: OLD_BACKEND_ERROR }));
    const store = createStore(getAlerts);
    dataSourceInfo.activeDataSource = { id: 'old-cluster' };

    expect(store.isAllDetectorsQuerySupported()).toBe(true);
    const result = await store.getAlertsPage({ size: 10 });

    expect(result).toEqual({
      ok: false,
      error: OLD_BACKEND_ERROR,
      allDetectorsQueryUnsupported: true,
    });
    expect(store.isAllDetectorsQuerySupported()).toBe(false);

    dataSourceInfo.activeDataSource = { id: 'new-cluster' };
    expect(store.isAllDetectorsQuerySupported()).toBe(true);
  });

  it('does not treat the error of a request for a detector as missing support', async () => {
    const getAlerts = jest.fn(() => Promise.resolve({ ok: false, error: OLD_BACKEND_ERROR }));
    const store = createStore(getAlerts);

    const result = await store.getAlertsPage({ detector_id: 'detector-1', size: 10 });

    expect(result).toMatchObject({ ok: false, allDetectorsQueryUnsupported: false });
    expect(store.isAllDetectorsQuerySupported()).toBe(true);
  });
});
