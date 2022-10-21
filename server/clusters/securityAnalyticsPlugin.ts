/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { PLUGIN_PROPERTY_NAME } from '../utils/constants';
import { addAlertsMethods } from './addAlertsMethods';
import { addDetectorMethods } from './addDetectorMethods';
import { addFieldMappingMethods } from './addFieldMappingMethods';
import { addFindingsMethods } from './addFindingsMethods';

export function securityAnalyticsPlugin(Client: any, config: any, components: any) {
  const createAction = components.clientAction.factory;

  Client.prototype[PLUGIN_PROPERTY_NAME] = components.clientAction.namespaceFactory();
  const securityAnalytics = Client.prototype[PLUGIN_PROPERTY_NAME].prototype;

  addDetectorMethods(securityAnalytics, createAction);
  addFieldMappingMethods(securityAnalytics, createAction);
  addFindingsMethods(securityAnalytics, createAction);
  addAlertsMethods(securityAnalytics, createAction);
}
