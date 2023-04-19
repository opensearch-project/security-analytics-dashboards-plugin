/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

export enum FindingFlyoutTabId {
  DETAILS = 'Details',
  CORRELATIONS = 'Correlations',
}

export const FindingFlyoutTabs = [
  { id: FindingFlyoutTabId.DETAILS, name: 'Details' },
  { id: FindingFlyoutTabId.CORRELATIONS, name: 'Correlations' },
];
