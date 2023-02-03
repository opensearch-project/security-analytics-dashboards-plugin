/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import services from './services';
import rules from './Rules';
import detectors from './Detectors';
import createDetector from './CreateDetector';
import alerts from './Alerts';
import history from './services/browserHistory.mock';

export default { services, rules, detectors, createDetector, alerts, history };
