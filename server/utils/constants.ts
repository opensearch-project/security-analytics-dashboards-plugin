import { SecurityAnalyticsApi } from '../models/interfaces';

export enum CLUSTER {
  ADMIN = 'admin',
  SA = 'opensearch_security_analytics',
  DATA = 'data',
}

export const BASE_API_PATH = '/_plugins/_security_analytics';

export const API: SecurityAnalyticsApi = Object.freeze({
  RULES_BASE: `${BASE_API_PATH}/rules`,
});

/**
 * Property with below name is added to the prototype of Opensearch client during setup.
 * @see ../clusters/securityAnalytics/securityAnalyticsPlugin
 */
export const PLUGIN_PROPERTY_NAME: string = 'securityAnalytics';

export const METHOD_NAMES = {
  CREATE_RULE: 'createRule',
  DELETE_RULE: 'deleteRule',
  GET_RULE: 'getRule',
  GET_RULES: 'getRules',
  UPDATE_RULE: 'updateRules',
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
