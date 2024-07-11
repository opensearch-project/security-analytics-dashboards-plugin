/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import {
  EuiBottomBar,
  EuiSmallButton,
  EuiCheckboxGroup,
  EuiFieldText,
  EuiFilePicker,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormLabel,
  EuiCompressedFormRow,
  EuiPanel,
  EuiSpacer,
  EuiSwitch,
  EuiText,
  EuiTitle,
} from '@elastic/eui';
import { Interval } from '../../../CreateDetector/components/DefineDetector/components/DetectorSchedule/Interval';
import {
  FileUploadSource,
  S3ConnectionSource,
  ThreatIntelS3CustomSourcePayload,
  ThreatIntelSourceItem,
  ThreatIntelSourcePayload,
  URLDownloadSource,
} from '../../../../../types';
import { defaultIntervalUnitOptions } from '../../../../utils/constants';
import { readIocsFromFile, threatIntelSourceItemToBasePayload } from '../../utils/helpers';
import { ThreatIntelService } from '../../../../services';
import { ThreatIntelIocType } from '../../../../../common/constants';
import { PeriodSchedule } from '../../../../../models/interfaces';
import { checkboxes } from '../../utils/constants';

export interface ThreatIntelSourceDetailsProps {
  sourceItem: ThreatIntelSourceItem;
  threatIntelService: ThreatIntelService;
  onSourceUpdate: () => void;
}

