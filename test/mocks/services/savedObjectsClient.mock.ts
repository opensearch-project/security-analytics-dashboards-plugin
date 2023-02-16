/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { SavedObjectsClientContract } from 'opensearch-dashboards/public';

const savedObjectsClientMock = {} as any;

savedObjectsClientMock.delete = jest.fn();
savedObjectsClientMock.get = jest.fn();
savedObjectsClientMock.head = jest.fn();
savedObjectsClientMock.post = jest.fn();
savedObjectsClientMock.put = jest.fn();

export default savedObjectsClientMock as SavedObjectsClientContract;
