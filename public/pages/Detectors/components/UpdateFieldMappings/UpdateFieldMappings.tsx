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
import { DetectorHit, GetDetectorResponse } from '../../../../../server/models/interfaces';
import { EMPTY_DEFAULT_DETECTOR, ROUTES } from '../../../../utils/constants';
import { DetectorsService } from '../../../../services';
import { ServerResponse } from '../../../../../server/models/types';
import { NotificationsStart } from 'opensearch-dashboards/public';
import { errorNotificationToast } from '../../../../utils/helpers';

export interface UpdateFieldMappingsProps
  extends RouteComponentProps<any, any, { detectorHit: DetectorHit }> {
  detectorService: DetectorsService;
  filedMappingService: FieldMappingService;
  notifications: NotificationsStart;
}

export interface UpdateFieldMappingsState {
  detector: Detector;
  detectorId: string;
  fieldMappings: FieldMapping[];
  loading: boolean;
  submitting: boolean;
}

export default class UpdateFieldMappings extends Component<
  UpdateFieldMappingsProps,
  UpdateFieldMappingsState
> {
  constructor(props: UpdateFieldMappingsProps) {
    super(props);
    const { location } = props;
    this.state = {
      detector: location.state?.detectorHit?._source || EMPTY_DEFAULT_DETECTOR,
      detectorId: location.pathname.replace(`${ROUTES.EDIT_FIELD_MAPPINGS}/`, ''),
      fieldMappings: [],
      loading: false,
      submitting: false,
    };
  }

  componentDidMount() {
    this.getDetector();
  }

  getDetector = async () => {
    this.setState({ loading: true });
    try {
      const { detectorService, history } = this.props;
      const { detectorId } = this.state;
      const response = (await detectorService.getDetectors()) as ServerResponse<
        GetDetectorResponse
      >;
      if (response.ok) {
        const detectorHit = response.response.hits.hits.find(
          (detectorHit) => detectorHit._id === detectorId
        );
        const detector = detectorHit._source;
        detector.detector_type = detector.detector_type.toLowerCase();

        history.replace({
          pathname: `${ROUTES.EDIT_FIELD_MAPPINGS}/${detectorId}`,
          state: {
            detectorHit: { ...detectorHit, _source: { ...detectorHit._source, ...detector } },
          },
        });

        this.setState({ detector: detector });
      } else {
        errorNotificationToast(this.props.notifications, 'retrieve', 'detector', response.error);
      }
    } catch (e) {
      errorNotificationToast(this.props.notifications, 'retrieve', 'detector', e);
    }
    this.setState({ loading: false });
  };

  onCancel = () => {
    this.props.history.replace({
      pathname: `${ROUTES.DETECTOR_DETAILS}/${this.state.detectorId}`,
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
        errorNotificationToast(
          this.props.notifications,
          'update',
          'field mappings',
          createMappingsResponse.error
        );
      }

      const updateDetectorResponse = await detectorService.updateDetector(
        detectorHit._id,
        detector
      );
      if (!updateDetectorResponse.ok) {
        errorNotificationToast(
          this.props.notifications,
          'update',
          'detector',
          updateDetectorResponse.error
        );
      }
    } catch (e) {
      errorNotificationToast(this.props.notifications, 'update', 'detector', e);
    }

    this.setState({ submitting: false });
    history.replace({
      pathname: `${ROUTES.DETECTOR_DETAILS}/${this.state.detectorId}`,
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
    const { submitting, detector, fieldMappings, loading } = this.state;
    return (
      <div>
        <EuiTitle size={'l'}>
          <h3>Edit detector details</h3>
        </EuiTitle>
        <EuiSpacer size={'xxl'} />

        {!loading && (
          <ConfigureFieldMapping
            {...this.props}
            isEdit={true}
            detector={detector}
            fieldMappings={fieldMappings}
            filedMappingService={filedMappingService}
            replaceFieldMappings={this.replaceFieldMappings}
            updateDataValidState={() => {}}
            loading={loading}
          />
        )}

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
