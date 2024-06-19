/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiBasicTableColumn,
  EuiButtonIcon,
  EuiFlexGroup,
  EuiFlexItem,
  EuiInMemoryTable,
  EuiPanel,
  EuiSpacer,
  EuiText,
  EuiTitle,
} from '@elastic/eui';
import { ThreatIntelLogSource } from '../../../../../types';
import React, { useMemo } from 'react';
import { ConfigActionButton } from '../Utility/ConfigActionButton';

export interface ThreatIntelLogSourcesProps {
  logSources: ThreatIntelLogSource[];
  threatIntelSourceCount: number;
  scanConfigActionHandler: () => void;
}

export const ThreatIntelLogSources: React.FC<ThreatIntelLogSourcesProps> = ({
  logSources,
  threatIntelSourceCount,
  scanConfigActionHandler,
}) => {
  const columns: EuiBasicTableColumn<ThreatIntelLogSource>[] = useMemo(
    () => [
      {
        field: 'name',
        name: 'Index/Alias',
        render: (name: string) => <EuiText>{name}</EuiText>,
      },
      {
        name: 'Indicator types',
        render: ({ iocConfigMap }: ThreatIntelLogSource) => {
          return Object.entries(iocConfigMap)
            .filter(([_ioc, config]) => config.enabled)
            .map(([ioc]) => ioc)
            .join(', ');
        },
      },
      {
        name: 'Actions',
        actions: [
          {
            name: 'Inspect',
            render: (item) => {
              return <EuiButtonIcon iconType={'inspect'} />;
            },
          },
        ],
      },
    ],
    []
  );

  return (
    <EuiPanel>
      <EuiSpacer size="m" />
      <EuiFlexGroup alignItems="flexStart">
        <EuiFlexItem>
          <EuiTitle>
            <h4>Log sources</h4>
          </EuiTitle>
          <EuiSpacer size="xs" />
          <EuiText color="subdued">
            <span>
              To perform detection the IoC from threat intelligence feeds have to be matched against
              selected fields in your data.
            </span>
          </EuiText>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <ConfigActionButton
            action={threatIntelSourceCount > 0 && logSources.length ? 'edit' : 'configure'}
            actionHandler={scanConfigActionHandler}
            disabled={threatIntelSourceCount === 0}
          />
        </EuiFlexItem>
      </EuiFlexGroup>
      <EuiSpacer />
      <EuiInMemoryTable columns={columns} items={logSources} pagination search />
    </EuiPanel>
  );
};
