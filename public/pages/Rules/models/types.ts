/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { Rule } from '../../../../models/interfaces';
import { RuleInfo } from '../../../../server/models/interfaces';

export type RuleItemInfoBase = RuleInfo & { prePackaged: boolean };

export type RulePayload = Omit<Rule, 'category'>;
