/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { DataStore } from '../../../store/DataStore';
import notificationsStartMock from '../../../../test/mocks/services/notifications/NotificationsStart.mock';
import services from '../../../../test/mocks/services';
import { RulesStore } from './RulesStore';
import { expect } from '@jest/globals';
import ruleInfoMock from '../../../../test/mocks/Rules/RuleInfo.mock';

describe('Rules store specs', () => {
  DataStore.init(services, notificationsStartMock);
  beforeEach(() => {
    DataStore.rules.invalidateCache();
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('rules store should be created', () => {
    expect(DataStore.rules instanceof RulesStore).toBe(true);
    expect(DataStore.rules.cache).toStrictEqual({});
  });

  it('invalidating store should set cache to empty object', () => {
    expect(DataStore.rules.cache).toStrictEqual({});
    DataStore.rules.cache['key'] = [ruleInfoMock];
    DataStore.rules.invalidateCache();
    expect(DataStore.rules.cache).toStrictEqual({});
  });

  it('getAllRules should call getRules', async () => {
    const getRulesSpy = jest
      .spyOn(DataStore.rules, 'getRules')
      .mockReturnValue(Promise.resolve([]));
    const validateDetectionSpy = jest.spyOn(DataStore.rules, 'validateAndAddDetection');

    await DataStore.rules.getAllRules();

    expect(getRulesSpy).toBeCalledTimes(2);
    expect(validateDetectionSpy).toBeCalledTimes(2);
  });

  it('getRules should return an array', async () => {
    const serviceSpy = jest.spyOn(DataStore.rules.service, 'getRules');

    // first call
    const rules = await DataStore.rules.getRules(true);
    expect(rules).toStrictEqual([]);

    // second call
    await DataStore.rules.getRules(true);

    // service.getRules is called only once as the second time is returned from the cache
    expect(serviceSpy).toBeCalledTimes(1);
  });
});
