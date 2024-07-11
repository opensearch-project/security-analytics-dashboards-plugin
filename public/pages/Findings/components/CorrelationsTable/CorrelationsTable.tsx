/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CorrelationFinding, FindingItemType } from '../../../../../types';
import { ruleTypes } from '../../../Rules/utils/constants';
import { DEFAULT_EMPTY_DATA, ROUTES } from '../../../../utils/constants';
import {
  EuiSmallButton,
  EuiSmallButtonIcon,
  EuiFlexGroup,
  EuiFlexItem,
  EuiTitle,
  EuiText,
  EuiPanel,
  EuiInMemoryTable,
  EuiBasicTableColumn,
  EuiPopover,
} from '@elastic/eui';
import { FieldValueSelectionFilterConfigType } from '@elastic/eui/src/components/search_bar/filters/field_value_selection_filter';
import { RouteComponentProps } from 'react-router-dom';
import { DataStore } from '../../../../store/DataStore';
import { capitalizeFirstLetter, formatRuleType, getSeverityBadge } from '../../../../utils/helpers';
import { parseAlertSeverityToOption } from '../../../CreateDetector/components/ConfigureAlerts/utils/helpers';

export interface CorrelationsTableProps {
  finding: FindingItemType;
  correlatedFindings: CorrelationFinding[];
  history: RouteComponentProps['history'];
  isLoading: boolean;
  filterOptions: {
    logTypes: Set<string>;
    ruleSeverity: Set<string>;
  };
}

export const CorrelationsTable: React.FC<CorrelationsTableProps> = ({
  correlatedFindings,
  finding,
  history,
  isLoading,
  filterOptions: { logTypes, ruleSeverity },
}) => {
  const [itemIdToExpandedRowMap, setItemIdToExpandedRowMap] = useState<{
    [key: string]: JSX.Element;
  }>({});
  const [copiedFindingId, setCopiedFindingId] = useState('');
  const [copyPopoverTimeout, setCopyPopoverTimeout] = useState<number | undefined>(undefined);

  const toggleCorrelationDetails = (item: CorrelationFinding) => {
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

  const actions = [
    {
      render: (item: CorrelationFinding) => (
        <EuiSmallButtonIcon
          onClick={() => toggleCorrelationDetails(item)}
          aria-label={itemIdToExpandedRowMap[item.id] ? 'Collapse' : 'Expand'}
          iconType={itemIdToExpandedRowMap[item.id] ? 'arrowUp' : 'arrowDown'}
        />
      ),
    },
  ];

  if (window.navigator?.clipboard) {
    const copyFindingIdToClipboard = (findingId: string) => {
      try {
        window.navigator.clipboard.writeText(findingId);
        setCopiedFindingId(findingId);
        window.clearTimeout(copyPopoverTimeout);
        setCopyPopoverTimeout(
          window.setTimeout(() => {
            setCopiedFindingId('');
          }, 1000)
        );
      } catch (error: any) {
        console.error('Failed to copy id');
      }
    };

    actions.unshift({
      render: (item: CorrelationFinding) => (
        <EuiPopover
          button={
            <EuiSmallButtonIcon
              onClick={() => copyFindingIdToClipboard(item.id)}
              aria-label="Copy"
              iconType="copy"
            />
          }
          isOpen={copiedFindingId === item.id}
          closePopover={() => setCopiedFindingId('')}
          anchorPosition="upCenter"
        >
          <EuiText>Finding id copied</EuiText>
        </EuiPopover>
      ),
    });
  }

  const columns: EuiBasicTableColumn<CorrelationFinding>[] = [
    {
      field: 'timestamp',
      name: 'Time',
      sortable: true,
    },
    {
      name: 'Correlated rule',
      truncateText: true,
      render: (item: CorrelationFinding) => item?.correlationRule?.name || DEFAULT_EMPTY_DATA,
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
      field: 'detectionRule.severity',
      truncateText: true,
      sortable: true,
      align: 'left',
      render: (severity: string) => getSeverityBadge(severity),
    },
    {
      field: 'correlationScore',
      name: 'Score',
      sortable: true,
    },
    {
      name: 'Actions',
      actions,
      isExpander: true,
    },
  ];

  const search = {
    box: {
      placeholder: 'Search findings',
      schema: true,
    },
    filters: [
      {
        type: 'field_value_selection',
        field: 'detectionRule.severity',
        name: 'Rule severity',
        options: Array.from(ruleSeverity).map((severity) => {
          const name =
            parseAlertSeverityToOption(severity)?.label || capitalizeFirstLetter(severity);
          return { value: severity, name: name || severity };
        }),
        multiSelect: 'or',
      } as FieldValueSelectionFilterConfigType,
      {
        type: 'field_value_selection',
        field: 'logType',
        name: 'Log type',
        options: Array.from(logTypes).map((type) => ({
          value: type,
          name: formatRuleType(type),
        })),
        multiSelect: 'or',
      } as FieldValueSelectionFilterConfigType,
    ],
  };

  const goToCorrelationsPage = () => {
    DataStore.findings.closeFlyout();
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
          <EuiSmallButton
            onClick={() => goToCorrelationsPage()}
            disabled={correlatedFindings.length === 0}
          >
            View correlations graph
          </EuiSmallButton>
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
            search={search}
            sorting={{
              sort: {
                field: 'timestamp',
                direction: 'desc',
              },
            }}
            loading={isLoading}
          />
        </EuiFlexItem>
      </EuiFlexGroup>
    </>
  );
};
