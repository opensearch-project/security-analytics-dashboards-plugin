/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiButton,
  EuiComboBoxOptionOption,
  EuiFlexGroup,
  EuiFlexItem,
  EuiSpacer,
  EuiTitle,
} from '@elastic/eui';
import { Detector, PeriodSchedule } from '../../../../../models/interfaces';
import React, { useContext, useEffect, useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import DetectorBasicDetailsForm from '../../../CreateDetector/components/DefineDetector/components/DetectorDetails';
import DetectorDataSource from '../../../CreateDetector/components/DefineDetector/components/DetectorDataSource';
import { IndexService, ServicesContext } from '../../../../services';
import { DetectorSchedule } from '../../../CreateDetector/components/DefineDetector/components/DetectorSchedule/DetectorSchedule';
import { useCallback } from 'react';
import { DetectorHit, SearchDetectorsResponse } from '../../../../../server/models/interfaces';
import { BREADCRUMBS, EMPTY_DEFAULT_DETECTOR, ROUTES } from '../../../../utils/constants';
import { ServerResponse } from '../../../../../server/models/types';
import { NotificationsStart } from 'opensearch-dashboards/public';
import { errorNotificationToast, successNotificationToast } from '../../../../utils/helpers';
import { CoreServicesContext } from '../../../../components/core_services';

export interface UpdateDetectorBasicDetailsProps
  extends RouteComponentProps<any, any, { detectorHit: DetectorHit }> {
  notifications: NotificationsStart;
}

export const UpdateDetectorBasicDetails: React.FC<UpdateDetectorBasicDetailsProps> = (props) => {
  const services = useContext(ServicesContext);
  const [detector, setDetector] = useState<Detector>(
    props.location.state?.detectorHit?._source || EMPTY_DEFAULT_DETECTOR
  );
  const { name, inputs } = detector;
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const description = inputs[0].detector_input.description;
  const detectorId = props.location.pathname.replace(`${ROUTES.EDIT_DETECTOR_DETAILS}/`, '');

  const context = useContext(CoreServicesContext);

  useEffect(() => {
    const getDetector = async () => {
      const response = (await services?.detectorsService.getDetectors()) as ServerResponse<
        SearchDetectorsResponse
      >;
      if (response.ok) {
        const detectorHit = response.response.hits.hits.find(
          (detectorHit) => detectorHit._id === detectorId
        ) as DetectorHit;
        setDetector(detectorHit._source);

        context?.chrome.setBreadcrumbs([
          BREADCRUMBS.SECURITY_ANALYTICS,
          BREADCRUMBS.DETECTORS,
          BREADCRUMBS.DETECTORS_DETAILS(detectorHit._source.name, detectorHit._id),
          {
            text: 'Edit detector details',
          },
        ]);
        props.history.replace({
          pathname: `${ROUTES.EDIT_DETECTOR_DETAILS}/${detectorId}`,
          state: {
            detectorHit: { ...detectorHit, _source: { ...detectorHit._source, ...detectorHit } },
          },
        });
      } else {
        errorNotificationToast(props.notifications, 'retrieve', 'detector', response.error);
      }
    };

    const execute = async () => {
      setLoading(true);
      await getDetector();
      setLoading(false);
    };

    if (!detector.id?.length) {
      execute().catch((e) => {
        errorNotificationToast(props.notifications, 'retrieve', 'detector', e);
      });
    }
  }, [services]);

  const updateDetectorState = useCallback(
    (detector: Detector) => {
      setDetector(detector);
    },
    [setDetector]
  );

  const onDetectorNameChange = useCallback(
    (detectorName: string) => {
      const newDetector: Detector = {
        ...detector,
        name: detectorName,
      };

      updateDetectorState(newDetector);
    },
    [detector, updateDetectorState]
  );

  const onDetectorInputDescriptionChange = useCallback(
    (description: string) => {
      const { inputs } = detector;
      const newDetector: Detector = {
        ...detector,
        inputs: [
          {
            detector_input: {
              ...inputs[0].detector_input,
              description: description,
            },
          },
          ...inputs.slice(1),
        ],
      };

      updateDetectorState(newDetector);
    },
    [detector, updateDetectorState]
  );

  const onDetectorInputIndicesChange = useCallback(
    (selectedOptions: EuiComboBoxOptionOption<string>[]) => {
      const detectorIndices = selectedOptions.map((selectedOption) => selectedOption.label);

      const { inputs } = detector;
      const newDetector: Detector = {
        ...detector,
        inputs: [
          {
            detector_input: {
              ...inputs[0].detector_input,
              indices: detectorIndices,
            },
          },
          ...inputs.slice(1),
        ],
      };

      updateDetectorState(newDetector);
    },
    [detector, updateDetectorState]
  );

  const onDetectorScheduleChange = useCallback(
    (schedule: PeriodSchedule) => {
      const newDetector: Detector = {
        ...detector,
        schedule,
      };

      updateDetectorState(newDetector);
    },
    [detector, updateDetectorState]
  );

  const onCancel = useCallback(() => {
    props.history.replace({
      pathname: `${ROUTES.DETECTOR_DETAILS}/${detectorId}`,
      state: props.location.state,
    });
  }, []);

  const onSave = useCallback(() => {
    const detectorHit = props.location.state.detectorHit;

    const updateDetector = async () => {
      setSubmitting(true);
      const updateDetectorRes = await services?.detectorsService?.updateDetector(
        detectorHit._id,
        detector
      );

      if (updateDetectorRes?.ok) {
        successNotificationToast(props.notifications, 'updated', 'detector');
      } else {
        errorNotificationToast(props.notifications, 'update', 'detector', updateDetectorRes?.error);
      }

      setSubmitting(false);
      props.history.replace({
        pathname: `${ROUTES.DETECTOR_DETAILS}/${detectorId}`,
        state: {
          detectorHit: { ...detectorHit, _source: { ...detectorHit._source, ...detector } },
        },
      });
    };

    updateDetector().catch((e) => {
      errorNotificationToast(props.notifications, 'update', 'detector', e);
    });
  }, [detector]);

  return (
    <div>
      <EuiTitle size={'m'}>
        <h3>Edit detector details</h3>
      </EuiTitle>
      <EuiSpacer size="xxl" />

      <DetectorBasicDetailsForm
        isEdit={true}
        detectorName={name}
        detectorDescription={description}
        onDetectorNameChange={onDetectorNameChange}
        onDetectorInputDescriptionChange={onDetectorInputDescriptionChange}
      />
      <EuiSpacer size="xl" />

      <DetectorDataSource
        isEdit={true}
        notifications={props.notifications}
        indexService={services?.indexService as IndexService}
        detectorIndices={inputs[0].detector_input.indices}
        onDetectorInputIndicesChange={onDetectorInputIndicesChange}
      />
      <EuiSpacer size={'xl'} />

      <DetectorSchedule detector={detector} onDetectorScheduleChange={onDetectorScheduleChange} />
      <EuiSpacer size="xl" />

      <EuiFlexGroup justifyContent="flexEnd">
        <EuiFlexItem grow={false}>
          <EuiButton onClick={onCancel} disabled={loading}>
            Cancel
          </EuiButton>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiButton
            onClick={onSave}
            disabled={loading || submitting}
            isLoading={submitting}
            data-test-subj={'save-basic-details-edits'}
          >
            Save changes
          </EuiButton>
        </EuiFlexItem>
      </EuiFlexGroup>
    </div>
  );
};
