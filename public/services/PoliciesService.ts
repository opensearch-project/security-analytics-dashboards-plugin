/*
 * Copyright Wazuh Inc.
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { HttpSetup } from 'opensearch-dashboards/public';
import { API } from '../../server/utils/constants';
import { ServerResponse } from '../../server/models/types';
import {
  GetPolicyResponse,
  PolicyDocument,
  SearchPoliciesResponse,
  SearchPolicyOptions,
  UpdatePolicyResponse,
} from '../../types';

export default class PoliciesService {
  httpClient: HttpSetup;

  constructor(httpClient: HttpSetup) {
    this.httpClient = httpClient;
  }

  searchPolicies = async (
    space: string,
    options: SearchPolicyOptions = {}
  ): Promise<ServerResponse<SearchPoliciesResponse>> => {
    const url = `..${API.POLICIES_BASE}/_search`;

    const query = { space };
    return (await this.httpClient.post(url, {
      query,
      body: JSON.stringify(options),
    })) as ServerResponse<SearchPoliciesResponse>;
  };

  getPolicy = async (policyId: string): Promise<ServerResponse<GetPolicyResponse>> => {
    const url = `..${API.POLICIES_BASE}/${policyId}`;

    return (await this.httpClient.get(url, {})) as ServerResponse<GetPolicyResponse>;
  };

  updatePolicy = async (
    policyId: string,
    policyDocumentData: PolicyDocument
  ): Promise<ServerResponse<UpdatePolicyResponse>> => {
    const url = `..${API.POLICIES_BASE}/${policyId}`;

    return (await this.httpClient.put(url, {
      body: JSON.stringify(policyDocumentData),
    })) as ServerResponse<UpdatePolicyResponse>;
  };
}
