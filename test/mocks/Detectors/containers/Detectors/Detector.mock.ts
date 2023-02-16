/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import detectorInputMock from './DetectorInput.mock';
import periodScheduleMock from '../../../Alerts/PeriodSchedule.mock';
import alertConditionMock from '../../../CreateDetector/components/ConfigureAlerts/components/AlertCondition/AlertCondition.mock';
import { times } from 'lodash';
import { Detector } from '../../../../../models/interfaces';

export default {
  id: 'detector_id_1',
  type: 'detector',
  detector_type: 'detector_type',
  name: 'detector_name',
  enabled: true,
  createdBy: 'someone',
  schedule: periodScheduleMock,
  inputs: [detectorInputMock],
  triggers: times(2, (index) => {
    return {
      ...alertConditionMock,
      id: `${alertConditionMock.id}_${index}`,
    };
  }),
} as Detector;
