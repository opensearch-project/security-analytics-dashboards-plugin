/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { CLUSTER } from '../utils/constants';
import { CoreSetup } from 'opensearch-dashboards/server';
import { securityAnalyticsPlugin } from './securityAnalyticsPlugin';

export function createSecurityAnalyticsCluster(core: CoreSetup) {
  return core.opensearch.legacy.createClient(CLUSTER.SA, {
    plugins: [securityAnalyticsPlugin],
  });
}
