/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiBasicTableColumn, EuiInMemoryTable } from '@elastic/eui';
import { ThreatIntelAlert } from '../../../../../types';
import React from 'react';
import { renderIoCType, renderTime } from '../../../../utils/helpers';
import { DEFAULT_EMPTY_DATA } from '../../../../utils/constants';
import { parseAlertSeverityToOption } from '../../../CreateDetector/components/ConfigureAlerts/utils/helpers';

export interface ThreatIntelAlertsTableProps {
  alerts: ThreatIntelAlert[];
}

export const ThreatIntelAlertsTable: React.FC<ThreatIntelAlertsTableProps> = ({ alerts }) => {
  const columns: EuiBasicTableColumn<ThreatIntelAlert>[] = [
    {
      field: 'start_time',
      name: 'Start time',
      render: (startTime: number) => renderTime(startTime),
    },
    {
      field: 'ioc_type',
      name: 'Indicator type',
      render: (iocType: string) => renderIoCType(iocType),
    },
    { field: 'state', name: 'Status', render: (state: string) => state || DEFAULT_EMPTY_DATA },
    {
      field: 'severity',
      name: 'Severity',
      render: (severity: string) =>
        parseAlertSeverityToOption(severity)?.label || DEFAULT_EMPTY_DATA,
    },
  ];

  return <EuiInMemoryTable columns={columns} items={alerts} pagination search />;
};
