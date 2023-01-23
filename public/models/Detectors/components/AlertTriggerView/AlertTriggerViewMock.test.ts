/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { RuleInfo, RuleSource } from '../../../../../server/models/interfaces';
import { alertConditionMock, detectorMock } from '../../InterfacesMock.test';

const ruleSource: RuleSource = {
  rule: 'ruleName',
  last_update_time: '12/12/2022',
  queries: [{ value: '.windows' }],
};

const ruleInfo: RuleInfo = {
  _id: 'ruleId',
  _index: '.windows',
  _primary_term: 1,
  _source: ruleSource,
  _version: 1,
};

export default {
  alertTrigger: alertConditionMock,
  orderPosition: 1,
  detector: detectorMock,
  notificationChannels: [],
  rules: { rileId: ruleInfo },
};
