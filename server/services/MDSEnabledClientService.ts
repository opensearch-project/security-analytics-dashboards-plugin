/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  ILegacyCustomClusterClient,
  OpenSearchDashboardsRequest,
} from 'opensearch-dashboards/server';
import { RequestHandlerContext } from '../../../../src/core/server';

export abstract class MDSEnabledClientService {
  constructor(private osDriver: ILegacyCustomClusterClient, private dataSourceEnabled: boolean) {}

  protected getClient(request: OpenSearchDashboardsRequest, context: RequestHandlerContext) {
    const dataSourceId = (request.query as any).dataSourceId;

    return this.dataSourceEnabled && dataSourceId
      ? context.dataSource.opensearch.legacy.getClient(dataSourceId.toString()).callAPI
      : this.osDriver.asScoped(request).callAsCurrentUser;
  }
}
