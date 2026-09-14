/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  getResourceSharingAvailableTypes,
  SA_DETECTOR_RESOURCE_TYPE,
  SA_CORRELATION_RULE_RESOURCE_TYPE,
} from '../resource_sharing';
import { setHttp, setSecurityDashboards } from '../constants';

const setHttpResponses = (dashboardsInfo: unknown, resourceTypes?: unknown): jest.Mock => {
  const get = jest.fn((path: string) => {
    if (path === '/api/v1/auth/resource_sharing_enabled') {
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

// By default, security-dashboards-plugin's local-SPI check confirms every
// type it is asked about. Individual tests override this per case.
const mockSecurityDashboards = (spiConfirms: (type: string) => boolean = () => true) => {
  setSecurityDashboards({
    ui: {
      isResourceSharingAvailable: (type: string) => Promise.resolve(spiConfirms(type)),
    },
  } as any);
};

describe('getResourceSharingAvailableTypes', () => {
  beforeEach(() => {
    mockSecurityDashboards();
  });

  afterEach(() => {
    setSecurityDashboards(undefined as any);
  });

  it('returns an empty list when resource sharing is disabled', async () => {
    setHttpResponses({ enabled: false });
    expect(await getResourceSharingAvailableTypes()).toEqual([]);
  });

  it('returns an empty list when the resource_sharing_enabled call fails', async () => {
    setHttp({ get: jest.fn(() => Promise.reject(new Error('boom'))) } as any);
    expect(await getResourceSharingAvailableTypes()).toEqual([]);
  });

  it('returns the registered types when enabled and the local SPI confirms each one', async () => {
    setHttpResponses(
      { enabled: true },
      { types: [{ type: SA_DETECTOR_RESOURCE_TYPE }, { type: SA_CORRELATION_RULE_RESOURCE_TYPE }] }
    );
    expect(await getResourceSharingAvailableTypes()).toEqual([
      SA_DETECTOR_RESOURCE_TYPE,
      SA_CORRELATION_RULE_RESOURCE_TYPE,
    ]);
  });

  it('supports a bare array response and filters malformed entries', async () => {
    setHttpResponses({ enabled: true }, [
      { type: SA_DETECTOR_RESOURCE_TYPE },
      {},
      null,
    ]);
    expect(await getResourceSharingAvailableTypes()).toEqual([SA_DETECTOR_RESOURCE_TYPE]);
  });

  it('passes the data source id to both routes', async () => {
    const get = setHttpResponses({ enabled: true }, { types: [] });
    await getResourceSharingAvailableTypes('ds-1');
    expect(get).toHaveBeenCalledWith('/api/v1/auth/resource_sharing_enabled', {
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

  it('returns an empty list without probing when security-dashboards-plugin is not installed', async () => {
    setSecurityDashboards(undefined as any);
    const get = setHttpResponses(
      { enabled: true },
      { types: [{ type: SA_DETECTOR_RESOURCE_TYPE }] }
    );
    expect(await getResourceSharingAvailableTypes()).toEqual([]);
    expect(get).not.toHaveBeenCalled();
  });

  it('drops a type that the backend reports as registered but the local SPI does not confirm', async () => {
    // Simulates: local cluster has resource sharing disabled (so the SPI
    // never started) while the selected data source reports it enabled.
    mockSecurityDashboards((type) => type === SA_CORRELATION_RULE_RESOURCE_TYPE);
    setHttpResponses(
      { enabled: true },
      { types: [{ type: SA_DETECTOR_RESOURCE_TYPE }, { type: SA_CORRELATION_RULE_RESOURCE_TYPE }] }
    );
    expect(await getResourceSharingAvailableTypes()).toEqual([SA_CORRELATION_RULE_RESOURCE_TYPE]);
  });

  it('drops a type when the local SPI confirmation throws', async () => {
    setSecurityDashboards({
      ui: { isResourceSharingAvailable: () => Promise.reject(new Error('boom')) },
    } as any);
    setHttpResponses({ enabled: true }, { types: [{ type: SA_DETECTOR_RESOURCE_TYPE }] });
    expect(await getResourceSharingAvailableTypes()).toEqual([]);
  });
});
