/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { CreateDetectorSteps, MetricsCounter } from '../../types';
import { SecurityAnalyticsApi } from '../models/interfaces';

export enum CLUSTER {
  ADMIN = 'admin',
  SA = 'opensearch_security_analytics',
  DATA = 'data',
}

export const BASE_API_PATH = '/_plugins/_security_analytics';

export const API: SecurityAnalyticsApi = {
  DETECTORS_BASE: `${BASE_API_PATH}/detectors`,
  CORRELATION_BASE: `${BASE_API_PATH}/correlation/rules`,
  SEARCH_DETECTORS: `${BASE_API_PATH}/detectors/_search`,
  INDICES_BASE: `${BASE_API_PATH}/indices`,
  ALIASES_BASE: `${BASE_API_PATH}/aliases`,
  FINDINGS_BASE: `${BASE_API_PATH}/findings`,
  GET_FINDINGS: `${BASE_API_PATH}/findings/_search`,
  DOCUMENT_IDS_QUERY: `${BASE_API_PATH}/document_ids_query`,
  TIME_RANGE_QUERY: `${BASE_API_PATH}/time_range_query`,
  MAPPINGS_BASE: `${BASE_API_PATH}/mappings`,
  MAPPINGS_VIEW: `${BASE_API_PATH}/mappings/view`,
  GET_ALERTS: `${BASE_API_PATH}/alerts`,
  RULES_BASE: `${BASE_API_PATH}/rules`,
  CHANNELS: `${BASE_API_PATH}/_notifications/channels`,
  PLUGINS: `${BASE_API_PATH}/_notifications/plugins`,
  NOTIFICATION_FEATURES: `${BASE_API_PATH}/_notifications/features`,
  ACKNOWLEDGE_ALERTS: `${BASE_API_PATH}/detectors/{detector_id}/_acknowledge/alerts`,
  UPDATE_ALIASES: `${BASE_API_PATH}/update_aliases`,
  CORRELATIONS: `${BASE_API_PATH}/correlations`,
  LOGTYPE_BASE: `${BASE_API_PATH}/logtype`,
  METRICS: `/api/security_analytics/stats`,
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
  SEARCH_DETECTORS: 'searchDetectors',
  UPDATE_DETECTOR: 'updateDetector',

  // Correlation methods
  GET_CORRELATION_RULES: 'getCorrelationRules',
  CREATE_CORRELATION_RULE: 'createCorrelationRule',
  UPDATE_CORRELATION_RULE: 'updateCorrelationRule',
  DELETE_CORRELATION_RULE: 'deleteCorrelationRule',
  GET_CORRELATED_FINDINGS: 'getCorrelatedFindings',
  GET_ALL_CORRELATIONS: 'getAllCorrelations',

  // Finding methods
  GET_FINDINGS: 'getFindings',

  // Field mapping methods
  GET_MAPPINGS_VIEW: 'getFieldMappingsView',
  CREATE_MAPPINGS: 'createMappings',
  GET_MAPPINGS: 'getMappings',
  GET_INDEX_ALIAS_MAPPINGS: 'getIndexAliasMappings',

  // Alerts methods
  GET_ALERTS: 'getAlerts',
  ACKNOWLEDGE_ALERTS: 'acknowledgeAlerts',

  // Notifications methods
  GET_CHANNEl: 'getChannel',
  GET_CHANNElS: 'getChannels',
  GET_FEATURES: 'getFeatures',

  // LogType methods
  SEARCH_LOGTYPES: 'searchLogTypes',
  CREATE_LOGTYPE: 'createLogType',
  UPDATE_LOGTYPE: 'updateLogType',
  DELETE_LOGTYPE: 'deleteLogType',
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
  SEARCH_DETECTORS: `${PLUGIN_PROPERTY_NAME}.${METHOD_NAMES.SEARCH_DETECTORS}`,
  UPDATE_DETECTOR: `${PLUGIN_PROPERTY_NAME}.${METHOD_NAMES.UPDATE_DETECTOR}`,
  GET_FINDINGS: `${PLUGIN_PROPERTY_NAME}.${METHOD_NAMES.GET_FINDINGS}`,
};

