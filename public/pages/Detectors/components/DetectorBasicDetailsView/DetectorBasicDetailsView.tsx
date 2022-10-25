/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiButton } from '@elastic/eui';
import React from 'react';
import { ContentPanel } from '../../../../components/ContentPanel';
import { createTextDetailsGroup, parseSchedule } from '../../../../utils/helpers';
import moment from 'moment';
import { Detector } from '../../../../../models/interfaces';

export interface DetectorBasicDetailsViewProps {
  detector: Detector;
  enabled_time?: number;
  last_update_time?: number;
  onEditClicked: () => void;
}

export const DetectorBasicDetailsView = ({
  detector,
  onEditClicked,
  enabled_time,
  last_update_time,
}: DetectorBasicDetailsViewProps) => {
  const { name, detector_type, inputs, schedule } = detector;
  const detectorSchedule = parseSchedule(schedule);
  const createdAt = enabled_time ? moment(enabled_time).format('YYYY-MM-DDTHH:mm') : undefined;
  const lastUpdated = last_update_time
    ? moment(last_update_time).format('YYYY-MM-DDTHH:mm')
    : undefined;
  const timeData = [];
  if (createdAt) {
    timeData.push({ label: 'Created at', content: createdAt });
  }
  if (lastUpdated) {
    timeData.push({ label: 'Last updated time', content: lastUpdated });
  }

  return (
    <ContentPanel
      title={'Detector details'}
      actions={[<EuiButton onClick={onEditClicked}>Edit</EuiButton>]}
    >
      {createTextDetailsGroup([
        { label: 'Detector name', content: name },
        { label: 'Log type', content: detector_type },
        { label: 'Data source', content: inputs[0].detector_input.indices[0] },
      ])}
      {createTextDetailsGroup([
        { label: 'Description', content: inputs[0].detector_input.description },
        { label: 'Detector schedule', content: detectorSchedule },
        ...timeData,
      ])}
    </ContentPanel>
  );
};
