/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import httpClientMock from './httpClient.mock';
import { FindingsService } from '../../../public/services';

const findingsService = new FindingsService(httpClientMock);

Object.assign(findingsService, {
  getFindings: () =>
    Promise.resolve({
      ok: true,
      response: {
        findings: [],
      },
    }),
});

export default findingsService as FindingsService;
