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
import { ServerResponse } from '../models/types';
import { load, safeDump } from 'js-yaml';
import moment from 'moment';
import { Rule } from '../../types';
import { DEFAULT_RULE_UUID } from '../../common/constants';
import { MDSEnabledClientService } from './MDSEnabledClientService';

export default class RulesService extends MDSEnabledClientService {
  /**
   * Calls backend POST Rules API.
   */
  createRule = async (
    context: RequestHandlerContext,
    request: OpenSearchDashboardsRequest,
    response: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<ServerResponse<CreateRuleResponse> | ResponseError>> => {
    try {
      const {
        id,
        title,
        category,
        description,
        detection,
        status,
        author,
        references,
        tags,
        level,
        false_positives,
      } = request.body as Rule;
      const today = moment(moment.now()).format('YYYY/MM/DD');
      const jsonPayload: { [field: string]: any } = {
        id: id || DEFAULT_RULE_UUID,
        title,
        description: description || title,
        status,
        author,
        date: today,
        modified: today,
        logsource: {
          category,
        },
        level,
        detection: load(detection),
      };
      if (tags.length > 0) {
        jsonPayload['tags'] = tags.map((tag) => tag.value);
      }
      if (references.length > 0) {
        jsonPayload['references'] = references.map((ref) => ref.value);
      }
      if (false_positives.length > 0) {
        jsonPayload['falsepositives'] = false_positives.map((falsePos) => falsePos.value);
      }
      const ruleYamlPayload = safeDump(jsonPayload);

      const params: CreateRuleParams = {
        body: ruleYamlPayload,
        category: encodeURIComponent(category),
      };
      const client = this.getClient(request, context);
      const createRuleResponse: CreateRuleResponse = await client(
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
    context: RequestHandlerContext,
    request: OpenSearchDashboardsRequest<{}, GetRulesParams>,
    response: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<ServerResponse<GetRulesResponse> | ResponseError>> => {
    try {
      const { prePackaged } = request.query;
      const params: GetRulesParams = {
        prePackaged,
        body: request.body,
      };
      const client = this.getClient(request, context);
      const getRuleResponse: GetRulesResponse = await client(CLIENT_RULE_METHODS.GET_RULES, params);

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
    context: RequestHandlerContext,
    request: OpenSearchDashboardsRequest<DeleteRuleParams, {}>,
    response: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<ServerResponse<DeleteRuleResponse> | ResponseError>> => {
    try {
      const client = this.getClient(request, context);
      const deleteRuleResponse: DeleteRuleResponse = await client(
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
    context: RequestHandlerContext,
    request: OpenSearchDashboardsRequest,
    response: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<ServerResponse<UpdateRuleResponse> | ResponseError>> => {
    try {
      const {
        id,
        title,
        category,
        description,
        detection,
        status,
        author,
        references,
        tags,
        level,
        false_positives,
      } = request.body as Rule;
      const today = moment(moment.now()).format('YYYY/MM/DD');
      const { ruleId } = request.params as { ruleId: string };
      const jsonPayload: { [field: string]: any } = {
        id,
        title,
        description: description || title,
        status,
        author,
        date: today,
        modified: today,
        logsource: {
          category,
        },
        level,
        detection: load(detection),
      };
      if (tags.length > 0) {
        jsonPayload['tags'] = tags.map((tag) => tag.value);
      }
      if (references.length > 0) {
        jsonPayload['references'] = references.map((ref) => ref.value);
      }
      if (false_positives.length > 0) {
        jsonPayload['falsepositives'] = false_positives.map((falsePos) => falsePos.value);
      }

      const ruleYamlPayload = safeDump(jsonPayload);
      const params: UpdateRuleParams = { body: ruleYamlPayload, category, ruleId };
      const client = this.getClient(request, context);
      const createRuleResponse: UpdateRuleResponse = await client(
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
