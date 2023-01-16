/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { AlertItem } from "../../../server/models/interfaces";
import { Detector } from "../../../models/interfaces";
import { modelsMock } from "../";
import { browserServicesMock } from "../index";

const { alertItemMock, detectorMock } = modelsMock;
const { findingsService, ruleService } = browserServicesMock;
const alertItem: AlertItem = alertItemMock;
const detector: Detector = detectorMock;

export default {
  alertItem,
  detector,
  findingsService,
  ruleService,
  notifications: NotificationsStart,
  opensearchService: OpenSearchService,
  onClose: jest.fn(),
  onAcknowledge: jest.fn(),
};
