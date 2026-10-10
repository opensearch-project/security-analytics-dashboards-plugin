/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import AlertsService from './AlertsService';
import notificationsStartMock from '../../test/mocks/services/notifications/NotificationsStart.mock';
import { API } from '../../server/utils/constants';

describe('AlertsService.getAlerts', () => {
  const createService = () => {
    const httpClient = { get: jest.fn().mockResolvedValue({ ok: true }) };
    const service = new AlertsService(httpClient as any, notificationsStartMock);
    return { service, httpClient };
  };

  it('gets a page of the alerts of all detectors', async () => {
    const { service, httpClient } = createService();

    await service.getAlerts({
      startIndex: 20,
      size: 10,
      sortString: 'severity',
      sortOrder: 'asc',
      startTime: 1000,
      endTime: 2000,
      severityLevels: '1,2',
      alertStates: 'ACTIVE',
      searchString: 'win*',
    });

    expect(httpClient.get).toHaveBeenCalledTimes(1);
    expect(httpClient.get).toHaveBeenCalledWith(`..${API.GET_ALERTS}`, {
      query: {
        startIndex: 20,
        size: 10,
        sortString: 'severity',
        sortOrder: 'asc',
        startTime: 1000,
        endTime: 2000,
        severityLevels: '1,2',
        alertStates: 'ACTIVE',
        searchString: 'win*',
        dataSourceId: '',
      },
    });
    const { query } = httpClient.get.mock.calls[0][1];
    expect(query).not.toHaveProperty('detector_id');
    expect(query).not.toHaveProperty('detectorType');
  });

  it('keeps the existing defaults and a size of 0', async () => {
    const { service, httpClient } = createService();

    await service.getAlerts({ detector_id: 'detector-1' });
    await service.getAlerts({ detectorType: 'windows', size: 0 });

    expect(httpClient.get.mock.calls[0][1].query).toMatchObject({
      detector_id: 'detector-1',
      sortOrder: 'desc',
      size: 10000,
      startIndex: 0,
    });
    expect(httpClient.get.mock.calls[1][1].query).toMatchObject({
      detectorType: 'windows',
      size: 0,
    });
  });

  it('sends only the detector id when a detector id and type are given', async () => {
    const { service, httpClient } = createService();

    await service.getAlerts({ detector_id: 'detector-1', detectorType: 'windows' });

    const { query } = httpClient.get.mock.calls[0][1];
    expect(query.detector_id).toBe('detector-1');
    expect(query).not.toHaveProperty('detectorType');
  });
});
