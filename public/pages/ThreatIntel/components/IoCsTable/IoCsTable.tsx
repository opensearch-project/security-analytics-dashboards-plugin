/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useContext, useEffect, useState } from 'react';
import { EuiBasicTableColumn, EuiInMemoryTable, EuiPanel, EuiSpacer, EuiText } from '@elastic/eui';
import { ThreatIntelIocData } from '../../../../../types';
import { SecurityAnalyticsContext } from '../../../../services';
import moment from 'moment';

export interface IoCstableProps {
  sourceId?: string;
}

export const IoCstable: React.FC<IoCstableProps> = ({ sourceId }) => {
  const saContext = useContext(SecurityAnalyticsContext);
  const [iocs, setIocs] = useState<ThreatIntelIocData[]>([]);
  const [loadingIocs, setLoadingIocs] = useState(true);
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
      render: (timestamp: number | string) => moment(timestamp).format('YYYY-MM-DDTHH:mm'),
    },
    {
      name: 'Threat severity',
      field: 'severity',
    },
    {
      name: 'Last updated',
      field: 'modified',
      render: (timestamp: number | string) => moment(timestamp).format('YYYY-MM-DDTHH:mm'),
    },
  ];

  useEffect(() => {
    const getIocs = async () => {
      if (saContext && sourceId) {
        setLoadingIocs(true);
        const iocsRes = await saContext.services.threatIntelService.getThreatIntelIocs({});

        if (iocsRes.ok) {
          setIocs(iocsRes.response.iocs);
        }
        setLoadingIocs(false);
      }
    };

    getIocs();
  }, [saContext]);

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
