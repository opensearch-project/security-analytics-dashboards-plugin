/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiSmallButton,
  EuiComboBoxOptionOption,
  EuiFlexGroup,
  EuiFlexItem,
  EuiPanel,
  EuiSpacer,
  EuiTitle,
} from '@elastic/eui';
import { PeriodSchedule } from '../../../../../models/interfaces';
import React, { useContext, useEffect, useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import DetectorBasicDetailsForm from '../../../CreateDetector/components/DefineDetector/components/DetectorDetails';
import DetectorDataSource from '../../../CreateDetector/components/DefineDetector/components/DetectorDataSource';
import { FieldMappingService, IndexService, SecurityAnalyticsContext } from '../../../../services';
import { DetectorSchedule } from '../../../CreateDetector/components/DefineDetector/components/DetectorSchedule/DetectorSchedule';
import { useCallback } from 'react';
import { DetectorHit, SearchDetectorsResponse } from '../../../../../server/models/interfaces';
import { BREADCRUMBS, EMPTY_DEFAULT_DETECTOR, ROUTES } from '../../../../utils/constants';
import { ServerResponse } from '../../../../../server/models/types';
import { NotificationsStart } from 'opensearch-dashboards/public';
import { errorNotificationToast, successNotificationToast } from '../../../../utils/helpers';
import { CoreServicesContext } from '../../../../components/core_services';
import ReviewFieldMappings from '../ReviewFieldMappings/ReviewFieldMappings';
import { FieldMapping, Detector } from '../../../../../types';
import { ThreatIntelligence } from '../../../CreateDetector/components/DefineDetector/components/ThreatIntelligence/ThreatIntelligence';

export interface UpdateDetectorBasicDetailsProps
  extends RouteComponentProps<any, any, { detectorHit: DetectorHit }> {
  notifications: NotificationsStart;
}

export const UpdateDetectorBasicDetails: React.FC<UpdateDetectorBasicDetailsProps> = (props) => {
  const saContext = useContext(SecurityAnalyticsContext);
  const [detector, setDetector] = useState<Detector>(
    (props.location.state?.detectorHit?._source || EMPTY_DEFAULT_DETECTOR) as Detector
  );
  const [fieldMappings, setFieldMappings] = useState<FieldMapping[]>();
  const { name, inputs } = detector;
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [fieldMappingsIsVisible, setFieldMappingsIsVisible] = useState(false);
  const description = inputs[0].detector_input.description;
  const detectorId = props.location.pathname.replace(`${ROUTES.EDIT_DETECTOR_DETAILS}/`, '');

  const context = useContext(CoreServicesContext);
  const [threatIntelEnabledInitially, setThreatIntelEnabledInitially] = useState(false);

  useEffect(() => {
    setThreatIntelEnabledInitially(detector.threat_intel_enabled);
  }, []);

  useEffect(() => {
    const getDetector = async () => {
      const response = (await saContext?.services.detectorsService.getDetectors()) as ServerResponse<
        SearchDetectorsResponse
      >;
      if (response.ok) {
        const detectorHit = response.response.hits.hits.find(
          (detectorHit) => detectorHit._id === detectorId
        ) as DetectorHit;
        setDetector(detectorHit._source as Detector);

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
            detectorHit: {
              ...detectorHit,
              _source: { ...detectorHit._source, ...detectorHit },
            },
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
  }, [saContext?.services]);

  const updateDetectorState = useCallback(
    (detector: Detector) => {
      setDetector(detector);
    },
    [setDetector]
  );

  const updateFieldMappingsState = useCallback(
    (mappings: FieldMapping[]) => {
      setFieldMappings(mappings);
    },
    [setFieldMappings]
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

      setFieldMappingsIsVisible(true);
      updateDetectorState(newDetector);
    },
    [detector, updateDetectorState, setFieldMappingsIsVisible]
  );

  const onThreatIntelFeedToggle = useCallback(
    (enabled: boolean) => {
      const newDetector: Detector = {
        ...detector,
        threat_intel_enabled: enabled,
      };

      setFieldMappingsIsVisible(!threatIntelEnabledInitially && enabled);
      updateDetectorState(newDetector);
    },
    [detector, updateDetectorState, setFieldMappingsIsVisible]
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

  const onFieldMappingChange = useCallback(
    (fields: FieldMapping[]) => {
      const updatedFields = [...fields];
      updateFieldMappingsState(updatedFields);
    },
    [fieldMappings, updateFieldMappingsState]
  );

  const onCancel = useCallback(() => {
    props.history.replace({
      pathname: `${ROUTES.DETECTOR_DETAILS}/${detectorId}`,
      state: props.location.state,
    });
  }, []);

  const onSave = useCallback(async () => {
    setSubmitting(true);

    const updateDetector = async () => {
      const detectorHit = props.location.state.detectorHit;
      const updateDetectorRes = await saContext?.services.detectorsService?.updateDetector(
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
          detectorHit: {
            ...detectorHit,
            _source: { ...detectorHit._source, ...detector },
          },
        },
      });
    };

    if (fieldMappings?.length) {
      const createMappingsResponse = await saContext?.services.fieldMappingService?.createMappings(
        detector.inputs[0].detector_input.indices[0],
        detector.detector_type.toLowerCase(),
        fieldMappings
      );

      if (!createMappingsResponse?.ok) {
        errorNotificationToast(
          props.notifications,
          'update',
          'field mappings',
          createMappingsResponse?.error
        );
      } else {
        await updateDetector();
      }
    } else {
      await updateDetector();
    }
  }, [detector, fieldMappings]);

  return (
    <>
      <EuiTitle size={'m'}>
        <h3>Edit detector details</h3>
      </EuiTitle>
      <EuiSpacer size="xl" />

      <EuiPanel>
        <DetectorBasicDetailsForm
          isEdit={true}
          detectorName={name}
          detectorDescription={description}
          onDetectorNameChange={onDetectorNameChange}
          onDetectorInputDescriptionChange={onDetectorInputDescriptionChange}
        />
        <EuiSpacer size="l" />

        <DetectorDataSource
          isEdit={true}
          detector_type={detector.detector_type}
          notifications={props.notifications}
          indexService={saContext?.services?.indexService as IndexService}
          detectorIndices={inputs[0].detector_input.indices}
          fieldMappingService={saContext?.services?.fieldMappingService as FieldMappingService}
          onDetectorInputIndicesChange={onDetectorInputIndicesChange}
        />
        <EuiSpacer size={'l'} />

        <ThreatIntelligence
          threatIntelChecked={detector.threat_intel_enabled}
          onThreatIntelChange={onThreatIntelFeedToggle}
        />

        <EuiSpacer size="l" />

        <DetectorSchedule detector={detector} onDetectorScheduleChange={onDetectorScheduleChange} />
        <EuiSpacer size="l" />

        {fieldMappingsIsVisible ? (
          <>
            <ReviewFieldMappings
              {...props}
              detector={detector}
              fieldMappingService={saContext?.services.fieldMappingService}
              onFieldMappingChange={onFieldMappingChange}
            />
            <EuiSpacer size="l" />
          </>
        ) : null}
      </EuiPanel>

      <EuiSpacer />

      <EuiFlexGroup justifyContent="flexEnd">
        <EuiFlexItem grow={false}>
          <EuiSmallButton onClick={onCancel} disabled={loading}>
            Cancel
          </EuiSmallButton>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiSmallButton
            onClick={onSave}
            fill={true}
            disabled={loading || submitting}
            isLoading={submitting}
            data-test-subj={'save-basic-details-edits'}
          >
            Save changes
          </EuiSmallButton>
        </EuiFlexItem>
      </EuiFlexGroup>
    </>
  );
};
