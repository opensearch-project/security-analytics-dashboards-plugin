/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { setupAlertsRoutes } from './AlertRoutes';
import { API } from '../utils/constants';

describe('Alerts routes', () => {
  const getAlertsQueryValidation = () => {
    const router = { get: jest.fn(), post: jest.fn(), put: jest.fn() };
    const alertService = {
      getAlerts: jest.fn(),
      acknowledgeAlerts: jest.fn(),
      getThreatIntelAlerts: jest.fn(),
      updateThreatIntelAlertsState: jest.fn(),
    };
    setupAlertsRoutes({ alertService } as any, router as any);
    const [config, handler] = router.get.mock.calls.find(
      ([routeConfig]) => routeConfig.path === API.GET_ALERTS
    );
    expect(handler).toBe(alertService.getAlerts);
    return config.validate.query;
  };

  it('accepts the paging, sorting, filter and search params', () => {
    const query = {
      detector_id: 'detector-1',
      sortOrder: 'desc',
      sortString: 'start_time',
      size: '20',
      startIndex: '40',
      startTime: '1000',
      endTime: '2000',
      searchString: 'win* det*',
      severityLevels: '1,2',
      alertStates: 'ACTIVE,COMPLETED',
      dataSourceId: 'ds-1',
    };

    expect(getAlertsQueryValidation().validate(query)).toEqual({
      ...query,
      size: 20,
      startIndex: 40,
      startTime: 1000,
      endTime: 2000,
    });
  });

  it('does not require a detector', () => {
    expect(getAlertsQueryValidation().validate({ size: '10' })).toEqual({ size: 10 });
  });

  it('rejects unknown params', () => {
    expect(() => getAlertsQueryValidation().validate({ unknownParam: 'x' })).toThrow();
  });
});
