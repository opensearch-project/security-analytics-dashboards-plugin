/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { DetectorCreationStepInfo } from '../models/interfaces';
import { DetectorCreationStep } from '../models/types';

export const createDetectorSteps: Record<DetectorCreationStep, DetectorCreationStepInfo> = {
  [DetectorCreationStep.DEFINE_DETECTOR]: {
    title: 'Define detector',
    step: 1,
  },
  [DetectorCreationStep.CONFIGURE_FIELD_MAPPING]: {
    title: 'Configure field mapping',
    step: 2,
  },
  [DetectorCreationStep.CONFIGURE_ALERTS]: {
    title: 'Set up alerts',
    step: 3,
  },
  [DetectorCreationStep.REVIEW_CREATE]: {
    title: 'Review and create',
    step: 4,
  },
};

export const PENDING_DETECTOR_ID = 'pending_detector_id';
