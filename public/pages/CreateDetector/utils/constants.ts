/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { DetectorCreationStep } from '../../../../types';
import { DetectorCreationStepInfo } from '../models/interfaces';

export const createDetectorSteps: Partial<Record<DetectorCreationStep, DetectorCreationStepInfo>> = {
  [DetectorCreationStep.DEFINE_DETECTOR]: {
    title: 'Define detector',
    step: 1,
  },
  // Wazuh: hide alert triggers step in detector creation wizard.
  // [DetectorCreationStep.CONFIGURE_ALERTS]: {
  //   title: 'Set up alert triggers',
  //   step: 2,
  // },
};

export const PENDING_DETECTOR_ID = 'pending_detector_id';
