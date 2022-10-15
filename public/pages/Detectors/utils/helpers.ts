/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

export function getDetectorIds(detectors: object[]) {
  return detectors.map((detector) => detector.id).join(', ');
}

export function getDetectorNames(detectors: object[]) {
  return detectors.map((detector) => detector.name).join(', ');
}
