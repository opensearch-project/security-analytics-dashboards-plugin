/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { RuleInfo } from '../../../../server/models/interfaces';

export type RuleItemInfoBase = RuleInfo & { prePackaged: boolean };
