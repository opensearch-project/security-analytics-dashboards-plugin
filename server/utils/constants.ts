import { SecurityAnalyticsApi } from '../models/interfaces';

export const BASE_API_PATH = '/_plugins/_security_analytics';

export const API: SecurityAnalyticsApi = Object.freeze({
  DETECTORS_BASE: `${BASE_API_PATH}/detectors`,
});

/**
 * Property with below name is added to the prototype of Opensearch client during setup.
 * @see ../clusters/securityAnalytics/securityAnalyticsPlugin
 */
export const PLUGIN_PROPERTY_NAME: string = 'securityAnalytics';

export const METHOD_NAMES = {
  CREATE_DETECTOR: 'createDetector',
  DELETE_DETECTOR: 'deleteDetector',
  GET_DETECTOR: 'getDetector',
  GET_DETECTORS: 'getDetectors',
  UPDATE_DETECTOR: 'updateDetector',
};

/**
 * These methods are defined on the Opensearch client instance by adding them to the client's
 * prototype under the @see PLUGIN_PROPERTY_NAME field.
 * @see ../clusters/securityAnalytics/securityAnalyticsPlugin
 */
export const CLIENT_DETECTOR_METHODS = {
  CREATE_DETECTOR: `${PLUGIN_PROPERTY_NAME}.${METHOD_NAMES.CREATE_DETECTOR}`,
  DELETE_DETECTOR: `${PLUGIN_PROPERTY_NAME}.${METHOD_NAMES.DELETE_DETECTOR}`,
  GET_DETECTOR: `${PLUGIN_PROPERTY_NAME}.${METHOD_NAMES.GET_DETECTOR}`,
  GET_DETECTORS: `${PLUGIN_PROPERTY_NAME}.${METHOD_NAMES.GET_DETECTORS}`,
  UPDATE_DETECTOR: `${PLUGIN_PROPERTY_NAME}.${METHOD_NAMES.UPDATE_DETECTOR}`,
};
