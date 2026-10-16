/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import FieldMappingService from '../FieldMappingService';
import { API } from '../../../server/utils/constants';

describe('FieldMappingService.createMappings', () => {
  const createService = () => {
    const post = jest.fn().mockResolvedValue({ ok: true, response: { acknowledged: true } });
    return { post, service: new FieldMappingService({ post } as any) };
  };

  it('does not send a request when no field-alias mappings remain', async () => {
    const { post, service } = createService();

    const res = await service.createMappings('logs-alias', 'network', [
      { ruleFieldName: 'source.ip', indexFieldName: 'source.ip' },
    ]);

    expect(post).not.toHaveBeenCalled();
    expect(res).toEqual({ ok: true, response: { acknowledged: true } });
  });

  it('does not send a request for an empty mapping list', async () => {
    const { post, service } = createService();

    await service.createMappings('logs-alias', 'network', []);

    expect(post).not.toHaveBeenCalled();
  });

  it('sends every non-identity mapping as a field-alias', async () => {
    const { post, service } = createService();

    await service.createMappings('logs-alias', 'network', [
      { ruleFieldName: 'source.ip', indexFieldName: 'src_ip' },
      { ruleFieldName: 'destination.ip', indexFieldName: 'dst_ip' },
      { ruleFieldName: 'host.name', indexFieldName: 'host.name' },
    ]);

    expect(post).toHaveBeenCalledTimes(1);
    const [url, params] = post.mock.calls[0];
    expect(url).toEqual(`..${API.MAPPINGS_BASE}`);
    expect(JSON.parse(params.body)).toEqual({
      index_name: 'logs-alias',
      rule_topic: 'network',
      partial: true,
      alias_mappings: {
        properties: {
          'source.ip': { type: 'alias', path: 'src_ip' },
          'destination.ip': { type: 'alias', path: 'dst_ip' },
        },
      },
    });
  });
});
