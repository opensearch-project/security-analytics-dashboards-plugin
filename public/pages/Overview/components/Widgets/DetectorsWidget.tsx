/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiBasicTableColumn, EuiSmallButton, EuiEmptyPrompt, EuiLink } from '@elastic/eui';
import { ROUTES } from '../../../../utils/constants';
import React, { useCallback } from 'react';
import { TableWidget } from './TableWidget';
import { WidgetContainer } from './WidgetContainer';
import { DetectorHit } from '../../../../../server/models/interfaces';
import { RouteComponentProps } from 'react-router-dom';
import { formatRuleType } from '../../../../utils/helpers';
import { DetectorItem } from '../../../../../types';

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
    render: (logType: string) => formatRuleType(logType),
  },
];

export interface DetectorsWidgetProps extends RouteComponentProps {
  detectorHits: DetectorHit[];
  loading?: boolean;
}

export const DetectorsWidget: React.FC<DetectorsWidgetProps> = ({
  detectorHits,
  history,
  loading = false,
}) => {
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
      pathname: `${ROUTES.DETECTOR_DETAILS}/${detectorHit._id}`,
      state: { detectorHit },
    });
  }, []);

  const widgetEmptyMessage =
    detectors.length === 0 ? (
      <EuiEmptyPrompt
        body={
          <p>
            <span style={{ display: 'block' }}>No security detectors.</span>Create a detector to
            generate findings.
          </p>
        }
        actions={[
          <EuiSmallButton fill={false} href={`#${ROUTES.DETECTORS_CREATE}`}>
            Create detector
          </EuiSmallButton>,
        ]}
      />
    ) : undefined;

  const actions = React.useMemo(
    () => [
      <EuiSmallButton href={`#${ROUTES.DETECTORS}`}>View all detectors</EuiSmallButton>,
      <EuiSmallButton href={`#${ROUTES.DETECTORS_CREATE}`}>Create detector</EuiSmallButton>,
    ],
    []
  );

  return (
    <WidgetContainer title={`Detectors (${detectors.length})`} actions={actions}>
      <TableWidget
        columns={getColumns(detectorIdToHit, showDetectorDetails)}
        items={detectors}
        loading={loading}
        message={widgetEmptyMessage}
        className={widgetEmptyMessage ? 'sa-overview-widget-empty' : undefined}
      />
    </WidgetContainer>
  );
};
