/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { PLUGIN_PROPERTY_NAME } from '../utils/constants';
import { addAlertsMethods } from './addAlertsMethods';
import { addDetectorMethods } from './addDetectorMethods';
import { addFieldMappingMethods } from './addFieldMappingMethods';
import { addFindingsMethods } from './addFindingsMethods';
import { addRulesMethods } from './addRuleMethods';
import { addNotificationsMethods } from './addNotificationsMethods';
import { addCorrelationMethods } from './addCorrelationMethods';
import { addLogTypeMethods } from './addLogTypeMethods';
import { addThreatIntelMethods } from './addThreatIntelMethods';
// Wazuh
import { addIntegrationsMethods } from './addIntegrationsMethods';
import { addPoliciesMethods } from './addPoliciesMethods';
import { addDecoderMethods } from './addDecoderMethods';
import { addKVDBsMethods } from './addKVDBsMethods';
import { addLogTestMethods } from './addLogTestMethods';

export function securityAnalyticsPlugin(Client: any, config: any, components: any) {
  const createAction = components.clientAction.factory;

  Client.prototype[PLUGIN_PROPERTY_NAME] = components.clientAction.namespaceFactory();
  const securityAnalytics = Client.prototype[PLUGIN_PROPERTY_NAME].prototype;

  addDetectorMethods(securityAnalytics, createAction);
  addCorrelationMethods(securityAnalytics, createAction);
  addFieldMappingMethods(securityAnalytics, createAction);
  addFindingsMethods(securityAnalytics, createAction);
  addAlertsMethods(securityAnalytics, createAction);
  addRulesMethods(securityAnalytics, createAction);
  addNotificationsMethods(securityAnalytics, createAction);
  addLogTypeMethods(securityAnalytics, createAction);
  addThreatIntelMethods(securityAnalytics, createAction);
  // Wazuh
  addIntegrationsMethods(securityAnalytics, createAction);
  addPoliciesMethods(securityAnalytics, createAction);
  addDecoderMethods(securityAnalytics, createAction);
  addKVDBsMethods(securityAnalytics, createAction);
  addLogTestMethods(securityAnalytics, createAction);
}
