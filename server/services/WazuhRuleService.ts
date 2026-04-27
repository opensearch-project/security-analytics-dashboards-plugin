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
import { CLIENT_RULE_METHODS, CONTENT_INDICES } from '../utils/constants';
import { ServerResponse } from '../models/types';
import { load } from 'js-yaml';
import { Rule } from '../../types';
import { SpaceTypes } from '../../common/constants';

export default class WazuhRulesService {
  constructor(private osDriver: ILegacyCustomClusterClient) {}

  private getClient(request: OpenSearchDashboardsRequest) {
    return this.osDriver.asScoped(request).callAsCurrentUser;
  }

  private getSpaceFromPrePackaged(prePackaged: boolean): string {
    return prePackaged === false ? SpaceTypes.CUSTOM.value : SpaceTypes.STANDARD.value;
  }

  private buildQuery(prePackaged: boolean, incomingQuery?: any, space?: string) {
    // When an explicit space is provided it takes precedence over the prePackaged binary model
    const bool: any = {
      filter: [{ term: { 'space.name': space ?? this.getSpaceFromPrePackaged(prePackaged) } }],
    };

    if (incomingQuery && !incomingQuery.match_all) {
      bool.must = [incomingQuery];
    }

    return { bool };
  }

  private parseYamlField(yamlStr: string | undefined): any {
    if (!yamlStr || (typeof yamlStr === 'string' && !yamlStr.trim())) return undefined;
    if (typeof yamlStr !== 'string') return yamlStr;
    try {
      return load(yamlStr);
    } catch {
      return undefined;
    }
  }

  private buildRuleResource(rule: Rule) {
    const resource: Record<string, any> = {
      level: rule.level,
      status: rule.status,
      logsource:
        rule.log_source && Object.keys(rule.log_source).length > 0
          ? rule.log_source
          : { product: rule.category },
      detection: load(rule.detection),
      enabled: rule.enabled ?? true,
    };
    if (rule.tags?.length) resource.tags = rule.tags.map((t) => t.value);
    if (rule.false_positives?.length)
      resource.falsepositives = rule.false_positives.map((fp) => fp.value);

    const metadata: Record<string, any> = {
      title: rule.metadata?.title || rule.title,
      author: rule.metadata?.author || rule.author,
      description: rule.metadata?.description || rule.description,
      references: rule.metadata?.references?.length
        ? rule.metadata.references
        : rule.references?.map((r) => r.value) ?? [],
    };
    if (rule.metadata?.date) metadata.date = rule.metadata.date;
    if (rule.metadata?.modified) metadata.modified = rule.metadata.modified;
    if (rule.metadata?.documentation) metadata.documentation = rule.metadata.documentation;
    if (rule.metadata?.supports?.length) metadata.supports = rule.metadata.supports;
    resource.metadata = metadata;

    const mitre = this.parseYamlField(rule.mitre);
    if (mitre) resource.mitre = mitre;

    const compliance = this.parseYamlField(rule.compliance);
    if (compliance) resource.compliance = compliance;

    return resource;
  }

  private async fetchIntegrationMap(client: any, ruleIds: string[], space: string) {
    const integrationMap = new Map();
    if (!ruleIds.length) return integrationMap;

    try {
      const integrationResponse = await client('search', {
        index: CONTENT_INDICES.INTEGRATIONS,
        body: {
          size: 10000,
          query: {
            bool: {
              must: [
                {
                  terms: {
                    'document.rules': ruleIds,
                  },
                },
                {
                  term: {
                    'space.name': space,
                  },
                },
              ],
            },
          },
          _source: ['document.id', 'document.metadata.title', 'document.rules'],
        },
      });
      const integrationHits = integrationResponse?.hits?.hits || [];
      integrationHits.forEach((integrationHit: any) => {
        const rules = integrationHit?._source?.document?.rules || [];
        rules.forEach((ruleId: string) => {
          if (!integrationMap.has(ruleId)) {
            integrationMap.set(ruleId, {
              document: {
                metadata: integrationHit._source.document.metadata,
                id: integrationHit._source.document.id,
              },
            });
          }
        });
      });
    } catch (error: any) {
      console.warn('Security Analytics - WazuhRulesService - fetchIntegrationMap:', error?.message);
    }

    return integrationMap;
  }

  getRules = async (
    context: RequestHandlerContext,
    request: OpenSearchDashboardsRequest<{}, GetRulesParams>,
    response: OpenSearchDashboardsResponseFactory
  ): Promise<IOpenSearchDashboardsResponse<ServerResponse<GetRulesResponse> | ResponseError>> => {
    try {
      const { prePackaged, space } = request.query as {
        prePackaged: boolean;
        space?: string;
      };

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
        index: CONTENT_INDICES.RULES,
        body: searchBody,
      });

      const ruleHits = searchResponse?.hits?.hits || [];
      const ruleIds = ruleHits.map((hit: any) => hit._source?.document?.id || hit.document?.id);
      const integrationMap = await this.fetchIntegrationMap(
        client,
        ruleIds,
        space ?? this.getSpaceFromPrePackaged(prePackaged)
      );
      const enrichedHits = ruleHits.map((hit: any) => ({
        ...hit,
        integration: integrationMap.get(hit._source?.document?.id || hit.document?.id) || null,
      }));

      const enrichedResponse = {
        ...searchResponse,
        hits: {
          ...searchResponse.hits,
          hits: enrichedHits,
        },
      };

      return response.custom({
        statusCode: 200,
        body: {
          ok: true,
          response: enrichedResponse,
        },
      });
    } catch (error: any) {
      console.error('Security Analytics - RulesService - getRules:', error);
      return response.custom({
        statusCode: 200,
        body: { ok: false, error: error.message },
      });
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
        body: {
          resource: this.buildRuleResource(rule),
          integration: integrationId,
        },
      });

      return response.custom({
        statusCode: 200,
        body: { ok: true, response: createResponse },
      });
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

      return response.custom({
        statusCode: 200,
        body: { ok: true, response: updateResponse },
      });
      return response.custom({
        statusCode: 200,
        body: { ok: true, response: updateResponse },
      });
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

      return response.custom({
        statusCode: 200,
        body: { ok: true, response: {} },
      });
      return response.custom({
        statusCode: 200,
        body: { ok: true, response: {} },
      });
    } catch (error) {
      console.error('Security Analytics - RulesService - deleteRule:', error);
      return response.custom({
        statusCode: 200,
        body: { ok: false, error: error.message },
      });
      return response.custom({
        statusCode: 200,
        body: { ok: false, error: error.message },
      });
    }
  };
}
