/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { IRuleService } from '../../types';

export class RuleStore {
  private _rules: Rule;
  constructor(private readonly rulesService: IRuleService) {}
}
