/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { PluginInitializerContext } from "../../../src/core/public";
import { SecurityAnalyticsPlugin} from "./plugin";

export interface SecurityAnalyticsPluginSetup {}
export interface SecurityAnalyticsPluginStart {}

export function plugin(initializerContext: PluginInitializerContext) {
  return new SecurityAnalyticsPlugin(initializerContext);
}
