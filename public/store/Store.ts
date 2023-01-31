/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { DetectorStore } from './DetectorStore';

export class Store {
  constructor(public readonly detectors: DetectorStore) {}
}
