/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiSmallButton, EuiSpacer, EuiLink, EuiIcon, EuiText } from '@elastic/eui';
import React from 'react';
import { ContentPanel } from '../../../../components/ContentPanel';
import { createTextDetailsGroup, parseSchedule } from '../../../../utils/helpers';
import moment from 'moment';
import { DEFAULT_EMPTY_DATA, logTypesWithDashboards } from '../../../../utils/constants';
import { Detector } from '../../../../../types';
import { getLogTypeLabel } from '../../../LogTypes/utils/helpers';

export interface DetectorBasicDetailsViewProps {
  detector: Detector;
  dashboardId?: string;
  rulesCanFold?: boolean;
  enabled_time?: number;
  last_update_time?: number;
  onEditClicked: () => void;
  isEditable: boolean;
}

export const DetectorBasicDetailsView: React.FC<DetectorBasicDetailsViewProps> = ({
  detector,
  enabled_time,
  last_update_time,
  rulesCanFold,
  children,
  dashboardId,
  onEditClicked,
  isEditable = true,
}) => {
  const { name, detector_type, inputs, schedule, threat_intel_enabled } = detector;
  const detectorSchedule = parseSchedule(schedule);
  const createdAt = enabled_time ? moment(enabled_time).format('YYYY-MM-DDTHH:mm') : undefined;
  const lastUpdated = last_update_time
    ? moment(last_update_time).format('YYYY-MM-DDTHH:mm')
    : undefined;
  const totalSelected = detector.inputs.reduce((sum, inputObj) => {
    return (
      sum +
      inputObj.detector_input.custom_rules.length +
      inputObj.detector_input.pre_packaged_rules.length
    );
  }, 0);
  return (
    <ContentPanel
      title={'Detector details'}
      actions={
        isEditable
          ? [
              <EuiSmallButton onClick={onEditClicked} data-test-subj={'edit-detector-basic-details'}>
                Edit
              </EuiSmallButton>,
            ]
          : null
      }
    >
      <EuiSpacer size={'l'} />
      {createTextDetailsGroup([
        { label: 'Detector name', content: name },
        {
          label: 'Description',
          content: inputs[0].detector_input.description || DEFAULT_EMPTY_DATA,
        },
        { label: 'Detector schedule', content: detectorSchedule },
      ])}
      {createTextDetailsGroup([
        {
          label: 'Data source',
          content: (
            <>
              {inputs[0].detector_input.indices.map((ind: string) => (
                <EuiText key={ind}>{ind}</EuiText>
              ))}
            </>
          ),
        },
        { label: 'Log type', content: getLogTypeLabel(detector_type.toLowerCase()) },
        {
          label: 'Detector dashboard',
          content: dashboardId ? (
            <EuiLink onClick={() => window.open(`dashboards#/view/${dashboardId}`, '_blank')}>
              {`${name} summary`}
              <EuiIcon type={'popout'} />
            </EuiLink>
          ) : !logTypesWithDashboards.has(detector_type) ? (
            'Not available for this log type'
          ) : (
            '-'
          ),
        },
      ])}
      {createTextDetailsGroup([
        { label: 'Detection rules', content: totalSelected },
        { label: 'Created at', content: createdAt || DEFAULT_EMPTY_DATA },
        { label: 'Last updated time', content: lastUpdated || DEFAULT_EMPTY_DATA },
      ])}
      {createTextDetailsGroup([
        { label: 'Threat intelligence', content: threat_intel_enabled ? 'Enabled' : 'Disabled' },
      ])}
      {rulesCanFold ? children : null}
    </ContentPanel>
  );
};
