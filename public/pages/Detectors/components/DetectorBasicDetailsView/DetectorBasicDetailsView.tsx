/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiSmallButton, EuiSpacer, EuiLink, EuiIcon, EuiText, EuiCallOut } from '@elastic/eui';
import React from 'react';
import { ContentPanel } from '../../../../components/ContentPanel';
import { buildRouteUrl, createTextDetailsGroup, parseSchedule } from '../../../../utils/helpers';
import moment from 'moment';
import {
  DEFAULT_EMPTY_DATA,
  logTypesWithDashboards,
  ROUTES,
  THREAT_INTEL_NAV_ID,
} from '../../../../utils/constants';
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
              <EuiSmallButton
                onClick={onEditClicked}
                data-test-subj={'edit-detector-basic-details'}
              >
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
      {threat_intel_enabled && (
        <EuiCallOut
          size="s"
          title={
            <p>
              To match your data against known indicators of compromise we recommend configuring
              scan using the new{' '}
              <EuiLink
                target="_blank"
                href={buildRouteUrl(THREAT_INTEL_NAV_ID, ROUTES.THREAT_INTEL_OVERVIEW)}
              >
                Threat Intelligence
              </EuiLink>{' '}
              platform and disabling threat intelligence in the detector.
            </p>
          }
        />
      )}
      {rulesCanFold ? children : null}
    </ContentPanel>
  );
};
