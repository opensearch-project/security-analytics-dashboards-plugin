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
import React, { ChangeEvent, useContext, useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import DetectorBasicDetailsForm from '../../../CreateDetector/components/DefineDetector/components/DetectorDetails';
import { MIN_NUM_DATA_SOURCES } from '../../utils/constants';
import DetectorDataSource from '../../../CreateDetector/components/DefineDetector/components/DetectorDataSource';
import { IndexService, ServicesContext } from '../../../../services';
import { DetectorSchedule } from '../../../CreateDetector/components/DefineDetector/components/DetectorSchedule/DetectorSchedule';
import { useCallback } from 'react';
import { DetectorHit } from '../../../../../server/models/interfaces';
import { ROUTES } from '../../../../utils/constants';

export interface UpdateDetectorBasicDetailsProps
  extends RouteComponentProps<any, any, { detectorHit: DetectorHit }> {}

export const UpdateDetectorBasicDetails: React.FC<UpdateDetectorBasicDetailsProps> = (props) => {
  const services = useContext(ServicesContext);
  const [detector, setDetector] = useState<Detector>(props.location.state.detectorHit._source);
  const { name, inputs } = detector;
  const description = inputs[0].detector_input.description;

  const updateDetectorState = useCallback(
    (detector: Detector) => {
      const isDataValid =
        !!detector.name &&
        !!detector.detector_type &&
        detector.inputs[0].detector_input.indices.length >= MIN_NUM_DATA_SOURCES;

      if (isDataValid) {
        setDetector(detector);
      }
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
    (event: ChangeEvent<HTMLTextAreaElement>, index = 0) => {
      const { inputs } = detector;
      const newDetector: Detector = {
        ...detector,
        inputs: [
          {
            detector_input: {
              ...inputs[0].detector_input,
              description: event.target.value,
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
      pathname: ROUTES.DETECTOR_DETAILS,
      state: props.location.state,
    });
  }, []);

  const onSave = useCallback(() => {
    const detectorHit = props.location.state.detectorHit;

    const updateDetector = async () => {
      const updateDetectorRes = await services?.detectorsService?.updateDetector(
        detectorHit._id,
        detector
      );

      if (updateDetectorRes?.ok) {
        props.history.replace({
          pathname: ROUTES.DETECTOR_DETAILS,
          state: {
            detectorHit: { ...detectorHit, _source: { ...detectorHit._source, ...detector } },
          },
        });
      } else {
        // TODO: Show error toast
      }

      props.history.replace({
        pathname: ROUTES.DETECTOR_DETAILS,
        state: {
          detectorHit: { ...detectorHit, _source: { ...detectorHit._source, ...detector } },
        },
      });
    };

    updateDetector();
  }, [detector]);

  return (
    <div>
      <EuiTitle size={'l'}>
        <h3>Edit detector details</h3>
      </EuiTitle>
      <EuiSpacer size="xxl" />

      <DetectorBasicDetailsForm
        detectorName={name}
        detectorDescription={description}
        onDetectorNameChange={onDetectorNameChange}
        onDetectorInputDescriptionChange={onDetectorInputDescriptionChange}
      />
      <EuiSpacer size="xl" />

      <DetectorDataSource
        indexService={services?.indexService as IndexService}
        detectorIndices={inputs[0].detector_input.indices}
        onDetectorInputIndicesChange={onDetectorInputIndicesChange}
      />
      <EuiSpacer size={'xl'} />

      <DetectorSchedule detector={detector} onDetectorScheduleChange={onDetectorScheduleChange} />
      <EuiSpacer size="xl" />

      <EuiFlexGroup justifyContent="flexEnd">
        <EuiFlexItem grow={false}>
          <EuiButton onClick={onCancel}>Cancel</EuiButton>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiButton onClick={onSave}>Save changes</EuiButton>
        </EuiFlexItem>
      </EuiFlexGroup>
    </div>
  );
};
