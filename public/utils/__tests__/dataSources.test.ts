/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { getDataSources, getFieldsForIndex } from '../helpers';
import IndexService from '../../services/IndexService';
import FieldMappingService from '../../services/FieldMappingService';

describe('Threat Intelligence data sources', () => {
  const notifications = { toasts: { addDanger: jest.fn() } };
  const indexService = {
    getAliases: jest.fn(),
    getIndices: jest.fn(),
    getDataStreams: jest.fn(),
  };
  const service = indexService as unknown as IndexService;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
    indexService.getAliases.mockResolvedValue({
      ok: true,
      response: { aliases: [{ alias: 'logs-alias', index: 'logs-000001' }] },
    });
    indexService.getIndices.mockResolvedValue({
      ok: true,
      response: {
        indices: [{ index: 'logs-000001' }, { index: '.ds-logs-stream-000001' }],
      },
    });
    indexService.getDataStreams.mockResolvedValue({
      ok: true,
      response: { dataStreams: [{ name: 'logs-stream' }] },
    });
  });

  afterEach(() => jest.restoreAllMocks());

  test('offers the logical stream name alongside existing aliases and indices', async () => {
    const result = await getDataSources(service, notifications, { includeDataStreams: true });

    expect(result).toEqual({
      ok: true,
      dataSources: [
        {
          label: 'Aliases',
          options: [{ label: 'logs-alias', value: 'logs-alias', index: 'logs-000001' }],
        },
        { label: 'Indices', options: [{ label: 'logs-000001', value: 'logs-000001' }] },
        { label: 'Data streams', options: [{ label: 'logs-stream', value: 'logs-stream' }] },
      ],
    });
  });

  test('does not change data sources for consumers that have not opted in', async () => {
    const result = await getDataSources(service, notifications);

    expect(result.ok).toBe(true);
    expect(indexService.getDataStreams).not.toHaveBeenCalled();
    if (result.ok)
      expect(result.dataSources.map(({ label }) => label)).toEqual(['Aliases', 'Indices']);
  });

  test('supports clusters with no data streams', async () => {
    indexService.getDataStreams.mockResolvedValue({ ok: true, response: { dataStreams: [] } });
    const result = await getDataSources(service, notifications, { includeDataStreams: true });

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.dataSources[2]).toEqual({ label: 'Data streams', options: [] });
    expect(notifications.toasts.addDanger).not.toHaveBeenCalled();
  });

  test.each(['response', 'exception'])(
    'keeps existing sources when stream discovery fails: %s',
    async (failure) => {
      if (failure === 'response') {
        indexService.getDataStreams.mockResolvedValue({ ok: false, error: 'Forbidden' });
      } else {
        indexService.getDataStreams.mockRejectedValue(new Error('Forbidden'));
      }
      const result = await getDataSources(service, notifications, {
        includeDataStreams: true,
      });

      expect(result.ok).toBe(true);
      if (result.ok)
        expect(result.dataSources.map(({ label }) => label)).toEqual(['Aliases', 'Indices']);
      expect(notifications.toasts.addDanger).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Failed to retrieve data streams:',
          text: 'Forbidden',
        })
      );
    }
  );

  test('looks up IoC fields using the logical data stream name', async () => {
    const fieldMappingService = {
      getIndexAliasFields: jest.fn().mockResolvedValue({ ok: true, response: ['source.ip'] }),
    };
    const fields = await getFieldsForIndex(
      fieldMappingService as unknown as FieldMappingService,
      'logs-stream'
    );

    expect(fieldMappingService.getIndexAliasFields).toHaveBeenCalledWith('logs-stream');
    expect(fields).toEqual([{ label: 'source.ip', value: 'source.ip' }]);
  });
});
