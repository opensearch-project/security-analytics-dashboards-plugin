/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import browserServicesMock from './browserServicesMock';
import httpClientMock from './httpClientMock';

export const mockHistory = {
  replace: jest.fn(),
};

export { browserServicesMock, httpClientMock };
