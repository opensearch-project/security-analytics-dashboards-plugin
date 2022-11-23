/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { API } from '../../server/utils/constants';

export const TWENTY_SECONDS_TIMEOUT = { timeout: 20000 };

export const INDICES = {
  DETECTORS_INDEX: '.opensearch-detectors-config',
  PRE_PACKAGED_RULES_INDEX: '.opensearch-pre-packaged-rules-config',
  CUSTOM_RULES_INDEX: '.opensearch-custom-rules-config',
};

export const PLUGIN_NAME = 'opensearch_security_analytics_dashboards';

export const NODE_API = {
  ...API,
  INDEX_TEMPLATE_BASE: '/_index_template',
};
