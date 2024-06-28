/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EuiBasicTableColumn, EuiInMemoryTable, EuiPanel, EuiSpacer, EuiText } from '@elastic/eui';
import { ThreatIntelIocData } from '../../../../../types';
import { renderTime } from '../../../../utils/helpers';

export interface IoCstableProps {
  sourceId?: string;
  loadingIocs: boolean;
  iocs: ThreatIntelIocData[];
}

export const IoCstable: React.FC<IoCstableProps> = ({ sourceId, iocs, loadingIocs }) => {
  const columns: EuiBasicTableColumn<ThreatIntelIocData>[] = [
    {
      name: 'Value',
      field: 'value',
    },
    {
      name: 'Type',
      field: 'type',
    },
    {
      name: 'IoC matches',
      field: 'num_findings',
    },
    {
      name: 'Created',
      field: 'created',
      render: (timestamp: number | string) => renderTime(timestamp),
    },
    {
      name: 'Threat severity',
      field: 'severity',
    },
    {
      name: 'Last updated',
      field: 'modified',
      render: (timestamp: number | string) => renderTime(timestamp),
    },
  ];

  return (
    <EuiPanel>
      <EuiText>
        <span>{iocs.length} malicious IoCs</span>
      </EuiText>
      <EuiSpacer />
      <EuiInMemoryTable
        columns={columns}
        items={iocs}
        search
        pagination
        loading={!sourceId || loadingIocs}
      />
    </EuiPanel>
  );
};
