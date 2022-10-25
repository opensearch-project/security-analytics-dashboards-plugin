/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { DetectorBasicDetailsView } from '../../components/DetectorBasicDetailsView/DetectorBasicDetailsView';
import { RouteComponentProps } from 'react-router-dom';
import { ROUTES } from '../../../../utils/constants';
import { DetectorRulesView } from '../../components/DetectorRulesView/DetectorRulesView';
import { EuiSpacer } from '@elastic/eui';
import { Detector } from '../../../../../models/interfaces';

export interface DetectorDetailsViewProps extends RouteComponentProps {
  detector: Detector;
  enabled_time?: number;
  last_update_time?: number;
}

export interface DetectorDetailsViewState {}

export class DetectorDetailsView extends React.Component<
  DetectorDetailsViewProps,
  DetectorDetailsViewState
> {
  render() {
    const { detector, enabled_time, last_update_time } = this.props;

    return (
      <>
        <DetectorBasicDetailsView
          detector={detector}
          enabled_time={enabled_time}
          last_update_time={last_update_time}
          onEditClicked={() => {
            this.props.history.push(ROUTES.EDIT_DETECTOR_DETAILS);
          }}
        />
        <EuiSpacer size="xxl" />

        <DetectorRulesView
          {...this.props}
          onEditClicked={() => {
            this.props.history.push(ROUTES.EDIT_DETECTOR_DETAILS);
          }}
        />
      </>
    );
  }
}
