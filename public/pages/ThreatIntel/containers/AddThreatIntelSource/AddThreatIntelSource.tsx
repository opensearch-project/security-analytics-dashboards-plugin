/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useContext, useEffect, useState } from 'react';
import {
  EuiButton,
  EuiCheckableCard,
  EuiCheckboxGroup,
  EuiFieldText,
  EuiFilePicker,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormLabel,
  EuiFormRow,
  EuiPanel,
  EuiSpacer,
  EuiSwitch,
  EuiText,
  EuiTitle,
} from '@elastic/eui';
import { CoreServicesContext } from '../../../../components/core_services';
import { BREADCRUMBS, ROUTES, defaultIntervalUnitOptions } from '../../../../utils/constants';
import { Interval } from '../../../CreateDetector/components/DefineDetector/components/DetectorSchedule/Interval';
import { RouteComponentProps } from 'react-router-dom';
import ThreatIntelService from '../../../../services/ThreatIntelService';
import {
  FileUploadSource,
  S3ConnectionSource,
  ThreatIntelS3CustomSourcePayload,
  ThreatIntelSourcePayload,
  ThreatIntelSourcePayloadBase,
} from '../../../../../types';
import {
  getEmptyIocFileUploadSource,
  getEmptyS3ConnectionSource,
  getEmptyThreatIntelSourcePayloadBase,
  readIocsFromFile,
} from '../../utils/helpers';
import { ThreatIntelIocType } from '../../../../../common/constants';
import { PeriodSchedule } from '../../../../../models/interfaces';
import { checkboxes } from '../../utils/constants';

export interface AddThreatIntelSourceProps extends RouteComponentProps {
  threatIntelService: ThreatIntelService;
}

