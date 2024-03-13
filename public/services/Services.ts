/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { createContext } from 'react';
import { SecurityAnalyticsContextType } from '../../types';

const SecurityAnalyticsContext = createContext<SecurityAnalyticsContextType | null>(null);

const SaContextConsumer = SecurityAnalyticsContext.Consumer;

export { SecurityAnalyticsContext, SaContextConsumer };
