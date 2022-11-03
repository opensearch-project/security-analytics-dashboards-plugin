/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { EuiButton, EuiFlexGroup, EuiFlexItem, EuiSpacer, EuiTitle } from '@elastic/eui';
import ConfigureFieldMapping from '../../../CreateDetector/components/ConfigureFieldMapping';
import { Detector, FieldMapping } from '../../../../../models/interfaces';
import FieldMappingService from '../../../../services/FieldMappingService';
import { DetectorHit } from '../../../../../server/models/interfaces';
import { ROUTES } from '../../../../utils/constants';
import { DetectorsService } from '../../../../services';

export interface UpdateFieldMappingsProps
  extends RouteComponentProps<any, any, { detectorHit: DetectorHit }> {
  detectorService: DetectorsService;
  filedMappingService: FieldMappingService;
}

export interface UpdateFieldMappingsState {
  detector: Detector;
  fieldMappings: FieldMapping[];
  submitting: boolean;
}

export default class UpdateFieldMappings extends Component<
  UpdateFieldMappingsProps,
  UpdateFieldMappingsState
> {
  constructor(props: UpdateFieldMappingsProps) {
    super(props);
    this.state = {
      detector: props.location.state.detectorHit._source,
      fieldMappings: [],
      submitting: false,
    };
  }

  onCancel = () => {
    this.props.history.replace({
      pathname: ROUTES.DETECTOR_DETAILS,
      state: this.props.location.state,
    });
  };

  onSave = async () => {
    this.setState({ submitting: true });
    const {
      history,
      location: {
        state: { detectorHit },
      },
      detectorService,
      filedMappingService,
    } = this.props;
    const { detector, fieldMappings } = this.state;

    try {
      const createMappingsResponse = await filedMappingService.createMappings(
        detector.inputs[0].detector_input.indices[0],
        detector.detector_type.toLowerCase(),
        fieldMappings
      );
      if (!createMappingsResponse.ok) {
        // TODO: show toast notification with error
        console.error('Failed to update field mappings: ', createMappingsResponse.error);
      }

      const updateDetectorResponse = await detectorService.updateDetector(
        detectorHit._id,
        detector
      );
      if (!updateDetectorResponse.ok) {
        // TODO: show toast notification with error
        console.error('Failed to update detector: ', updateDetectorResponse.error);
      }
    } catch (e) {
      // TODO: show toast notification with error
      console.error('Failed to update detector: ', e);
    }

    this.setState({ submitting: false });
    history.replace({
      pathname: ROUTES.DETECTOR_DETAILS,
      state: {
        detectorHit: { ...detectorHit, _source: { ...detectorHit._source, ...detector } },
      },
    });
  };

  replaceFieldMappings = (fieldMappings: FieldMapping[]): void => {
    this.setState({ fieldMappings });
  };

  render() {
    const { filedMappingService } = this.props;
    const { submitting, detector, fieldMappings } = this.state;
    detector.detector_type = detector.detector_type.toLowerCase();
    return (
      <div>
        <EuiTitle size={'l'}>
          <h3>Edit detector details</h3>
        </EuiTitle>
        <EuiSpacer size={'xxl'} />

        <ConfigureFieldMapping
          {...this.props}
          isEdit={true}
          detector={detector}
          fieldMappings={fieldMappings}
          filedMappingService={filedMappingService}
          replaceFieldMappings={this.replaceFieldMappings}
          updateDataValidState={() => {}}
        />

        <EuiFlexGroup justifyContent={'flexEnd'}>
          <EuiFlexItem grow={false}>
            <EuiButton disabled={submitting} onClick={this.onCancel}>
              Cancel
            </EuiButton>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButton
              disabled={submitting}
              fill={true}
              isLoading={submitting}
              onClick={this.onSave}
            >
              Save changes
            </EuiButton>
          </EuiFlexItem>
        </EuiFlexGroup>
      </div>
    );
  }
}
