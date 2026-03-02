/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import {
  EuiBasicTableColumn,
  EuiToolTip,
  EuiSmallButtonIcon,
  EuiInMemoryTable,
} from '@elastic/eui';
import { CorrelationsTableData } from './CorrelationsContainer';
import { displayBadges, displaySeveritiesBadges, displayResourcesBadges } from '../utils/helpers';
import { DEFAULT_EMPTY_DATA } from '../../../utils/constants';

interface CorrelationsTableProps {
  correlationsTableData: CorrelationsTableData[];
  onViewDetails: (row: CorrelationsTableData) => void;
}

export const CorrelationsTable: React.FC<CorrelationsTableProps> = ({
  correlationsTableData,
  onViewDetails,
}) => {
  const alertSeverityMap: { [key: string]: string } = {
    '1': 'critical',
    '2': 'high',
    '3': 'medium',
    '4': 'low',
    '5': 'informational',
  };

  const columns: EuiBasicTableColumn<CorrelationsTableData>[] = [
    {
      field: 'startTime',
      name: 'Start Time',
      sortable: true,
      dataType: 'date',
      render: (startTime: number) => {
        return new Date(startTime).toLocaleString();
      },
    },
    {
      field: 'correlationRule',
      name: 'Correlation Rule',
      sortable: true,
      render: (name: string) => name || DEFAULT_EMPTY_DATA,
    },
    {
      field: 'logTypes',
      name: 'Integrations', // Changed from Log Types to Integrations by Wazuh
      sortable: true,
      render: (logTypes: string[]) => displayBadges(logTypes),
    },
    {
      field: 'alertSeverity',
      name: 'Alert Severity',
      sortable: true,
      render: (alertsSeverity: string[]) =>
        displaySeveritiesBadges(alertsSeverity.map((severity) => alertSeverityMap[severity])),
    },
    {
      field: 'findingsSeverity',
      name: 'Findings Severity',
      sortable: true,
      render: (findingsSeverity: string[]) => displaySeveritiesBadges(findingsSeverity),
    },
    {
      field: 'resources',
      name: 'Resources',
      sortable: true,
      render: (resources: string[]) => displayResourcesBadges(resources),
    },
    {
      field: 'actions',
      name: 'Actions',
      render: (_, correlationTableRow: CorrelationsTableData) => {
        return (
          <EuiToolTip content={'View details'}>
            <EuiSmallButtonIcon
              aria-label={'View details'}
              data-test-subj={`view-details-icon`}
              iconType={'inspect'}
              onClick={() => onViewDetails(correlationTableRow)}
            />
          </EuiToolTip>
        );
      },
    },
  ];

  const getRowProps = (item: any) => {
    return {
      'data-test-subj': `row-${item.id}`,
      key: item.id,
      className: 'euiTableRow',
    };
  };

  return (
    <EuiInMemoryTable
      items={correlationsTableData}
      rowProps={getRowProps}
      columns={columns}
      pagination={{
        initialPageSize: 5,
        pageSizeOptions: [5, 10, 20],
      }}
      responsive={true}
      tableLayout="auto"
    />
  );
};