export const CLIENT_CORRELATION_METHODS = {
  GET_CORRELATION_RULES: `${PLUGIN_PROPERTY_NAME}.${METHOD_NAMES.GET_CORRELATION_RULES}`,
  CREATE_CORRELATION_RULE: `${PLUGIN_PROPERTY_NAME}.${METHOD_NAMES.CREATE_CORRELATION_RULE}`,
  UPDATE_CORRELATION_RULE: `${PLUGIN_PROPERTY_NAME}.${METHOD_NAMES.UPDATE_CORRELATION_RULE}`,
  DELETE_CORRELATION_RULE: `${PLUGIN_PROPERTY_NAME}.${METHOD_NAMES.DELETE_CORRELATION_RULE}`,
  GET_CORRELATED_FINDINGS: `${PLUGIN_PROPERTY_NAME}.${METHOD_NAMES.GET_CORRELATED_FINDINGS}`,
  GET_ALL_CORRELATIONS: `${PLUGIN_PROPERTY_NAME}.${METHOD_NAMES.GET_ALL_CORRELATIONS}`,
};

export const CLIENT_FIELD_MAPPINGS_METHODS = {
  GET_MAPPINGS_VIEW: `${PLUGIN_PROPERTY_NAME}.${METHOD_NAMES.GET_MAPPINGS_VIEW}`,
  CREATE_MAPPINGS: `${PLUGIN_PROPERTY_NAME}.${METHOD_NAMES.CREATE_MAPPINGS}`,
  GET_MAPPINGS: `${PLUGIN_PROPERTY_NAME}.${METHOD_NAMES.GET_MAPPINGS}`,
  GET_INDEX_ALIAS_MAPPINGS: `${PLUGIN_PROPERTY_NAME}.${METHOD_NAMES.GET_INDEX_ALIAS_MAPPINGS}`,
};

export const CLIENT_ALERTS_METHODS = {
  ACKNOWLEDGE_ALERTS: `${PLUGIN_PROPERTY_NAME}.${METHOD_NAMES.ACKNOWLEDGE_ALERTS}`,
  GET_ALERTS: `${PLUGIN_PROPERTY_NAME}.${METHOD_NAMES.GET_ALERTS}`,
};

export const CLIENT_NOTIFICATIONS_METHODS = {
  GET_CHANNEL: `${PLUGIN_PROPERTY_NAME}.${METHOD_NAMES.GET_CHANNEl}`,
  GET_CHANNELS: `${PLUGIN_PROPERTY_NAME}.${METHOD_NAMES.GET_CHANNElS}`,
  GET_FEATURES: `${PLUGIN_PROPERTY_NAME}.${METHOD_NAMES.GET_FEATURES}`,
};

export const CLIENT_LOGTYPE_METHODS = {
  SEARCH_LOGTYPES: `${PLUGIN_PROPERTY_NAME}.${METHOD_NAMES.SEARCH_LOGTYPES}`,
  CREATE_LOGTYPE: `${PLUGIN_PROPERTY_NAME}.${METHOD_NAMES.CREATE_LOGTYPE}`,
  UPDATE_LOGTYPE: `${PLUGIN_PROPERTY_NAME}.${METHOD_NAMES.UPDATE_LOGTYPE}`,
  DELETE_LOGTYPE: `${PLUGIN_PROPERTY_NAME}.${METHOD_NAMES.DELETE_LOGTYPE}`,
};

export const DEFAULT_METRICS_COUNTER: MetricsCounter = {
  CreateDetector: {
    [CreateDetectorSteps.started]: 0,
    [CreateDetectorSteps.sourceSelected]: 0,
    [CreateDetectorSteps.rulesConfigured]: 0,
    [CreateDetectorSteps.fieldMappingsConfigured]: 0,
    [CreateDetectorSteps.threatIntelConfigured]: 0,
    [CreateDetectorSteps.stepTwoInitiated]: 0,
    [CreateDetectorSteps.triggerConfigured]: 0,
    [CreateDetectorSteps.createClicked]: 0,
  },
};
