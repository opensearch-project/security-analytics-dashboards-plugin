/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { NotificationsStart } from 'opensearch-dashboards/public';

export default ({
  toasts: {
    addDanger: jest.fn(),
    addWarning: jest.fn(),
    addSuccess: jest.fn(),
    addInfo: jest.fn(),
  },
} as unknown) as NotificationsStart;
