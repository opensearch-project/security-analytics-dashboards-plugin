/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import props from '../../../../../test/mocks/Detectors/containers/EditFieldMappings/EditFieldMappings.mock';
import { expect } from '@jest/globals';
import { act } from '@testing-library/react';
import { mount } from 'enzyme';
import EditFieldMappings from './EditFieldMapping';

describe('<EditFieldMappings /> spec', () => {
  it('renders the component', async () => {
    let wrapper;
    await act(async () => {
      wrapper = await mount(<EditFieldMappings {...props} />);
    });
    wrapper.update();
    expect(wrapper).toMatchSnapshot();
  });

  it('shares the existing mappings and edits with the parent', async () => {
    const replaceFieldMappings = jest.fn();
    const fieldMappingService = {
      getMappingsView: jest.fn().mockResolvedValue({
        ok: true,
        response: {
          properties: {
            'source.ip': { type: 'alias', path: 'src_ip' },
          },
          unmapped_index_fields: ['dst_ip', 'host'],
          unmapped_field_aliases: ['host.name'],
        },
      }),
      getMappings: jest.fn().mockResolvedValue({
        ok: true,
        response: {
          '.windows': {
            mappings: {
              properties: {
                'source.ip': { type: 'alias', path: 'src_ip' },
                destination: { properties: { ip: { type: 'alias', path: 'dst_ip' } } },
              },
            },
          },
        },
      }),
    };
    let wrapper;
    await act(async () => {
      wrapper = await mount(
        <EditFieldMappings
          {...props}
          fieldMappingService={fieldMappingService}
          replaceFieldMappings={replaceFieldMappings}
        />
      );
    });

    expect(replaceFieldMappings).toHaveBeenLastCalledWith([
      { ruleFieldName: 'source.ip', indexFieldName: 'src_ip' },
      { ruleFieldName: 'destination.ip', indexFieldName: 'dst_ip' },
    ]);

    wrapper.update();
    await act(async () => {
      wrapper.instance().onMappingCreation('host.name', 'host');
    });

    expect(replaceFieldMappings).toHaveBeenLastCalledWith([
      { ruleFieldName: 'source.ip', indexFieldName: 'src_ip' },
      { ruleFieldName: 'destination.ip', indexFieldName: 'dst_ip' },
      { ruleFieldName: 'host.name', indexFieldName: 'host' },
    ]);
  });
});