export const ThreatIntelSourceDetails: React.FC<ThreatIntelSourceDetailsProps> = ({
  sourceItem,
  threatIntelService,
  onSourceUpdate,
}) => {
  const [isReadOnly, setIsReadOnly] = useState(true);
  const [sourceItemState, setSourceItemState] = useState(sourceItem);
  const [s3ConnectionDetails, setS3ConnectionDetails] = useState<S3ConnectionSource>(
    sourceItem.source as S3ConnectionSource
  );
  const [fileUploadSource, setFileUploadSource] = useState<FileUploadSource>(
    sourceItem.source as FileUploadSource
  );
  const { id, description, name, ioc_types, enabled, type } = sourceItemState;
  const [schedule, setSchedule] = useState<ThreatIntelS3CustomSourcePayload['schedule']>(
    (sourceItem as ThreatIntelS3CustomSourcePayload).schedule
  );
  const [fileError, setFileError] = useState('');
  const [saveInProgress, setSaveInProgress] = useState(false);
  const [saveDisabled, setSaveDisabled] = useState(false);
  const [checkboxIdToSelectedMap, setCheckboxIdToSelectedMap] = useState<Record<string, boolean>>(
    () => {
      const newCheckboxIdToSelectedMap: any = {};
      ioc_types.forEach((ioc_type) => {
        newCheckboxIdToSelectedMap[ioc_type] = true;
      });
      return newCheckboxIdToSelectedMap;
    }
  );

  useEffect(() => {
    if (!isReadOnly && type === 'IOC_UPLOAD' && fileUploadSource.ioc_upload.iocs.length === 0) {
      setSaveDisabled(true);
    } else if (type === 'IOC_UPLOAD' && fileUploadSource.ioc_upload.iocs.length > 0) {
      setSaveDisabled(false);
    }
  }, [fileUploadSource, isReadOnly, type]);

  const onNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSourceItemState({
      ...sourceItemState,
      name: event.target.value,
    });
    setSaveDisabled(!event.target.value);
  };

  const onDescriptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSourceItemState({
      ...sourceItemState,
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
    setSourceItemState({
      ...sourceItemState,
      enabled: !checked,
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

  const onIntervalChange = (schedule: PeriodSchedule) => {
    setSchedule({
      interval: {
        start_time: Date.now(),
        period: schedule.period.interval,
        unit: schedule.period.unit,
      },
    });
  };

  const onSave = () => {
    setSaveInProgress(true);

    const payloadBase = {
      ...threatIntelSourceItemToBasePayload(sourceItemState),
      ioc_types: Object.entries(checkboxIdToSelectedMap)
        .filter(([ioc, checked]) => checked)
        .map(([ioc]) => ioc as ThreatIntelIocType),
    };

    const payload: ThreatIntelSourcePayload =
      sourceItemState.type === 'S3_CUSTOM'
        ? {
            ...payloadBase,
            type: 'S3_CUSTOM',
            schedule: {
              ...sourceItemState.schedule,
              interval: {
                ...sourceItemState.schedule.interval,
                start_time: Date.now(),
              },
            },
            source: s3ConnectionDetails,
          }
        : {
            ...payloadBase,
            type: 'IOC_UPLOAD',
            source: fileUploadSource,
            enabled: false,
          };

    if (sourceItem.type === 'IOC_UPLOAD') {
      delete (payload as any)['schedule'];
    }

    threatIntelService.updateThreatIntelSource(id, payload).then((res) => {
      setSaveInProgress(false);
      if (res.ok) {
        setSaveInProgress(false);
        setIsReadOnly(true);
        onSourceUpdate();
      }
    });
  };

  const onDiscard = () => {
    setFileError('');
    setIsReadOnly(true);
    setSourceItemState(sourceItem);
    setS3ConnectionDetails(sourceItem.source as S3ConnectionSource);
    setFileUploadSource(sourceItem.source as FileUploadSource);
  };

  return (
    <>
      <EuiPanel>
        <EuiFlexGroup>
          <EuiFlexItem grow={1}>
            <EuiTitle size="s">
              <h4>Threat intel source details</h4>
            </EuiTitle>
          </EuiFlexItem>
          <EuiFlexItem grow={2}>
            <EuiCompressedFormRow label="Name">
              <EuiFieldText readOnly={isReadOnly} value={name} onChange={onNameChange} />
            </EuiCompressedFormRow>
            <EuiSpacer />
            <EuiCompressedFormRow label="Description">
              <EuiFieldText
                readOnly={isReadOnly}
                value={description}
                onChange={onDescriptionChange}
              />
            </EuiCompressedFormRow>
            <EuiSpacer />
            {type === 'S3_CUSTOM' && schedule && (
              <>
                <EuiFormLabel>Download schedule</EuiFormLabel>
                <EuiSpacer size="xs" />
                <EuiFlexGroup alignItems="center">
                  <EuiFlexItem>
                    <Interval
                      schedule={{
                        period: {
                          interval: schedule.interval.period,
                          unit: schedule.interval.unit,
                        },
                      }}
                      onScheduleChange={onIntervalChange}
                      readonly={isReadOnly || !enabled}
                      scheduleUnitOptions={[defaultIntervalUnitOptions.DAYS]}
                    />
                  </EuiFlexItem>
                  {(!isReadOnly || !enabled) && (
                    <EuiFlexItem grow={false}>
                      <EuiSwitch
                        label="Download on demand only"
                        checked={!enabled}
                        onChange={(event) => onRefreshSwitchChange(event.target.checked)}
                        disabled={isReadOnly}
                      />
                    </EuiFlexItem>
                  )}
                </EuiFlexGroup>
                <EuiSpacer />

                <EuiText>
                  <h4>Connection details</h4>
                </EuiText>
                <EuiSpacer />
                <EuiCompressedFormRow label={<EuiFormLabel>IAM Role ARN</EuiFormLabel>}>
                  <EuiFieldText
                    readOnly={isReadOnly}
                    placeholder="arn:"
                    onChange={(event) => onS3DataChange('role_arn', event.target.value)}
                    value={s3ConnectionDetails.s3.role_arn}
                  />
                </EuiCompressedFormRow>
                <EuiSpacer />
                <EuiCompressedFormRow label="S3 bucket directory">
                  <EuiFieldText
                    readOnly={isReadOnly}
                    placeholder="S3 bucket name"
                    onChange={(event) => onS3DataChange('bucket_name', event.target.value)}
                    value={s3ConnectionDetails.s3.bucket_name}
                  />
                </EuiCompressedFormRow>
                <EuiSpacer />
                <EuiCompressedFormRow label="Specify a directory or file">
                  <EuiFieldText
                    readOnly={isReadOnly}
                    placeholder="Object key"
                    onChange={(event) => onS3DataChange('object_key', event.target.value)}
                    value={s3ConnectionDetails.s3.object_key}
                  />
                </EuiCompressedFormRow>
                <EuiSpacer />
                <EuiCompressedFormRow label="Region">
                  <EuiFieldText
                    readOnly={isReadOnly}
                    placeholder="Region"
                    onChange={(event) => onS3DataChange('region', event.target.value)}
                    value={s3ConnectionDetails.s3.region}
                  />
                </EuiCompressedFormRow>
                <EuiSpacer />
              </>
            )}
            {type === 'IOC_UPLOAD' && (
              <>
                {isReadOnly && (
                  <EuiCompressedFormRow label="Uploaded file">
                    <EuiFieldText
                      readOnly={isReadOnly}
                      value={fileUploadSource.ioc_upload?.file_name}
                      icon={'download'}
                    />
                  </EuiCompressedFormRow>
                )}
                {!isReadOnly && (
                  <>
                    <EuiCompressedFormRow
                      label="Upload file"
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
                    </EuiCompressedFormRow>
                  </>
                )}
              </>
            )}
            {type === 'URL_DOWNLOAD' && (
              <EuiFormRow label="Source URL">
                <EuiFieldText
                  readOnly={isReadOnly}
                  value={(sourceItem.source as URLDownloadSource).url_download?.url}
                />
              </EuiFormRow>
            )}
            <EuiCompressedFormRow label="Types of malicious indicators">
              <>
                <EuiSpacer size="s" />
                <EuiCheckboxGroup
                  options={checkboxes}
                  idToSelectedMap={checkboxIdToSelectedMap}
                  onChange={onIocTypesChange}
                  disabled={isReadOnly}
                />
              </>
            </EuiCompressedFormRow>
            <EuiSpacer />
          </EuiFlexItem>
          {type !== 'URL_DOWNLOAD' && (
            <EuiFlexItem grow={false}>
              <EuiSmallButton
                style={{ visibility: isReadOnly ? 'visible' : 'hidden' }}
                onClick={() => setIsReadOnly(false)}
              >
                Edit
              </EuiSmallButton>
            </EuiFlexItem>
          )}
        </EuiFlexGroup>
      </EuiPanel>
      {!isReadOnly && (
        <>
          <EuiSpacer size="xl" />
          <EuiBottomBar>
            <EuiFlexGroup justifyContent="flexEnd">
              <EuiFlexItem grow={false}>
                <EuiSmallButton onClick={onDiscard}>Discard</EuiSmallButton>
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiSmallButton isLoading={saveInProgress} fill onClick={onSave} disabled={saveDisabled}>
                  Save
                </EuiSmallButton>
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiBottomBar>
        </>
      )}
    </>
  );
};
