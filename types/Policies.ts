/*
 * Copyright Wazuh Inc.
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { IntegrationBase } from './Integrations';

export interface PolicySpace {
  name: string;
  hash: PolicyHash;
}

export interface PolicyHash {
  sha256: string;
}

export interface PolicyDocument {
  author: string;
  date: string;
  description: string;
  documentation: string;
  id: string;
  integrations: string[];
  modified: string;
  references: [string];
  root_decoder: string;
  title: string;
}

export interface PolicySource {
  document: PolicyDocument;
  hash?: PolicyHash;
  space?: PolicySpace;
}

export interface PolicyItem extends PolicySource {
  id: string;
  integrationsMap?: Record<string, IntegrationBase & { _id: string }>;
}

export interface SearchPolicyOptions {
  from?: number;
  size?: number;
  sort?: any;
  query?: any;
  _source?: any;
  includeIntegrationFields?: string[]; // specify which fields of the integrations to include in the response
}
export interface SearchPoliciesResponse {
  total: number;
  items: PolicyItem[];
}

export interface GetPolicyResponse {
  item?: PolicyItem;
}

export interface UpdatePolicyRequestBody {}

export interface UpdatePolicyResponse {
  ok: boolean;
  response: any; // TODO: enhance this type when we have a better understanding of the response structure
}
