/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { API } from '../../server/utils/constants';

export const NINETY_SECONDS = 90000;
export const TWENTY_SECONDS_TIMEOUT = { timeout: 20000 };

export const FEATURE_SYSTEM_INDICES = {
  DETECTORS_INDEX: '.opensearch-detectors-config',
  DETECTOR_QUERIES_INDEX: '.opensearch-sap-windows-detectors-queries',
  PRE_PACKAGED_RULES_INDEX: '.opensearch-pre-packaged-rules-config',
  CUSTOM_RULES_INDEX: '.opensearch-custom-rules-config',
  WINDOWS_ALERTS_INDEX: '.opensearch-sap-windows-alerts*',
  WINDOWS_FINDINGS_INDEX: '.opensearch-sap-windows-findings*',
};

export const PLUGIN_NAME = 'opensearch_security_analytics_dashboards';

export const NODE_API = {
  ...API,
  INDEX_TEMPLATE_BASE: '/_index_template',
};
