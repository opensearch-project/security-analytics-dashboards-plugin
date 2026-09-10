/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  getResourceSharingAvailableTypes,
  SA_DETECTOR_RESOURCE_TYPE,
  SA_CORRELATION_RULE_RESOURCE_TYPE,
} from '../resource_sharing';
import { setHttp } from '../constants';

const setHttpResponses = (dashboardsInfo: unknown, resourceTypes?: unknown): jest.Mock => {
  const get = jest.fn((path: string) => {
    if (path === '/api/v1/auth/dashboardsinfo') {
      return Promise.resolve(dashboardsInfo);
    }
    if (path === '/api/resource/types') {
      return Promise.resolve(resourceTypes);
    }
    return Promise.reject(new Error(`unexpected path: ${path}`));
  });
  setHttp({ get } as any);
  return get;
};

describe('getResourceSharingAvailableTypes', () => {
  it('returns an empty list when resource sharing is disabled', async () => {
    setHttpResponses({ resource_sharing_enabled: false });
    expect(await getResourceSharingAvailableTypes()).toEqual([]);
  });

  it('returns an empty list when the dashboardsinfo call fails', async () => {
    setHttp({ get: jest.fn(() => Promise.reject(new Error('boom'))) } as any);
    expect(await getResourceSharingAvailableTypes()).toEqual([]);
  });

  it('returns the registered types when enabled', async () => {
    setHttpResponses(
      { resource_sharing_enabled: true },
      { types: [{ type: SA_DETECTOR_RESOURCE_TYPE }, { type: SA_CORRELATION_RULE_RESOURCE_TYPE }] }
    );
    expect(await getResourceSharingAvailableTypes()).toEqual([
      SA_DETECTOR_RESOURCE_TYPE,
      SA_CORRELATION_RULE_RESOURCE_TYPE,
    ]);
  });

  it('supports a bare array response and filters malformed entries', async () => {
    setHttpResponses({ resource_sharing_enabled: true }, [
      { type: SA_DETECTOR_RESOURCE_TYPE },
      {},
      null,
    ]);
    expect(await getResourceSharingAvailableTypes()).toEqual([SA_DETECTOR_RESOURCE_TYPE]);
  });

  it('passes the data source id to both routes', async () => {
    const get = setHttpResponses({ resource_sharing_enabled: true }, { types: [] });
    await getResourceSharingAvailableTypes('ds-1');
    expect(get).toHaveBeenCalledWith('/api/v1/auth/dashboardsinfo', {
      query: { dataSourceId: 'ds-1' },
    });
    expect(get).toHaveBeenCalledWith('/api/resource/types', {
      query: { dataSourceId: 'ds-1' },
    });
  });

  it('returns an empty list and swallows errors when http has not been set', async () => {
    setHttp(undefined as any);
    expect(await getResourceSharingAvailableTypes()).toEqual([]);
  });
});
