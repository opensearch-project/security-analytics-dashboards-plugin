/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { AlertCondition, PeriodSchedule } from '../../../../../models/interfaces';
import detectorInputMock from './DetectorInput.mock';
import periodScheduleMock from '../../../Alerts/PeriodSchedule.mock';
import alertConditionMock from '../../../CreateDetector/components/ConfigureAlerts/components/AlertCondition/AlertCondition.mock';
import { times } from 'lodash';

const periodSchedule: PeriodSchedule = periodScheduleMock;
const alertCondition: AlertCondition = alertConditionMock;

export default {
  id: 'detector_id_1',
  type: 'detector',
  detector_type: 'detector_type',
  name: 'detector_name',
  enabled: true,
  createdBy: 'someone',
  schedule: periodSchedule,
  inputs: [detectorInputMock],
  triggers: times(2, (index) => {
    return {
      ...alertCondition,
      id: `${alertCondition.id}_${index}`,
    };
  }),
};
