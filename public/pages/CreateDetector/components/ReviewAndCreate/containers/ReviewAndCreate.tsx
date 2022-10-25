/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EuiSpacer, EuiTitle } from '@elastic/eui';
import { DetectorDetailsView } from '../../../../Detectors/containers/DetectorDetailsView/DetectorDetailsView';
import { FieldMappingsView } from '../../../../Detectors/components/FieldMappingsView/FieldMappingsView';
import { AlertTriggersView } from '../../../../Detectors/containers/AlertTriggersView/AlertTriggersView';
import { RouteComponentProps } from 'react-router-dom';
import { Detector } from '../../../../../../models/interfaces';

export interface ReviewAndCreateProps extends RouteComponentProps {
  detector: Detector;
}

export class ReviewAndCreate extends React.Component<ReviewAndCreateProps> {
  render() {
    return (
      <div>
        <EuiTitle size={'l'}>
          <h3>Review and create</h3>
        </EuiTitle>
        <DetectorDetailsView {...this.props} detector={this.props.detector} />
        <EuiSpacer size="l" />
        <FieldMappingsView {...this.props} detector={this.props.detector} />
        <EuiSpacer size="l" />
        <AlertTriggersView {...this.props} detector={this.props.detector} />
      </div>
    );
  }
}
