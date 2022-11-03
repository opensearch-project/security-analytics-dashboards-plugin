/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiBasicTableColumn, EuiButton, EuiLink } from '@elastic/eui';
import { ROUTES } from '../../../../utils/constants';
import React, { useCallback } from 'react';
import { DetectorItem } from '../../models/interfaces';
import { TableWidget } from './TableWidget';
import { WidgetContainer } from './WidgetContainer';
import { DetectorHit } from '../../../../../server/models/interfaces';
import { RouteComponentProps } from 'react-router-dom';
import { capitalizeFirstLetter } from '../../../../utils/helpers';

type DetectorIdToHit = { [id: string]: DetectorHit };

const getColumns = (
  detectorIdToHit: DetectorIdToHit,
  showDetectorDetails: (hit: DetectorHit) => void
): EuiBasicTableColumn<DetectorItem>[] => [
  {
    name: 'Detector name',
    render: (item: DetectorItem) => (
      <EuiLink onClick={() => showDetectorDetails(detectorIdToHit[item.id])}>
        {item.detectorName}
      </EuiLink>
    ),
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
    render: (logType: string) => capitalizeFirstLetter(logType),
  },
];

export interface DetectorsWidgetProps extends RouteComponentProps {
  detectorHits: DetectorHit[];
}

export const DetectorsWidget: React.FC<DetectorsWidgetProps> = ({ detectorHits, history }) => {
  const detectors = detectorHits.map((detectorHit) => ({
    detectorName: detectorHit._source.name,
    id: detectorHit._id,
    logTypes: detectorHit._source.detector_type.toLowerCase(),
    status: detectorHit._source.enabled ? 'Active' : 'Inactive',
  }));

  const detectorIdToHit: DetectorIdToHit = {};
  detectorHits.forEach((hit) => {
    detectorIdToHit[hit._id] = hit;
  });

  const showDetectorDetails = useCallback((detectorHit: DetectorHit) => {
    history.push({
      pathname: ROUTES.DETECTOR_DETAILS,
      state: { detectorHit },
    });
  }, []);

  const actions = React.useMemo(
    () => [
      <EuiButton href={`#${ROUTES.DETECTORS}`}>View all detectors</EuiButton>,
      <EuiButton href={`#${ROUTES.DETECTORS_CREATE}`}>Create detector</EuiButton>,
    ],
    []
  );

  return (
    <WidgetContainer title={`Detectors (${detectors.length})`} actions={actions}>
      <TableWidget columns={getColumns(detectorIdToHit, showDetectorDetails)} items={detectors} />
    </WidgetContainer>
  );
};
