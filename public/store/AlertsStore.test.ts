/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { AlertsStore } from './AlertsStore';
import notificationsStartMock from '../../test/mocks/services/notifications/NotificationsStart.mock';
import { MAX_ALERTS_RESULT_WINDOW } from '../utils/constants';

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
