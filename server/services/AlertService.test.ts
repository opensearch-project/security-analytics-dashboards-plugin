/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import AlertService from './AlertService';
import { CLIENT_ALERTS_METHODS } from '../utils/constants';

const createService = (dataSourceEnabled = false) => {
  const callAsCurrentUser = jest.fn().mockResolvedValue({ alerts: [], total_alerts: 0 });
  const callAPI = jest.fn().mockResolvedValue({ alerts: [], total_alerts: 0 });
  const osDriver = { asScoped: jest.fn(() => ({ callAsCurrentUser })) };
  const context = {
    dataSource: { opensearch: { legacy: { getClient: jest.fn(() => ({ callAPI })) } } },
  };
  const responseFactory = { custom: jest.fn((res) => res) };
  const service = new AlertService(osDriver as any, dataSourceEnabled);

  const getAlerts = (query: { [key: string]: any }) =>
    service.getAlerts(context as any, { query } as any, responseFactory as any) as Promise<any>;

  return { getAlerts, callAsCurrentUser, callAPI, context };
};

describe('AlertService.getAlerts', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('passes the paging params (including startIndex) to the backend', async () => {
    const { getAlerts, callAsCurrentUser } = createService();

    const res = await getAlerts({
      detector_id: 'detector-1',
      sortOrder: 'desc',
      size: 100,
      startIndex: 200,
      startTime: 1,
      endTime: 2,
    });

    expect(callAsCurrentUser).toHaveBeenCalledTimes(1);
    expect(callAsCurrentUser).toHaveBeenCalledWith(CLIENT_ALERTS_METHODS.GET_ALERTS, {
      detector_id: 'detector-1',
      sortOrder: 'desc',
      size: 100,
      startIndex: 200,
      startTime: 1,
      endTime: 2,
    });
    expect(res.body).toEqual({ ok: true, response: { alerts: [], total_alerts: 0 } });
  });

  it('passes detectorType when no detector_id is given', async () => {
    const { getAlerts, callAsCurrentUser } = createService();

    await getAlerts({ detectorType: 'windows', size: 10, startIndex: 0 });

    expect(callAsCurrentUser).toHaveBeenCalledWith(
      CLIENT_ALERTS_METHODS.GET_ALERTS,
      expect.objectContaining({ detectorType: 'windows', size: 10, startIndex: 0 })
    );
  });

  it('passes sorting, filters and search to the backend', async () => {
    const { getAlerts, callAsCurrentUser } = createService();

    await getAlerts({
      detector_id: 'detector-1',
      sortOrder: 'asc',
      sortString: 'monitor_name.keyword',
      size: 20,
      startIndex: 40,
      severityLevels: '1,2',
      alertStates: 'ACTIVE,ACKNOWLEDGED',
      searchString: 'win* det*',
    });

    expect(callAsCurrentUser).toHaveBeenCalledWith(CLIENT_ALERTS_METHODS.GET_ALERTS, {
      detector_id: 'detector-1',
      sortOrder: 'asc',
      sortString: 'monitor_name.keyword',
      size: 20,
      startIndex: 40,
      severityLevels: '1,2',
      alertStates: 'ACTIVE,ACKNOWLEDGED',
      searchString: 'win* det*',
    });
  });

  it('gets the alerts of all detectors without detector_id and detectorType', async () => {
    const { getAlerts, callAsCurrentUser } = createService();

    const res = await getAlerts({ size: 10, startIndex: 0, sortString: 'start_time' });

    expect(res.body.ok).toBe(true);
    const params = callAsCurrentUser.mock.calls[0][1];
    expect(params).toMatchObject({ size: 10, startIndex: 0, sortString: 'start_time' });
    expect(params).not.toHaveProperty('detector_id');
    expect(params).not.toHaveProperty('detectorType');
  });

  it('sends only detector_id when both detector_id and detectorType are given', async () => {
    const { getAlerts, callAsCurrentUser } = createService();

    await getAlerts({ detector_id: 'detector-1', detectorType: 'windows' });

    const params = callAsCurrentUser.mock.calls[0][1];
    expect(params.detector_id).toBe('detector-1');
    expect(params).not.toHaveProperty('detectorType');
  });

  it('uses the data source client when MDS is enabled', async () => {
    const { getAlerts, callAsCurrentUser, callAPI, context } = createService(true);

    await getAlerts({ detector_id: 'detector-1', startIndex: 0, dataSourceId: 'ds-1' });

    expect(context.dataSource.opensearch.legacy.getClient).toHaveBeenCalledWith('ds-1');
    expect(callAPI).toHaveBeenCalledWith(
      CLIENT_ALERTS_METHODS.GET_ALERTS,
      expect.objectContaining({ detector_id: 'detector-1', startIndex: 0 })
    );
    expect(callAsCurrentUser).not.toHaveBeenCalled();
  });

  it('returns the backend error as a failed response', async () => {
    const { getAlerts, callAsCurrentUser } = createService();
    callAsCurrentUser.mockRejectedValueOnce(new Error('boom'));

    const res = await getAlerts({ detector_id: 'detector-1' });

    expect(res.body).toEqual({ ok: false, error: 'boom' });
  });
});
