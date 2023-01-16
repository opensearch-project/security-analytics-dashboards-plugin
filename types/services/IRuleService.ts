/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { ServerResponse } from './ServerResponse';
import {
  CreateRuleResponse,
  DeleteRuleResponse,
  GetRulesResponse,
  Rule,
  UpdateRuleResponse,
} from '../Rule';

export interface IRuleService {
  getRules(prePackaged: boolean, body: any): Promise<ServerResponse<GetRulesResponse>>;
  createRule(rule: Rule): Promise<ServerResponse<CreateRuleResponse>>;
  updateRule(
    ruleId: string,
    category: string,
    rule: Rule
  ): Promise<ServerResponse<UpdateRuleResponse>>;
  deleteRule(ruleId: string): Promise<ServerResponse<DeleteRuleResponse>>;
}
