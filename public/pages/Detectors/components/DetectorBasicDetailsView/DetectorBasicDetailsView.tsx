/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiButton, EuiSpacer, EuiLink } from '@elastic/eui';
import React from 'react';
import { ContentPanel } from '../../../../components/ContentPanel';
import { createTextDetailsGroup, parseSchedule } from '../../../../utils/helpers';
import moment from 'moment';
import { Detector } from '../../../../../models/interfaces';
import { DEFAULT_EMPTY_DATA } from '../../../../utils/constants';

export interface DetectorBasicDetailsViewProps {
  detector: Detector;
  dashboardId?: string;
  rulesCanFold?: boolean;
  enabled_time?: number;
  last_update_time?: number;
  onEditClicked: () => void;
}

export const DetectorBasicDetailsView: React.FC<DetectorBasicDetailsViewProps> = ({
  detector,
  enabled_time,
  last_update_time,
  rulesCanFold,
  children,
  dashboardId,
  onEditClicked,
}) => {
  const { name, detector_type, inputs, schedule } = detector;
  const detectorSchedule = parseSchedule(schedule);
  const createdAt = enabled_time ? moment(enabled_time).format('YYYY-MM-DDTHH:mm') : undefined;
  const lastUpdated = last_update_time
    ? moment(last_update_time).format('YYYY-MM-DDTHH:mm')
    : undefined;
  const firstTextDetailsGroupEntries = [
    { label: 'Detector name', content: name },
    { label: 'Log type', content: detector_type.toLowerCase() },
    { label: 'Data source', content: inputs[0].detector_input.indices[0] },
  ];

  if (dashboardId) {
    firstTextDetailsGroupEntries.push({
      label: 'Detector dashboard',
      content: (
        <EuiLink onClick={() => window.open(`dashboards#/view/${dashboardId}`, '_self')}>
          {}
        </EuiLink>
      ) as any,
    });
  }

  return (
    <ContentPanel
      title={'Detector details'}
      actions={[
        <EuiButton onClick={onEditClicked} data-test-subj={'edit-detector-basic-details'}>
          Edit
        </EuiButton>,
      ]}
    >
      <EuiSpacer size={'l'} />
      {createTextDetailsGroup(firstTextDetailsGroupEntries, 4)}
      {createTextDetailsGroup(
        [
          { label: 'Description', content: inputs[0].detector_input.description },
          { label: 'Detector schedule', content: detectorSchedule },
          { label: 'Created at', content: createdAt || DEFAULT_EMPTY_DATA },
          { label: 'Last updated time', content: lastUpdated || DEFAULT_EMPTY_DATA },
        ],
        4
      )}
      {rulesCanFold ? children : null}
    </ContentPanel>
  );
};
