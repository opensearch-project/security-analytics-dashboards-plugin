/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { DetectorHit } from '../../../../server/models/interfaces';

export function getDetectorIds(detectors: DetectorHit[]) {
  return detectors.map((detector) => detector._id).join(', ');
}

export function getDetectorNames(detectors: DetectorHit[]) {
  return detectors.map((detector) => detector._source.name).join(', ');
}
