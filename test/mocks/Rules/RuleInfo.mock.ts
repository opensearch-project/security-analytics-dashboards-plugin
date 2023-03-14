/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import ruleSourceMock from './RuleSource.mock';
import { RuleItemInfoBase } from '../../../types';

export default {
  id: 'rule_id_1',
  _id: 'rule_id_1',
  _index: '.windows',
  _primary_term: 1,
  _source: ruleSourceMock,
  _version: 1,
  prePackaged: true,
} as RuleItemInfoBase;
