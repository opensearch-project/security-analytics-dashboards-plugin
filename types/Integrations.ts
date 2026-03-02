/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { RuleItemInfoBase } from './Rule';

export interface IntegrationWithRules extends Integration {
  detectionRules: RuleItemInfoBase[];
}

export interface IntegrationItem extends Integration {
  detectionRulesCount: number;
  decodersCount: number;
  kvdbsCount: number;
}

export interface Integration {
  id: string;
  document: IntegrationBase['document'];
  space: IntegrationBase['space'];
}

export interface IntegrationBase {
  document: {
    id: string;
    title: string;
    author: string;
    date: string;
    description: string;
    category: string;
    references?: string[];
    tags: {
      correlation_id: number;
    } | null;
    decoders?: string[];
    kvdbs?: string[];
    references?: string[];
    documentation?: string;
  };
  space: {
    name: string;
  };
}

export interface SearchIntegrationsResponse {
  hits: {
    hits: {
      _id: string;
      _source: IntegrationBase;
    }[];
  };
}

export interface CreateIntegrationRequestBody extends IntegrationBase {}

export interface CreateIntegrationResponse {
  _id: string;
  integration: IntegrationBase;
}

export interface UpdateIntegrationParams {
  integrationId: string;
  body: { resource: IntegrationBase['document'] };
}

export interface UpdateIntegrationResponse {
  _id: string;
  integration: IntegrationBase;
}

export interface DeleteIntegrationParams {
  integrationId: string;
}

export interface DeleteIntegrationResponse {}

export interface PromoteIntegrationResponse {}

export type UserSpace = 'draft' | 'test' | 'custom';
export type PromoteSpaces = Omit<UserSpace, 'custom'>; // TODO: use the centralized items on constants instead
export type PromoteNextSpaces = Omit<UserSpace, 'draft'>; // TODO: use the centralized items on constants instead
export type NonUserSpace = 'standard';
export type Space = UserSpace | NonUserSpace;

export type PromoteOperations = 'update' | 'add' | 'delete';
export type PromoteOperationsPolicy = 'update';

export interface PromoteChanges {
  policy: { operation: PromoteOperationsPolicy; id: string }[];
  integrations: { operation: PromoteOperations; id: string }[];
  kvdbs: { operation: PromoteOperations; id: string }[];
  decoders: { operation: PromoteOperations; id: string }[];
  filters: { operation: PromoteOperations; id: string }[];
}

export type PromoteChangeGroup = keyof PromoteChanges;
export interface PromoteIntegrationRequestBody {
  space: PromoteSpaces;
  changes: PromoteChanges;
}

export interface GetPromote {
  space: PromoteSpaces;
}

interface PromoteAvailablePromotionsMap {
  [key: string]: string;
}

export interface GetPromoteBySpaceResponse {
  ok: boolean;
  response: {
    promote: PromoteIntegrationRequestBody;
    available_promotions: {
      integrations: PromoteAvailablePromotionsMap;
      decoders: PromoteAvailablePromotionsMap;
      kvdbs: PromoteAvailablePromotionsMap;
    };
  };
}
