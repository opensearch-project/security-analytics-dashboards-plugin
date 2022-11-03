/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  OpenSearchDashboardsRequest,
  OpenSearchDashboardsResponseFactory,
  IOpenSearchDashboardsResponse,
  ResponseError,
  RequestHandlerContext,
  ILegacyCustomClusterClient,
} from 'opensearch-dashboards/server';
import {
  CreateRuleParams,
  CreateRuleResponse,
  DeleteRuleParams,
  DeleteRuleResponse,
  GetRulesParams,
  GetRulesResponse,
  UpdateRuleParams,
  UpdateRuleResponse,
} from '../models/interfaces';
import { CLIENT_RULE_METHODS } from '../utils/constants';
import { Rule } from '../../models/interfaces';
import { ServerResponse } from '../models/types';
import { safeDump } from 'js-yaml';
import moment from 'moment';

export default class RulesService {
  osDriver: ILegacyCustomClusterClient;

  constructor(osDriver: ILegacyCustomClusterClient) {
    this.osDriver = osDriver;
  }

  /**
   * Calls backend POST Rules API.
   */

  createRule = async (
    _context: RequestHandlerContext,
    request: OpenSearchDashboardsRequest,
    response: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<ServerResponse<CreateRuleResponse> | ResponseError>> => {
    try {
      const {
        id,
        title,
        description,
        detection,
        status,
        author,
        references,
        tags,
        log_source,
        level,
        false_positives,
      } = request.body as Rule;
      const today = moment(moment.now()).format('YYYY/MM/DD');
      const jsonPayload = {
        id,
        title,
        description,
        status,
        author,
        date: today,
        modified: today,
        references: references.map((ref) => ref.value),
        tags: tags.map((tag) => tag.value),
        logsource: {
          product: log_source,
          service: log_source,
        },
        level,
        falsepositives: false_positives.map((falsePos) => falsePos.value),
        detection: JSON.parse(detection),
      };
      console.log(jsonPayload);
      const ruleYamlPayload = safeDump(jsonPayload);

      const params: CreateRuleParams = { body: ruleYamlPayload, category: log_source };
      const { callAsCurrentUser: callWithRequest } = this.osDriver.asScoped(request);
      const createRuleResponse: CreateRuleResponse = await callWithRequest(
        CLIENT_RULE_METHODS.CREATE_RULE,
        params
      );

      return response.custom({
        statusCode: 200,
        body: {
          ok: true,
          response: createRuleResponse,
        },
      });
    } catch (error: any) {
      console.error('Security Analytics - RulesService - createRule:', error);
      return response.custom({
        statusCode: 200,
        body: {
          ok: false,
          error: error.message,
        },
      });
    }
  };

  getRules = async (
    _context: RequestHandlerContext,
    request: OpenSearchDashboardsRequest<{}, GetRulesParams>,
    response: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<ServerResponse<GetRulesResponse> | ResponseError>> => {
    try {
      const { prePackaged } = request.query;
      const params: GetRulesParams = {
        prePackaged,
        body: request.body,
      };
      console.log(`Making get rules req: ${params}`);
      const { callAsCurrentUser: callWithRequest } = this.osDriver.asScoped(request);
      const getRuleResponse: GetRulesResponse = await callWithRequest(
        CLIENT_RULE_METHODS.GET_RULES,
        params
      );

      return response.custom({
        statusCode: 200,
        body: {
          ok: true,
          response: getRuleResponse,
        },
      });
    } catch (error: any) {
      console.error('Security Analytics - RulesService - getRules:', error);
      return response.custom({
        statusCode: 200,
        body: {
          ok: false,
          error: error.message,
        },
      });
    }
  };

  deleteRule = async (
    _context: RequestHandlerContext,
    request: OpenSearchDashboardsRequest<DeleteRuleParams, {}>,
    response: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<ServerResponse<DeleteRuleResponse> | ResponseError>> => {
    try {
      const { callAsCurrentUser: callWithRequest } = this.osDriver.asScoped(request);
      const deleteRuleResponse: DeleteRuleResponse = await callWithRequest(
        CLIENT_RULE_METHODS.DELETE_RULE,
        request.params
      );

      return response.custom({
        statusCode: 200,
        body: {
          ok: true,
          response: deleteRuleResponse,
        },
      });
    } catch (error: any) {
      return response.custom({
        statusCode: 200,
        body: {
          ok: false,
          error: error.message,
        },
      });
    }
  };

  /**
   * Calls backend PUT Rules API.
   */

  updateRule = async (
    _context: RequestHandlerContext,
    request: OpenSearchDashboardsRequest,
    response: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<ServerResponse<UpdateRuleResponse> | ResponseError>> => {
    try {
      const {
        id,
        title,
        description,
        detection,
        status,
        author,
        references,
        tags,
        log_source,
        level,
        false_positives,
      } = request.body as Rule;
      const today = moment(moment.now()).format('YYYY/MM/DD');
      const { ruleId } = request.params as { ruleId: string };
      const jsonPayload = {
        id,
        title,
        description,
        status,
        author,
        date: today,
        modified: today,
        references: references.map((ref) => ref.value),
        tags: tags.map((tag) => tag.value),
        logsource: {
          product: log_source,
          service: log_source,
        },
        level,
        falsepositives: false_positives.map((falsePos) => falsePos.value),
        detection: JSON.parse(detection),
      };

      console.log(jsonPayload);
      const ruleYamlPayload = safeDump(jsonPayload);

      const params: UpdateRuleParams = { body: ruleYamlPayload, category: log_source, ruleId };
      const { callAsCurrentUser: callWithRequest } = this.osDriver.asScoped(request);
      const createRuleResponse: UpdateRuleResponse = await callWithRequest(
        CLIENT_RULE_METHODS.UPDATE_RULE,
        params
      );

      return response.custom({
        statusCode: 200,
        body: {
          ok: true,
          response: createRuleResponse,
        },
      });
    } catch (error: any) {
      console.error('Security Analytics - RulesService - updateRule:', error);
      return response.custom({
        statusCode: 200,
        body: {
          ok: false,
          error: error.message,
        },
      });
    }
  };
}
