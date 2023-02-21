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
  GetAllRuleCategoriesResponse,
  GetRulesParams,
  GetRulesResponse,
  UpdateRuleParams,
  UpdateRuleResponse,
} from '../models/interfaces';
import { CLIENT_RULE_METHODS } from '../utils/constants';
import { Rule } from '../../models/interfaces';
import { ServerResponse } from '../models/types';
import { load, safeDump } from 'js-yaml';
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
      console.log(jsonPayload);
      const ruleYamlPayload = safeDump(jsonPayload);
      console.log(ruleYamlPayload);

      const params: CreateRuleParams = { body: ruleYamlPayload, category };
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
      console.log(jsonPayload);

      const ruleYamlPayload = safeDump(jsonPayload);

      console.log(ruleYamlPayload);

      const params: UpdateRuleParams = { body: ruleYamlPayload, category, ruleId };
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

  /**
   * Calls backend GET Categories API
   */
  getAllRuleCategories = async (
    _context: RequestHandlerContext,
    request: OpenSearchDashboardsRequest,
    response: OpenSearchDashboardsResponseFactory
  ): Promise<
    IOpenSearchDashboardsResponse<ServerResponse<GetAllRuleCategoriesResponse> | ResponseError>
  > => {
    try {
      const { callAsCurrentUser: callWithRequest } = this.osDriver.asScoped(request);
      const getAllRuleCategoriesResponse: GetAllRuleCategoriesResponse = await callWithRequest(
        CLIENT_RULE_METHODS.GET_ALL_RULE_CATEGORIES
      );

      return response.custom({
        statusCode: 200,
        body: {
          ok: true,
          response: getAllRuleCategoriesResponse,
        },
      });
    } catch (error: any) {
      console.error('Security Analytics - RulesService - getAllRuleCategories:', error);
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