export const AddThreatIntelSource: React.FC<AddThreatIntelSourceProps> = ({
  history,
  threatIntelService,
}) => {
  const context = useContext(CoreServicesContext);
  const [source, setSource] = useState<ThreatIntelSourcePayloadBase>(
    getEmptyThreatIntelSourcePayloadBase()
  );
  const [schedule, setSchedule] = useState<ThreatIntelS3CustomSourcePayload['schedule']>({
    interval: {
      start_time: Date.now(),
      period: 1,
      unit: 'DAYS',
    },
  });
  const [sourceType, setSourceType] = useState<'S3_CUSTOM' | 'IOC_UPLOAD'>('S3_CUSTOM');
  const [s3ConnectionDetails, setS3ConnectionDetails] = useState<S3ConnectionSource>(
    getEmptyS3ConnectionSource()
  );
  const [fileUploadSource, setFileUploadSource] = useState<FileUploadSource>(
    getEmptyIocFileUploadSource()
  );
  const [fileError, setFileError] = useState('');
  const [submitInProgress, setSubmitInProgress] = useState(false);
  const [checkboxIdToSelectedMap, setCheckboxIdToSelectedMap] = useState<Record<string, boolean>>(
    {}
  );

  useEffect(() => {
    context?.chrome.setBreadcrumbs([
      BREADCRUMBS.SECURITY_ANALYTICS,
      BREADCRUMBS.THREAT_INTEL_OVERVIEW,
      BREADCRUMBS.THREAT_INTEL_ADD_CUSTOM_SOURCE,
    ]);
  }, []);

  const onIocTypesChange = (optionId: string) => {
    const newCheckboxIdToSelectedMap = {
      ...checkboxIdToSelectedMap,
      ...{
        [optionId]: !checkboxIdToSelectedMap[optionId],
      },
    };
    setCheckboxIdToSelectedMap(newCheckboxIdToSelectedMap);
  };

  const onRefreshSwitchChange = (checked: boolean) => {
    setSource({
      ...source,
      enabled: !checked,
    });
  };

  const onNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSource({
      ...source,
      name: event.target.value,
    });
  };

  const onDescriptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSource({
      ...source,
      description: event.target.value,
    });
  };

  const onS3DataChange = (field: keyof S3ConnectionSource['s3'], value: string) => {
    setS3ConnectionDetails({
      s3: {
        ...s3ConnectionDetails.s3,
        [field]: value,
      },
    });
  };

  const onIntervalChange = (schedule: PeriodSchedule) => {
    setSchedule({
      interval: {
        start_time: Date.now(),
        period: schedule.period.interval,
        unit: schedule.period.unit,
      },
    });
  };

  const onFileChange = (files: FileList | null) => {
    setFileError('');
    if (!!files?.item(0)) {
      readIocsFromFile(files[0], (response) => {
        if (response.ok) {
          setFileUploadSource(response.sourceData);
        } else {
          setFileError(response.errorMessage);
        }
      });
    }
  };

  const onSubmit = () => {
    setSubmitInProgress(true);
    const payload: ThreatIntelSourcePayload =
      sourceType === 'S3_CUSTOM'
        ? {
            ...source,
            type: 'S3_CUSTOM',
            schedule: {
              ...schedule,
              interval: {
                ...schedule.interval,
                start_time: Date.now(),
              },
            },
            ioc_types: Object.entries(checkboxIdToSelectedMap)
              .filter(([ioc, checked]) => checked)
              .map(([ioc]) => ioc as ThreatIntelIocType),
            source: s3ConnectionDetails,
          }
        : {
            ...source,
            type: 'IOC_UPLOAD',
            ioc_types: Object.entries(checkboxIdToSelectedMap)
              .filter(([ioc, checked]) => checked)
              .map(([ioc]) => ioc as ThreatIntelIocType),
            source: fileUploadSource,
            enabled: false,
          };

    threatIntelService.addThreatIntelSource(payload).then((res) => {
      setSubmitInProgress(false);
      if (res.ok) {
        history.push({
          pathname: `${ROUTES.THREAT_INTEL_SOURCE_DETAILS}/${res.response.id}`,
          state: { source: res.response },
        });
      }
    });
  };

  return (
    <>
      <EuiPanel>
        <EuiTitle>
          <h4>Add custom threat intelligence source</h4>
        </EuiTitle>
        <EuiSpacer size="xs" />
        <EuiText color="subdued">
          <p>
            Add your custom threat intelligence source that contains indicators of malicious
            behaviors in STIX (Structured Threat Information Expression) format.
          </p>
        </EuiText>
        <EuiSpacer />
        <EuiText>
          <h4>Details</h4>
        </EuiText>
        <EuiSpacer />
        <EuiFormRow label="Name">
          <EuiFieldText placeholder="Title" onChange={onNameChange} value={source.name} />
        </EuiFormRow>
        <EuiSpacer />
        <EuiFormRow
          label={
            <>
              {'Description - '}
              <em>optional</em>
            </>
          }
        >
          <EuiFieldText
            placeholder="Description"
            onChange={onDescriptionChange}
            value={source.description}
          />
        </EuiFormRow>
        <EuiSpacer />
        <EuiText size="xs">
          <b>Threat intel source type</b>
        </EuiText>
        <EuiSpacer size="s" />
        <EuiFlexGroup>
          <EuiFlexItem style={{ maxWidth: 400 }}>
            <EuiCheckableCard
              className="eui-fullHeight"
              id={'data-store'}
              label={
                <>
                  <EuiTitle size="s">
                    <h4>Remote data store location</h4>
                  </EuiTitle>
                  <EuiText size="s">
                    <p>Connect your custom data store.</p>
                  </EuiText>
                </>
              }
              checkableType="radio"
              checked={sourceType === 'S3_CUSTOM'}
              onChange={() => {
                setSourceType('S3_CUSTOM');
              }}
            />
          </EuiFlexItem>
          <EuiFlexItem style={{ maxWidth: 400 }}>
            <EuiCheckableCard
              className="eui-fullHeight"
              id={'file-upload'}
              label={
                <>
                  <EuiTitle size="s">
                    <h4>Local file upload</h4>
                  </EuiTitle>
                  <EuiText size="s">
                    <p>Upload your own threat intel IoCs using a local file.</p>
                  </EuiText>
                </>
              }
              checkableType="radio"
              checked={sourceType === 'IOC_UPLOAD'}
              onChange={() => {
                setSourceType('IOC_UPLOAD');
              }}
            />
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiSpacer />
        {sourceType === 'S3_CUSTOM' && (
          <>
            <EuiText>
              <h4>Connection details</h4>
            </EuiText>
            <EuiSpacer />
            <EuiFormRow
              label={
                <>
                  <EuiFormLabel>IAM Role ARN</EuiFormLabel>
                  <EuiText color="subdued" size="xs">
                    <span>
                      The Amazon Resource Name for an IAM role in Amazon Web Services (AWS)
                    </span>
                  </EuiText>
                </>
              }
            >
              <EuiFieldText
                placeholder="arn:"
                onChange={(event) => onS3DataChange('role_arn', event.target.value)}
                value={s3ConnectionDetails.s3.role_arn}
              />
            </EuiFormRow>
            <EuiSpacer />
            <EuiFormRow label="S3 bucket directory">
              <EuiFieldText
                placeholder="S3 bucket name"
                onChange={(event) => onS3DataChange('bucket_name', event.target.value)}
                value={s3ConnectionDetails.s3.bucket_name}
              />
            </EuiFormRow>
            <EuiSpacer />
            <EuiFormRow label="Specify a directory or file">
              <EuiFieldText
                placeholder="Object key"
                onChange={(event) => onS3DataChange('object_key', event.target.value)}
                value={s3ConnectionDetails.s3.object_key}
              />
            </EuiFormRow>
            <EuiSpacer />
            <EuiFormRow label="Region">
              <EuiFieldText
                placeholder="Region"
                onChange={(event) => onS3DataChange('region', event.target.value)}
                value={s3ConnectionDetails.s3.region}
              />
            </EuiFormRow>
            <EuiSpacer />
            {/* <EuiButton>Test connection</EuiButton>
            <EuiSpacer /> */}
            <EuiText>
              <h4>Download schedule</h4>
            </EuiText>
            <EuiSpacer />
            <EuiSwitch
              label="Download on demand only"
              checked={!source.enabled}
              onChange={(event) => onRefreshSwitchChange(event.target.checked)}
            />
            <EuiSpacer />
            {source.enabled && sourceType === 'S3_CUSTOM' && (
              <>
                <Interval
                  label="Download new data every"
                  schedule={{
                    period: {
                      interval: schedule.interval.period,
                      unit: schedule.interval.unit,
                    },
                  }}
                  scheduleUnitOptions={[defaultIntervalUnitOptions.DAYS]}
                  onScheduleChange={onIntervalChange}
                />
                <EuiSpacer />
              </>
            )}
          </>
        )}
        {sourceType === 'IOC_UPLOAD' && (
          <>
            <EuiText>
              <h4>Upload a file</h4>
            </EuiText>
            <EuiSpacer />
            <EuiFormRow
              label="File"
              helpText={
                <>
                  <p>Accepted format: JSON (.json) based on STIX spec.</p>
                  <p>Maximum size: 500 kB. </p>
                </>
              }
              isInvalid={!!fileError}
              error={fileError}
            >
              <EuiFilePicker
                id={'filePickerId'}
                fullWidth
                initialPromptText="Select or drag and drop a file"
                onChange={onFileChange}
                display={'large'}
                multiple={false}
                aria-label="ioc file picker"
                isInvalid={!!fileError}
                data-test-subj="import_ioc_file"
              />
            </EuiFormRow>
            <EuiSpacer />
          </>
        )}
        <EuiText>
          <h4>Types of malicious indicators</h4>
        </EuiText>
        <EuiSpacer />
        <EuiCheckboxGroup
          options={checkboxes}
          idToSelectedMap={checkboxIdToSelectedMap}
          onChange={onIocTypesChange}
        />
        <EuiSpacer />
      </EuiPanel>
      <EuiSpacer />
      <EuiFlexGroup justifyContent="flexEnd">
        <EuiFlexItem grow={false}>
          <EuiButton onClick={() => history.push(ROUTES.THREAT_INTEL_OVERVIEW)}>Cancel</EuiButton>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiButton isLoading={submitInProgress} fill onClick={onSubmit}>
            Add threat intel source
          </EuiButton>
        </EuiFlexItem>
      </EuiFlexGroup>
    </>
  );
};
