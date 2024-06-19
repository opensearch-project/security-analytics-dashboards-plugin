/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { EuiBasicTableColumn, EuiInMemoryTable, EuiPanel, EuiSpacer, EuiText } from '@elastic/eui';
import { ThreatIntelIocData } from '../../../../../types';
import { dummyIoCDetails } from '../../utils/constants';

export interface IoCstableProps {}

export const IoCstable: React.FC<IoCstableProps> = () => {
  const [iocs, setIocs] = useState([dummyIoCDetails]);
  const columns: EuiBasicTableColumn<ThreatIntelIocData>[] = [
    {
      name: 'Value',
      field: 'value',
    },
    {
      name: 'Type',
      field: 'type',
    },
    // {
    //   name: "Feed",
    //   field: ""
    // },
    {
      name: 'Created',
      field: 'created',
      render: (timestamp: number) => new Date(timestamp).toLocaleString(),
    },
    {
      name: 'Threat severity',
      field: 'severity',
    },
    {
      name: 'Last updated',
      field: 'modified',
      render: (timestamp: number) => new Date(timestamp).toLocaleString(),
    },
  ];

  return (
    <EuiPanel>
      <EuiText>
        <span>{iocs.length} malicious IoCs</span>
      </EuiText>
      <EuiSpacer />
      <EuiInMemoryTable columns={columns} items={iocs} search pagination />
    </EuiPanel>
  );
};
