/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiBasicTableColumn, EuiButtonIcon, EuiInMemoryTable, EuiToolTip } from '@elastic/eui';
import { ThreatIntelFinding } from '../../../../../types';
import React from 'react';
import { renderTime } from '../../../../utils/helpers';
import { DEFAULT_EMPTY_DATA } from '../../../../utils/constants';
import { DataStore } from '../../../../store/DataStore';

export interface ThreatIntelFindingsTableProps {
  findingItems: ThreatIntelFinding[];
}

export const ThreatIntelFindingsTable: React.FC<ThreatIntelFindingsTableProps> = ({
  findingItems,
}) => {
  const columns: EuiBasicTableColumn<ThreatIntelFinding>[] = [
    {
      name: 'Time',
      field: 'timestamp',
      render: (timestamp: number) => renderTime(timestamp),
    },
    {
      name: 'Indicator of compromise',
      field: 'ioc_value',
    },
    {
      name: 'Indicator type',
      field: 'ioc_type',
    },
    {
      name: 'Threat intel source',
      field: 'ioc_feed_ids',
      render: (ioc_feed_ids: ThreatIntelFinding['ioc_feed_ids']) => {
        return <span>{ioc_feed_ids[0]?.feed_id ?? DEFAULT_EMPTY_DATA}</span>;
      },
    },
    {
      name: 'Actions',
      actions: [
        {
          render: (finding) => (
            <EuiToolTip content={'View details'}>
              <EuiButtonIcon
                aria-label={'View details'}
                data-test-subj={`view-details-icon`}
                iconType={'inspect'}
                onClick={
                  () => {}
                  // TODO: implement finding flyout
                  // DataStore.findings.openFlyout(finding, this.state.filteredFindings)
                }
              />
            </EuiToolTip>
          ),
        },
      ],
    },
  ];

  return <EuiInMemoryTable columns={columns} items={findingItems} pagination search />;
};
