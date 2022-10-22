/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { SecurityAnalyticsApi } from '../models/interfaces';

export enum CLUSTER {
  ADMIN = 'admin',
  SA = 'opensearch_security_analytics',
  DATA = 'data',
}

export const BASE_API_PATH = '/_plugins/_security_analytics';

export const API: SecurityAnalyticsApi = {
  DETECTORS_BASE: `${BASE_API_PATH}/detectors`,
  INDICES_BASE: `${BASE_API_PATH}/indices`,
  GET_FINDINGS: `${BASE_API_PATH}/findings/_search`,
  DOCUMENT_IDS_QUERY: `${BASE_API_PATH}/document_ids_query`,
  TIME_RANGE_QUERY: `${BASE_API_PATH}/time_range_query`,
  MAPPINGS_BASE: `${BASE_API_PATH}/mappings`,
  MAPPINGS_VIEW: `${BASE_API_PATH}/mappings/view`,
  RULES_BASE: `${BASE_API_PATH}/rules/_search`,
};

/**
 * Property with below name is added to the prototype of Opensearch client during setup.
 * @see ../clusters/securityAnalytics/securityAnalyticsPlugin
 */
export const PLUGIN_PROPERTY_NAME: string = 'securityAnalytics';

export const METHOD_NAMES = {
  //Rule methods
  CREATE_RULE: 'createRule',
  DELETE_RULE: 'deleteRule',
  GET_RULE: 'getRule',
  GET_RULES: 'getRules',
  UPDATE_RULE: 'updateRules',

  // Detector methods
  CREATE_DETECTOR: 'createDetector',
  DELETE_DETECTOR: 'deleteDetector',
  GET_DETECTOR: 'getDetector',
  GET_DETECTORS: 'getDetectors',
  UPDATE_DETECTOR: 'updateDetector',

  // Finding methods
  GET_FINDINGS: 'getFindings',

  // Field mapping methods
  GET_MAPPINGS_VIEW: 'getFieldMappingsView',
};

/**
 * These methods are defined on the Opensearch client instance by adding them to the client's
 * prototype under the @see PLUGIN_PROPERTY_NAME field.
 * @see ../clusters/securityAnalytics/securityAnalyticsPlugin
 */
export const CLIENT_RULE_METHODS = {
  CREATE_RULE: `${PLUGIN_PROPERTY_NAME}.${METHOD_NAMES.CREATE_RULE}`,
  DELETE_RULE: `${PLUGIN_PROPERTY_NAME}.${METHOD_NAMES.DELETE_RULE}`,
  GET_RULE: `${PLUGIN_PROPERTY_NAME}.${METHOD_NAMES.GET_RULE}`,
  GET_RULES: `${PLUGIN_PROPERTY_NAME}.${METHOD_NAMES.GET_RULES}`,
  UPDATE_RULE: `${PLUGIN_PROPERTY_NAME}.${METHOD_NAMES.UPDATE_RULE}`,
};

export const CLIENT_DETECTOR_METHODS = {
  CREATE_DETECTOR: `${PLUGIN_PROPERTY_NAME}.${METHOD_NAMES.CREATE_DETECTOR}`,
  DELETE_DETECTOR: `${PLUGIN_PROPERTY_NAME}.${METHOD_NAMES.DELETE_DETECTOR}`,
  GET_DETECTOR: `${PLUGIN_PROPERTY_NAME}.${METHOD_NAMES.GET_DETECTOR}`,
  GET_DETECTORS: `${PLUGIN_PROPERTY_NAME}.${METHOD_NAMES.GET_DETECTORS}`,
  UPDATE_DETECTOR: `${PLUGIN_PROPERTY_NAME}.${METHOD_NAMES.UPDATE_DETECTOR}`,
  GET_FINDINGS: `${PLUGIN_PROPERTY_NAME}.${METHOD_NAMES.GET_FINDINGS}`,
};

export const CLIENT_FIELD_MAPPINGS_METHODS = {
  GET_MAPPINGS_VIEW: `${PLUGIN_PROPERTY_NAME}.${METHOD_NAMES.GET_MAPPINGS_VIEW}`,
};
