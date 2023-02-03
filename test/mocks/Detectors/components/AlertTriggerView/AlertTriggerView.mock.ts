/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import alertConditionMock from '../../../CreateDetector/components/ConfigureAlerts/components/AlertCondition/AlertCondition.mock';
import detectorMock from '../../containers/Detectors/Detector.mock';
import ruleInfoMock from '../../../Rules/RuleInfo.mock';

export default {
  alertTrigger: alertConditionMock,
  orderPosition: 1,
  detector: detectorMock,
  notificationChannels: [],
  rules: { rileId: ruleInfoMock },
};
