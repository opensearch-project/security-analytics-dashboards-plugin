/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { HttpSetup } from 'opensearch-dashboards/public';
import IndexService from '../IndexService';
import { API } from '../../../server/utils/constants';
import { dataSourceInfo } from '../utils/constants';

describe('IndexService.getDataStreams', () => {
  const httpClient = { get: jest.fn() };
  const service = new IndexService(httpClient as unknown as HttpSetup);
  let previousDataSourceId: string;

  beforeEach(() => {
    previousDataSourceId = dataSourceInfo.activeDataSource.id;
  });

  afterEach(() => {
    dataSourceInfo.activeDataSource.id = previousDataSourceId;
    jest.clearAllMocks();
  });

  test.each(['', 'remote-data-source'])(
    'uses the selected data source: %s',
    async (dataSourceId) => {
      dataSourceInfo.activeDataSource.id = dataSourceId;
      const response = { ok: true, response: { dataStreams: [{ name: 'logs-stream' }] } };
      httpClient.get.mockResolvedValue(response);

      await expect(service.getDataStreams()).resolves.toEqual(response);
      expect(httpClient.get).toHaveBeenCalledWith(`..${API.DATA_STREAMS_BASE}`, {
        query: { dataSourceId },
      });
    }
  );
});
