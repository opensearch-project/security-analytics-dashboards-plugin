/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { EuiButton, EuiFlexGroup, EuiFlexItem, EuiSpacer, EuiTitle, EuiText } from '@elastic/eui';
import { Detector, FieldMapping } from '../../../../../models/interfaces';
import FieldMappingService from '../../../../services/FieldMappingService';
import { DetectorHit, SearchDetectorsResponse } from '../../../../../server/models/interfaces';
import { BREADCRUMBS, EMPTY_DEFAULT_DETECTOR, ROUTES } from '../../../../utils/constants';
import { DetectorsService } from '../../../../services';
import { ServerResponse } from '../../../../../server/models/types';
import { NotificationsStart } from 'opensearch-dashboards/public';
import { errorNotificationToast, successNotificationToast } from '../../../../utils/helpers';
import EditFieldMappings from '../../containers/FieldMappings/EditFieldMapping';
import { CoreServicesContext } from '../../../../components/core_services';

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
  static contextType = CoreServicesContext;

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
        SearchDetectorsResponse
      >;
      if (response.ok) {
        const detectorHit = response.response.hits.hits.find(
          (detectorHit) => detectorHit._id === detectorId
        ) as DetectorHit;
        const detector = detectorHit._source;
        detector.detector_type = detector.detector_type.toLowerCase();

        this.context.chrome.setBreadcrumbs([
          BREADCRUMBS.SECURITY_ANALYTICS,
          BREADCRUMBS.DETECTORS,
          BREADCRUMBS.DETECTORS_DETAILS(detectorHit._source.name, detectorHit._id),
          {
            text: 'Edit field mapping',
          },
        ]);

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
    } catch (error: any) {
      errorNotificationToast(this.props.notifications, 'retrieve', 'detector', error);
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
      } else {
        successNotificationToast(this.props.notifications, 'updated', 'detector');
      }
    } catch (error: any) {
      errorNotificationToast(this.props.notifications, 'update', 'detector', error);
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
        <EuiTitle size={'m'}>
          <h3>Edit detector details</h3>
        </EuiTitle>

        <EuiText size="s" color="subdued">
          To perform threat detections, your data source will need to be in a common schema format.
          <br />
          Rule field names are automatically mapped to the most common fields in your log data
          source.
        </EuiText>

        <EuiSpacer size={'xxl'} />

        {!loading && (
          <EditFieldMappings
            {...this.props}
            detector={detector}
            fieldMappings={fieldMappings}
            filedMappingService={filedMappingService}
            replaceFieldMappings={this.replaceFieldMappings}
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
