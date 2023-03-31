/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { DataStore } from './DataStore';
import notificationsStartMock from '../../test/mocks/services/notifications/NotificationsStart.mock';
import services from '../../test/mocks/services';
import { RulesStore } from './RulesStore';
import { expect } from '@jest/globals';
import * as rulesResponseMock from '../../cypress/fixtures/sample_rule.json';
describe('Rules store specs', () => {
  Object.assign(services, {
    ruleService: {
      getRules: () => Promise.resolve(rulesResponseMock),
      deleteRule: () => Promise.resolve(true),
    },
  });

  DataStore.init(services, notificationsStartMock);

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('rules store should be created', () => {
    expect(DataStore.rules instanceof RulesStore).toBe(true);
  });

  it('getRules should return an array', async () => {
    const serviceSpy = jest.spyOn(DataStore.rules.service, 'getRules');

    // first call
    const rules = await DataStore.rules.getPrePackagedRules();
    expect(rules.length).toStrictEqual(2);

    // second call
    await DataStore.rules.getPrePackagedRules();

    // service.getRules is called only once as the second time is returned from the cache
    expect(serviceSpy).toBeCalledTimes(1);
  });

  it('getAllRules should call getRules', async () => {
    const getRulesSpy = jest
      .spyOn(DataStore.rules, 'getRules')
      .mockReturnValue(Promise.resolve([]));

    await DataStore.rules.getAllRules();

    expect(getRulesSpy).toBeCalledTimes(2);
  });
});
