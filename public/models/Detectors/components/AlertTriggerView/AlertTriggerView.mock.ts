/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { RuleInfo, RuleSource } from '../../../../../server/models/interfaces';
import { mockAlertCondition, mockDetector } from '../../../Interfaces.mock';

const mockRuleSource: RuleSource = {
  rule: 'ruleName',
  last_update_time: '12/12/2022',
  queries: [{ value: '.windows' }],
};

const mockRuleInfo: RuleInfo = {
  _id: 'ruleId',
  _index: '.windows',
  _primary_term: 1,
  _source: mockRuleSource,
  _version: 1,
};

export default {
  alertTrigger: mockAlertCondition,
  orderPosition: 1,
  detector: mockDetector,
  notificationChannels: [],
  rules: { rileId: mockRuleInfo },
};
