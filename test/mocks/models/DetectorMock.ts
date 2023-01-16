/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { AlertCondition, PeriodSchedule, DetectorInput } from '../../../models/interfaces';
import { modelsMock } from '../';

const { periodScheduleMock, detectorInputMock, alertConditionMock } = modelsMock;
const periodSchedule: PeriodSchedule = periodScheduleMock;
const detectorInput: DetectorInput = detectorInputMock;
const alertCondition: AlertCondition = alertConditionMock;

export default {
  id: 'some id',
  type: 'detector',
  detector_type: 'some type',
  name: 'some name',
  enabled: true,
  createdBy: 'someone',
  schedule: periodSchedule,
  inputs: [detectorInput],
  triggers: [alertCondition],
};
