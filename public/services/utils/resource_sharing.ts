/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { getApplication } from './constants';

/**
 * Resource types registered by the security-analytics backend plugin with the
 * security plugin's resource-sharing framework
 * (SecurityAnalyticsResourceSharingExtension).
 */
export const SA_DETECTOR_RESOURCE_TYPE = 'detector';
export const SA_CORRELATION_RULE_RESOURCE_TYPE = 'correlation-rule';

/**
 * Whether resource sharing is available for the given security-analytics
 * resource type, via the core capability registered by
 * security-dashboards-plugin. False when that plugin is not installed, the
 * feature is disabled, or the type is not registered — no plugin dependency
 * involved.
 */
export function isResourceSharingAvailable(resourceType: string): boolean {
  try {
    const caps = (getApplication().capabilities as any)?.resourceSharing;
    if (!caps?.enabled) return false;
    const types: string = caps.availableTypes ?? '';
    return types.split(',').includes(resourceType);
  } catch (e) {
    return false;
  }
}
