/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EuiBasicTableColumn, EuiInMemoryTable, EuiPanel, EuiSpacer, EuiText } from '@elastic/eui';
import { ThreatIntelIocData } from '../../../../../types';
import { renderTime } from '../../../../utils/helpers';
import { IocLabel, ThreatIntelIocType } from '../../../../../common/constants';

export interface IoCsTableProps {
  sourceId?: string;
  loadingIoCs: boolean;
  iocs: ThreatIntelIocData[];
}

export const IoCsTable: React.FC<IoCsTableProps> = ({ sourceId, iocs, loadingIoCs }) => {
  const columns: EuiBasicTableColumn<ThreatIntelIocData>[] = [
    {
      name: 'Value',
      field: 'value',
    },
    {
      name: 'Type',
      field: 'type',
      render: (type: string) => IocLabel[type as ThreatIntelIocType],
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
        loading={!sourceId || loadingIoCs}
      />
    </EuiPanel>
  );
};
