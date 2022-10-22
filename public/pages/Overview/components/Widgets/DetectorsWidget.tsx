/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiBasicTableColumn, EuiButton } from '@elastic/eui';
import { ROUTES } from '../../../../utils/constants';
import React from 'react';
import { DetectorItem } from '../../models/interfaces';
import { TableWidget } from './TableWidget';
import { WidgetContainer } from './WidgetContainer';

const columns: EuiBasicTableColumn<DetectorItem>[] = [
  {
    field: 'detectorName',
    name: 'Detector name',
    sortable: true,
    align: 'left',
  },
  {
    field: 'status',
    name: 'Status',
    sortable: false,
    align: 'left',
  },
  {
    field: 'logTypes',
    name: 'Log types',
    sortable: true,
    align: 'left',
    render: (logTypes: string[]) => <p>{logTypes[0]}</p>,
  },
];

export interface DetectorsWidgetProps {
  items: DetectorItem[];
}

export const DetectorsWidget: React.FC<DetectorsWidgetProps> = ({ items }) => {
  const actions = React.useMemo(
    () => [
      <EuiButton href={`#${ROUTES.DETECTORS}`}>View all detectors</EuiButton>,
      <EuiButton href={`#${ROUTES.DETECTORS_CREATE}`}>Create detector</EuiButton>,
    ],
    []
  );

  return (
    <WidgetContainer title={`Detectors (${2})`} actions={actions}>
      <TableWidget columns={columns} items={items} />
    </WidgetContainer>
  );
};
