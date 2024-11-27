/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { ISavedObjectsService } from '../../../types';
import { SavedObjectService } from '../../../public/services';
import savedObjectsClientMock from './savedObjectsClient.mock';
import { indexServiceMock } from './indexService.mock';
jest.fn();

const savedObjectsServiceMock = {
  getDashboards: () => Promise.resolve([{ references: [], id: 'dashboardId' }]),
};
const savedObjectsService = new SavedObjectService(savedObjectsClientMock, indexServiceMock);
Object.assign(savedObjectsService, savedObjectsServiceMock);

export { savedObjectsServiceMock };
export default savedObjectsService as ISavedObjectsService;
