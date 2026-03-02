/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

export enum FindingFlyoutTabId {
  DETAILS = 'Details',
  // Wazuh: hide Correlations tab in finding details flyout.
  // CORRELATIONS = 'Correlations',
}

export const FindingFlyoutTabs = [
  { id: FindingFlyoutTabId.DETAILS, name: 'Details' },
  // Wazuh: hide Correlations tab in finding details flyout.
  // { id: FindingFlyoutTabId.CORRELATIONS, name: 'Correlations' },
];
