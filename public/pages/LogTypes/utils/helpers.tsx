/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EuiButtonIcon, EuiLink, EuiToolTip } from '@elastic/eui';
import { LogType } from '../../../../types';
import { capitalize } from 'lodash';

export const getLogTypesTableColumns = (
  showDetails: (id: string) => void,
  deleteLogType: (logTypeId: string) => void
) => [
  {
    field: 'name',
    name: 'Name',
    sortable: true,
    render: (name: string, item: LogType) => {
      return <EuiLink onClick={() => showDetails(item.id)}>{name}</EuiLink>;
    },
  },
  {
    field: 'description',
    name: 'Description',
    truncateText: false,
  },
  {
    field: 'source',
    name: 'Source',
    render: (source: string) => capitalize(source),
  },
  {
    name: 'Actions',
    actions: [
      {
        render: (item: LogType) => {
          return (
            <EuiToolTip content="Delete">
              <EuiButtonIcon
                aria-label={'Delete log type'}
                iconType={'trash'}
                color="danger"
                onClick={() => deleteLogType(item.id)}
              />
            </EuiToolTip>
          );
        },
      },
    ],
  },
];
