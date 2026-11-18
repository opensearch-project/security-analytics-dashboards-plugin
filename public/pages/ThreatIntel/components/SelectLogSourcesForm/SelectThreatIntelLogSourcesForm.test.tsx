/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { mockContexts } from '../../../../../test/mocks/useContext.mock';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { SelectThreatIntelLogSources } from './SelectThreatIntelLogSourcesForm';
import { getDataSources, getFieldsForIndex } from '../../../../utils/helpers';

jest.mock('../../../../services', () => ({
  SecurityAnalyticsContext: jest.requireActual('react').createContext(null),
}));
jest.mock('../../../../utils/helpers', () => ({
  getDataSources: jest.fn(),
  getFieldsForIndex: jest.fn(),
  renderIoCType: (value: string) => value,
}));
jest.mock(
  '../../../CreateDetector/components/DefineDetector/components/DetectorSchedule/Interval',
  () => ({
    Interval: () => null,
  })
);
jest.mock('@elastic/eui', () => {
  const ActualReact = jest.requireActual('react');
  const wrapper = ({ children }: any) => ActualReact.createElement('div', null, children);
  return {
    ...Object.fromEntries(
      [
        'EuiAccordion',
        'EuiBadge',
        'EuiSmallButtonEmpty',
        'EuiFlexGroup',
        'EuiFlexItem',
        'EuiCompressedFormRow',
        'EuiIcon',
        'EuiPanel',
        'EuiPopover',
        'EuiSpacer',
        'EuiText',
        'EuiTitle',
      ].map((name) => [name, wrapper])
    ),
    EuiCompressedComboBox: ({ options, onChange }: any) =>
      ActualReact.createElement(
        'select',
        {
          'aria-label': 'Log sources',
          defaultValue: '',
          onChange: (event: any) => onChange([{ label: event.target.value }]),
        },
        ActualReact.createElement('option', { value: '' }, 'Select a source'),
        options
          .flatMap((group: any) => group.options)
          .map(({ label }: any) =>
            ActualReact.createElement('option', { key: label, value: label }, label)
          )
      ),
  };
});

afterEach(() => jest.restoreAllMocks());

test('loads data streams and preserves the logical name when selecting a scan source', async () => {
  const indexService = {};
  const fieldMappingService = {};
  const notifications = {};
  const updateSources = jest.fn();
  jest.replaceProperty(mockContexts, 'services', { indexService, fieldMappingService } as any);
  (getDataSources as jest.Mock).mockResolvedValue({
    ok: true,
    dataSources: [
      { label: 'Data streams', options: [{ label: 'logs-stream', value: 'logs-stream' }] },
    ],
  });
  (getFieldsForIndex as jest.Mock).mockResolvedValue([{ label: 'source.ip', value: 'source.ip' }]);

  render(
    React.createElement(SelectThreatIntelLogSources, {
      sources: [],
      schedule: { period: { interval: 1, unit: 'MINUTES' } },
      notifications: notifications as any,
      updateSources,
      updateSchedule: jest.fn(),
      threatIntelService: {
        searchThreatIntelSource: jest.fn().mockResolvedValue({ ok: true, response: [] }),
      } as any,
    })
  );

  await screen.findByRole('option', { name: 'logs-stream' });
  expect(getDataSources).toHaveBeenCalledWith(indexService, notifications, {
    includeDataStreams: true,
  });

  fireEvent.change(screen.getByRole('combobox', { name: 'Log sources' }), {
    target: { value: 'logs-stream' },
  });
  expect(updateSources).toHaveBeenCalledWith([{ name: 'logs-stream', iocConfigMap: {} }]);
  await waitFor(() =>
    expect(getFieldsForIndex).toHaveBeenCalledWith(fieldMappingService, 'logs-stream')
  );
});
