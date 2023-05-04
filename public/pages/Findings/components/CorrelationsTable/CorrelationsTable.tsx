/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CorrelationFinding } from '../../../../../types';
import { ruleTypes } from '../../../Rules/utils/constants';
import { DEFAULT_EMPTY_DATA, ROUTES } from '../../../../utils/constants';
import { getSeverityBadge } from '../../../Rules/utils/helpers';
import {
  EuiButton,
  EuiButtonIcon,
  EuiFlexGroup,
  EuiFlexItem,
  EuiTitle,
  EuiText,
  EuiPanel,
  EuiInMemoryTable,
  EuiBasicTableColumn,
} from '@elastic/eui';
import { RIGHT_ALIGNMENT } from '@elastic/eui/lib/services';
import { FindingItemType } from '../../containers/Findings/Findings';
import { RouteComponentProps } from 'react-router-dom';

export interface CorrelationsTableProps {
  finding: FindingItemType;
  correlatedFindings: CorrelationFinding[];
  history: RouteComponentProps['history'];
  isLoading: boolean;
}

export const CorrelationsTable: React.FC<CorrelationsTableProps> = ({
  correlatedFindings,
  finding,
  history,
  isLoading,
}) => {
  const [itemIdToExpandedRowMap, setItemIdToExpandedRowMap] = useState<{
    [key: string]: JSX.Element;
  }>({});

  const toggleCorrelationDetails = (item: any) => {
    const itemIdToExpandedRowMapValues = { ...itemIdToExpandedRowMap };
    if (itemIdToExpandedRowMapValues[item.id]) {
      delete itemIdToExpandedRowMapValues[item.id];
    } else {
      itemIdToExpandedRowMapValues[item.id] = (
        <EuiPanel color="subdued" className={'correlations-table-details-row'}>
          <EuiFlexGroup justifyContent="flexStart">
            <EuiFlexItem grow={false} style={{ minWidth: 200 }}>
              <EuiText size={'xs'}>Finding ID</EuiText>
            </EuiFlexItem>
            <EuiFlexItem grow={true}>
              <EuiText size={'xs'} className={'correlations-table-details-row-value'}>
                {item.id}
              </EuiText>
            </EuiFlexItem>
          </EuiFlexGroup>

          <EuiFlexGroup justifyContent="flexStart">
            <EuiFlexItem grow={false} style={{ minWidth: 200 }}>
              <EuiText size={'xs'}>Threat detector</EuiText>
            </EuiFlexItem>
            <EuiFlexItem grow={true}>
              <EuiText size={'xs'} className={'correlations-table-details-row-value'}>
                {item.detectorName}
              </EuiText>
            </EuiFlexItem>
          </EuiFlexGroup>

          <EuiFlexGroup justifyContent="flexStart">
            <EuiFlexItem grow={false} style={{ minWidth: 200 }}>
              <EuiText size={'xs'}>Detection rule</EuiText>
            </EuiFlexItem>
            <EuiFlexItem grow={true}>
              <EuiText size={'xs'} className={'correlations-table-details-row-value'}>
                {item.detectionRule?.name || '-'}
              </EuiText>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiPanel>
      );
    }

    setItemIdToExpandedRowMap(itemIdToExpandedRowMapValues);
  };

  const columns: EuiBasicTableColumn<CorrelationFinding>[] = [
    {
      field: 'timestamp',
      name: 'Time',
      sortable: true,
    },
    {
      name: 'Correlated rule',
      truncateText: true,
      render: (item: CorrelationFinding) => item?.correlationRule.name || DEFAULT_EMPTY_DATA,
    },
    {
      field: 'logType',
      name: 'Log type',
      sortable: true,
      render: (category: string) =>
        // TODO: This formatting may need some refactoring depending on the response payload
        ruleTypes.find((ruleType) => ruleType.value === category)?.label || DEFAULT_EMPTY_DATA,
    },
    {
      name: 'Rule severity',
      truncateText: true,
      align: 'center',
      render: (item: CorrelationFinding) => getSeverityBadge(item.detectionRule.severity),
    },
    {
      field: 'correlationScore',
      name: 'Score',
      sortable: true,
    },
    {
      align: RIGHT_ALIGNMENT,
      width: '40px',
      isExpander: true,
      render: (item: any) => (
        <EuiButtonIcon
          onClick={() => toggleCorrelationDetails(item)}
          aria-label={itemIdToExpandedRowMap[item.id] ? 'Collapse' : 'Expand'}
          iconType={itemIdToExpandedRowMap[item.id] ? 'arrowUp' : 'arrowDown'}
        />
      ),
    },
  ];

  const goToCorrelationsPage = () => {
    history.push({
      pathname: `${ROUTES.CORRELATIONS}`,
      state: {
        finding: finding,
        correlatedFindings: correlatedFindings,
      },
    });
  };

  return (
    <>
      <EuiFlexGroup>
        <EuiFlexItem>
          <EuiTitle size="s">
            <h3>Correlated findings</h3>
          </EuiTitle>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiButton
            onClick={() => goToCorrelationsPage()}
            disabled={correlatedFindings.length === 0}
          >
            View correlations graph
          </EuiButton>
        </EuiFlexItem>
      </EuiFlexGroup>
      <EuiFlexGroup>
        <EuiFlexItem>
          <EuiInMemoryTable
            columns={columns}
            items={correlatedFindings}
            itemId="id"
            itemIdToExpandedRowMap={itemIdToExpandedRowMap}
            isExpandable={true}
            hasActions={true}
            pagination={true}
            search={true}
            sorting={true}
            loading={isLoading}
          />
        </EuiFlexItem>
      </EuiFlexGroup>
    </>
  );
};
