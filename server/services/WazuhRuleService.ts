/*
 * Copyright Wazuh Inc.
 * SPDX-License-Identifier: AGPL-3.0-or-later
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
  DeleteRuleParams,
  DeleteRuleResponse,
  GetRulesParams,
  GetRulesResponse,
} from '../models/interfaces';
import { CLIENT_RULE_METHODS } from '../utils/constants';
import { ServerResponse } from '../models/types';
import { load } from 'js-yaml';
import { Rule } from '../../types';

const RULES_INDEX = '.cti-rules';
const STANDARD_SPACE_TERM = { term: { 'space.name': 'standard' } };

export default class WazuhRulesService {
  constructor(private osDriver: ILegacyCustomClusterClient) {}

  private getClient(request: OpenSearchDashboardsRequest) {
    return this.osDriver.asScoped(request).callAsCurrentUser;
  }

  private buildQuery(prePackaged: boolean, incomingQuery?: any, space?: string) {
    // When an explicit space is provided it takes precedence over the prePackaged binary model
    const bool: any = space
      ? { filter: [{ term: { 'space.name': space } }] }
      : prePackaged === false
      ? { must_not: [STANDARD_SPACE_TERM] }
      : { filter: [STANDARD_SPACE_TERM] };

    if (incomingQuery && !incomingQuery.match_all) {
      bool.must = [incomingQuery];
    }

    return { bool };
  }

  private buildRuleResource(rule: Rule) {
    const resource: Record<string, any> = {
      title: rule.title,
      description: rule.description,
      author: rule.author,
      level: rule.level,
      status: rule.status,
      logsource:
        rule.log_source && Object.keys(rule.log_source).length > 0
          ? rule.log_source
          : { category: rule.category },
      detection: load(rule.detection),
    };
    if (rule.references?.length) resource.references = rule.references.map((r) => r.value);
    if (rule.tags?.length) resource.tags = rule.tags.map((t) => t.value);
    if (rule.false_positives?.length)
      resource.falsepositives = rule.false_positives.map((fp) => fp.value);
    return resource;
  }

  getRules = async (
    context: RequestHandlerContext,
    request: OpenSearchDashboardsRequest<{}, GetRulesParams>,
    response: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<ServerResponse<GetRulesResponse> | ResponseError>> => {
    try {
      const { prePackaged, space } = request.query as { prePackaged: boolean; space?: string };
      const { from = 0, size = 5000, query, sort } = (request.body as any) ?? {};
      const client = this.getClient(request);
      const searchBody: any = {
        from,
        size,
        track_total_hits: true,
        query: this.buildQuery(prePackaged, query, space),
      };
      if (sort) searchBody.sort = sort;
      const searchResponse = await client('search', {
        index: RULES_INDEX,
        body: searchBody,
      });

      return response.custom({
        statusCode: 200,
        body: {
          ok: true,
          response: searchResponse,
        },
      });
    } catch (error: any) {
      console.error('Security Analytics - RulesService - getRules:', error);
      return response.custom({ statusCode: 200, body: { ok: false, error: error.message } });
    }
  };

  createRule = async (
    context: RequestHandlerContext,
    request: OpenSearchDashboardsRequest,
    response: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<ServerResponse<any> | ResponseError>> => {
    try {
      const { document: rule, integrationId } = request.body as {
        document: Rule;
        integrationId: string;
      };
      if (!rule)
        return response.custom({
          statusCode: 200,
          body: { ok: false, error: 'Rule document is required' },
        });

      const client = this.getClient(request);

      const createResponse = await client(CLIENT_RULE_METHODS.CREATE_RULE, {
        body: { resource: this.buildRuleResource(rule), integration: integrationId },
      });

      return response.custom({ statusCode: 200, body: { ok: true, response: createResponse } });
    } catch (error: any) {
      console.error('Security Analytics - RulesService - createRule:', error);
      return response.custom({
        statusCode: 200,
        body: { ok: false, error: error?.body?.message || error.message },
      });
    }
  };

  updateRule = async (
    context: RequestHandlerContext,
    request: OpenSearchDashboardsRequest,
    response: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<ServerResponse<any> | ResponseError>> => {
    try {
      const { ruleId } = request.params as { ruleId: string };
      const { document: rule } = request.body as { document: Rule };
      if (!rule)
        return response.custom({
          statusCode: 200,
          body: { ok: false, error: 'Rule document is required' },
        });

      const client = this.getClient(request);
      const updateResponse = await client(CLIENT_RULE_METHODS.UPDATE_RULE, {
        ruleId,
        body: { resource: this.buildRuleResource(rule) },
      });

      return response.custom({ statusCode: 200, body: { ok: true, response: updateResponse } });
    } catch (error: any) {
      console.error('Security Analytics - RulesService - updateRule:', error);
      return response.custom({
        statusCode: 200,
        body: { ok: false, error: error?.body?.message || error.message },
      });
    }
  };

  deleteRule = async (
    context: RequestHandlerContext,
    request: OpenSearchDashboardsRequest<DeleteRuleParams, {}>,
    response: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<ServerResponse<DeleteRuleResponse> | ResponseError>> => {
    try {
      const { ruleId } = request.params;
      const client = this.getClient(request);
      await client(CLIENT_RULE_METHODS.DELETE_RULE, { ruleId });

      return response.custom({ statusCode: 200, body: { ok: true, response: {} } });
    } catch (error) {
      console.error('Security Analytics - RulesService - deleteRule:', error);
      return response.custom({ statusCode: 200, body: { ok: false, error: error.message } });
    }
  };
}
