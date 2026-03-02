/*
 * Copyright Wazuh Inc.
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { NotificationsStart } from 'opensearch-dashboards/public';
import {
  PolicyItem,
  SearchPoliciesResponse,
  SearchPolicyOptions,
  UpdatePolicyRequestBody,
  UpdatePolicyResponse,
} from '../../types';
import PoliciesService from '../services/PoliciesService';
import { errorNotificationToast } from '../utils/helpers';

export interface PoliciesSearchParams {
  from?: number;
  size?: number;
  sort?: any;
  query?: any;
  _source?: any;
}

export class PoliciesStore {
  constructor(private service: PoliciesService, private notifications: NotificationsStart) {}

  public async searchPolicies(
    space: string,
    options: SearchPolicyOptions
  ): Promise<SearchPoliciesResponse> {
    const response = await this.service.searchPolicies(space, options);
    if (!response.ok) {
      if (
        response.error?.includes('index_not_found_exception') ||
        response.error?.includes('no such index')
      ) {
        return { total: 0, items: [] };
      }
      errorNotificationToast(this.notifications, 'retrieve', 'policies', response.error);
      return { total: 0, items: [] };
    }

    const items: PolicyItem[] = response.response.items.map((item) => ({
      ...item,
    }));

    return { ...response.response, items };
  }

  public async getPolicy(policyId: string): Promise<PolicyItem | undefined> {
    const response = await this.service.getPolicy(policyId);
    if (!response.ok) {
      if (
        response.error?.includes('index_not_found_exception') ||
        response.error?.includes('no such index')
      ) {
        return undefined;
      }
      errorNotificationToast(this.notifications, 'retrieve', 'policy', response.error);
      return undefined;
    }

    const item = response.response.item;
    if (!item) {
      return undefined;
    }

    return {
      ...item,
    };
  }

  public async updatePolicy(
    policyId: string,
    data: UpdatePolicyRequestBody
  ): Promise<[boolean, UpdatePolicyResponse['response']]> {
    const response = await this.service.updatePolicy(policyId, data);
    if (!response.ok) {
      errorNotificationToast(this.notifications, 'update', 'policy', response.error);
    }
    return [response.ok, response.response];
  }
}
