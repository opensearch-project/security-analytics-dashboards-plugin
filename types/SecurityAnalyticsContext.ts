/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserServices } from '../public/models/interfaces';
import { MetricsContext } from '../public/metrics/MetricsContext';

export type SecurityAnalyticsContextType = {
  services: BrowserServices;
  metrics: MetricsContext;
};
