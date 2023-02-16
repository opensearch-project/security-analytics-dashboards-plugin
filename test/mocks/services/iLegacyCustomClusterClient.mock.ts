/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { ILegacyCustomClusterClient } from 'opensearch-dashboards/server';
const legacyClusterClientMock = {} as any;

legacyClusterClientMock.delete = jest.fn();
legacyClusterClientMock.get = jest.fn();
legacyClusterClientMock.head = jest.fn();
legacyClusterClientMock.post = jest.fn();
legacyClusterClientMock.put = jest.fn();

export default legacyClusterClientMock as ILegacyCustomClusterClient;
