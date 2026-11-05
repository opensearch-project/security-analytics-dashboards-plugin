/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import IndexService from '../IndexService';

const createResponseFactory = () => ({
  custom: jest.fn((customResponse: any) => customResponse),
});

const createService = (callAsCurrentUser: jest.Mock, dataSourceEnabled = false) => {
  const osDriver = {
    asScoped: jest.fn(() => ({
      callAsCurrentUser,
    })),
  };

  return {
    service: new IndexService(osDriver as any, dataSourceEnabled),
    osDriver,
  };
};

describe('IndexService', () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe('getDataStreams', () => {
    it('returns data stream names from the current user client', async () => {
      const callAsCurrentUser = jest.fn().mockResolvedValue({
        data_streams: [{ name: 'logs-http' }, { name: 'metrics-service' }, { generation: 1 }],
      });
      const { service, osDriver } = createService(callAsCurrentUser);
      const request = { query: {} } as any;
      const response = createResponseFactory();

      const result = await service.getDataStreams({} as any, request, response as any);

      expect(osDriver.asScoped).toHaveBeenCalledWith(request);
      expect(callAsCurrentUser).toHaveBeenCalledWith('transport.request', {
        method: 'GET',
        path: '/_data_stream',
      });
      expect(result).toEqual({
        statusCode: 200,
        body: {
          ok: true,
          response: {
            dataStreams: [{ name: 'logs-http' }, { name: 'metrics-service' }],
          },
        },
      });
    });

    it('returns an empty list when the cluster has no data streams', async () => {
      const callAsCurrentUser = jest.fn().mockResolvedValue({ data_streams: [] });
      const { service } = createService(callAsCurrentUser);
      const response = createResponseFactory();

      const result = await service.getDataStreams({} as any, { query: {} } as any, response as any);

      expect(result).toEqual({
        statusCode: 200,
        body: {
          ok: true,
          response: {
            dataStreams: [],
          },
        },
      });
    });

    it('returns ok false when OpenSearch rejects the request', async () => {
      const callAsCurrentUser = jest.fn().mockRejectedValue(new Error('permission denied'));
      const { service } = createService(callAsCurrentUser);
      const response = createResponseFactory();

      const result = await service.getDataStreams({} as any, { query: {} } as any, response as any);

      expect(result).toEqual({
        statusCode: 200,
        body: {
          ok: false,
          error: 'permission denied',
        },
      });
    });

    it('uses the selected data source client when MDS is enabled', async () => {
      const callAsCurrentUser = jest.fn();
      const dataSourceCallAPI = jest.fn().mockResolvedValue({
        body: {
          data_streams: [{ name: 'mds-logs' }],
        },
      });
      const { service, osDriver } = createService(callAsCurrentUser, true);
      const getClient = jest.fn(() => ({ callAPI: dataSourceCallAPI }));
      const context = {
        dataSource: {
          opensearch: {
            legacy: {
              getClient,
            },
          },
        },
      };
      const request = { query: { dataSourceId: 'data-source-1' } } as any;
      const response = createResponseFactory();

      const result = await service.getDataStreams(context as any, request, response as any);

      expect(osDriver.asScoped).not.toHaveBeenCalled();
      expect(getClient).toHaveBeenCalledWith('data-source-1');
      expect(dataSourceCallAPI).toHaveBeenCalledWith('transport.request', {
        method: 'GET',
        path: '/_data_stream',
      });
      expect(result).toEqual({
        statusCode: 200,
        body: {
          ok: true,
          response: {
            dataStreams: [{ name: 'mds-logs' }],
          },
        },
      });
    });
  });
});
