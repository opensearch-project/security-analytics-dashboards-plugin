/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { getHttp, getSecurityDashboards } from './constants';

/**
 * Resource types registered by the security-analytics backend plugin with the
 * security plugin's resource-sharing framework
 * (SecurityAnalyticsResourceSharingExtension).
 */
export const SA_DETECTOR_RESOURCE_TYPE = 'detector';
export const SA_CORRELATION_RULE_RESOURCE_TYPE = 'correlation-rule';

/**
 * Resource-sharing types available on the given data source. Combines the
 * feature-flag gate (`/api/v1/auth/resource_sharing_enabled`, evaluated per
 * data source) with the registered/protected type list (`/api/resource/types`).
 * Returns [] when disabled or on error (fails closed).
 *
 * These backend checks alone are not sufficient: the Share button is mounted
 * by security-dashboards-plugin's client-side DOM-marker SPI, which only runs
 * when resource sharing is enabled on the *local* cluster. In a multi-data-source
 * deployment where the local cluster has it disabled but the *selected* data
 * source has it enabled, the checks above would say "available" even though no
 * Share button can ever mount, rendering an Access column that is permanently
 * empty. So each candidate type is re-confirmed against
 * `securityDashboards.ui.isResourceSharingAvailable`, which is gated on the
 * local SPI. If security-dashboards-plugin isn't installed, this fails closed
 * to [] as well: with no plugin, no Share button can mount either.
 */
export const getResourceSharingAvailableTypes = async (
  resourceDataSourceId?: string
): Promise<string[]> => {
  const securityDashboards = getSecurityDashboards();
  if (!securityDashboards) return [];
  try {
    const http = getHttp();
    const query = resourceDataSourceId ? { dataSourceId: resourceDataSourceId } : {};
    // Global gate: resource sharing must be enabled on the selected data source.
    const info: any = await http.get('/api/v1/auth/resource_sharing_enabled', { query });
    if (!info?.enabled) return [];
    // Per-type gate: the registered/protected shareable types on that source.
    const typesResp: any = await http.get('/api/resource/types', { query });
    const rawTypes = Array.isArray(typesResp) ? typesResp : (typesResp?.types ?? []);
    const candidateTypes: string[] = rawTypes
      .map((entry: { type: string }) => entry?.type)
      .filter((type: string | undefined): type is string => Boolean(type));

    // Local-SPI gate: re-confirm each candidate can actually get a Share
    // button, rather than trusting the selected data source's response alone.
    const confirmations = await Promise.all(
      candidateTypes.map((candidateType) =>
        securityDashboards.ui
          .isResourceSharingAvailable(candidateType, resourceDataSourceId)
          .catch(() => false)
      )
    );
    return candidateTypes.filter((_candidateType, index) => confirmations[index]);
  } catch (e) {
    return [];
  }
};
