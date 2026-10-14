/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { setupAlertsRoutes } from './AlertRoutes';
import { API } from '../utils/constants';
import { ALERTS_CURSOR_MAX_LENGTH, ALERTS_SORT_FIELDS } from '../../common/constants';

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

  it.each([
    ['sortOrder', ['asc', 'desc', 'ASC', 'Desc']],
    ['sortString', ['start_time', 'monitor_name.keyword', 'state', 'severity']],
    ['severityLevels', ['1', '5', '1,2,3,4,5', '3,1']],
    [
      'alertStates',
      ['ACTIVE', 'ACKNOWLEDGED,COMPLETED', 'ACTIVE,ACKNOWLEDGED,COMPLETED,ERROR,DELETED'],
    ],
    [
      'searchString',
      [
        '',
        'win*',
        'a* b\\:c* d*',
        "my_detector* win.log* o'neil*",
        'größe_über* 日本語* café*',
        'a'.repeat(256),
      ],
    ],
  ])('accepts valid %s values', (param, values) => {
    const validation = getAlertsQueryValidation();
    values.forEach((value) => {
      expect(validation.validate({ [param]: value })).toEqual({ [param]: value });
    });
  });

  it.each([
    ['sortOrder', ['descending', 'up', '']],
    [
      'sortString',
      [
        'last_notification_time',
        'trigger_name.keyword',
        'end_time',
        'detector_id',
        'monitor_name',
        'start_time,severity',
        '_score',
        '',
      ],
    ],
    ['severityLevels', ['0', '6', '1,', ',1', '1,,2', '1 2', 'high', '']],
    ['alertStates', ['active', 'ACTIVE,', 'ACTIVE;DELETED', 'UNKNOWN', 'ACTIVE ,ERROR', '']],
    [
      'searchString',
      ['a OR b-c', 'name:(x)', '"quoted"', 'a~2', '/regex/', 'a?', 'a&&b', 'a\tb', 'a'.repeat(257)],
    ],
  ])('rejects invalid %s values', (param, values) => {
    const validation = getAlertsQueryValidation();
    values.forEach((value) => {
      expect(() => validation.validate({ [param]: value })).toThrow();
    });
  });

  it('accepts the cursor paging params', () => {
    const validation = getAlertsQueryValidation();
    const query = {
      paging: 'cursor',
      searchAfter: 'eyJ2IjoxfQ_-',
      direction: 'prev',
      size: '100',
    };

    expect(validation.validate(query)).toEqual({ ...query, size: 100 });
    expect(validation.validate({ paging: 'cursor', direction: 'next' })).toEqual({
      paging: 'cursor',
      direction: 'next',
    });
    expect(validation.validate({ searchAfter: 'a'.repeat(ALERTS_CURSOR_MAX_LENGTH) })).toEqual({
      searchAfter: 'a'.repeat(ALERTS_CURSOR_MAX_LENGTH),
    });
  });

  it.each([
    ['paging', ['offset', 'CURSOR', '', 'cursor,offset']],
    [
      'searchAfter',
      ['', 'abc=', 'a+b', 'a/b', 'a b', 'a.b', '{"v":1}', 'a'.repeat(ALERTS_CURSOR_MAX_LENGTH + 1)],
    ],
    ['direction', ['forward', 'NEXT', 'previous', '']],
  ])('rejects invalid %s values', (param, values) => {
    const validation = getAlertsQueryValidation();
    values.forEach((value) => {
      expect(() => validation.validate({ [param]: value })).toThrow();
    });
  });

  it('accepts exactly the alert sort fields of the backend', () => {
    expect(ALERTS_SORT_FIELDS).toEqual(['start_time', 'monitor_name.keyword', 'state', 'severity']);
  });

  it('accepts sizes and start indexes within the max result window', () => {
    const validation = getAlertsQueryValidation();

    expect(validation.validate({ size: '0', startIndex: '0' })).toEqual({ size: 0, startIndex: 0 });
    expect(validation.validate({ size: '10000', startIndex: '9990' })).toEqual({
      size: 10000,
      startIndex: 9990,
    });
  });

  it.each([[{ size: '10001' }], [{ size: '-1' }], [{ startIndex: '-1' }], [{ size: 'ten' }]])(
    'rejects the size or start index %p',
    (query) => {
      expect(() => getAlertsQueryValidation().validate(query)).toThrow();
    }
  );
});
