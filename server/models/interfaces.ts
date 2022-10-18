import { Rules } from '../../models/interfaces';
import RulesService from '../services/ruleService';

export interface DefaultHeaders {
  'Content-Type': 'application/json';
  Accept: 'application/json';
}

export interface SecurityAnalyticsApi {
  [API_ROUTE: string]: string;
}

export interface NodeServices {
  rulesService: RulesService;
}

export interface CreateRuleParams {
  body: Rules;
}

export interface CreateRulesResponse {
  _id: string;
  _version: number;
  rules: {
    rules: Rules & {
      last_update_time: number;
      monitor_id: string;
      rule_topic_index: string;
    };
  };
}
