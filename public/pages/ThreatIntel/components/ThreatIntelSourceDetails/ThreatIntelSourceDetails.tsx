/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import {
  EuiBottomBar,
  EuiSmallButton,
  EuiCompressedFieldText,
  EuiCodeEditor,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormLabel,
  EuiCompressedFormRow,
  EuiPanel,
  EuiSpacer,
  EuiCompressedSwitch,
  EuiText,
  EuiTitle,
} from '@elastic/eui';
import { Interval } from '../../../CreateDetector/components/DefineDetector/components/DetectorSchedule/Interval';
import {
  CustomSchemaFileUploadSource,
  FileUploadSource,
  S3ConnectionSource,
  ThreatIntelCustomSchemaIocUploadSourcePayload,
  ThreatIntelS3CustomSourcePayload,
  ThreatIntelSourceItem,
  ThreatIntelSourcePayload,
  URLDownloadSource,
  ThreatIntelSourceFormInputErrors,
} from '../../../../../types';
import { defaultIntervalUnitOptions } from '../../../../utils/constants';
import {
  hasErrorInThreatIntelSourceFormInputs,
  readIocsFromFile,
  threatIntelSourceItemToBasePayload,
  validateCustomSchema,
  validateS3ConfigField,
  validateSourceDescription,
  validateSourceName,
} from '../../utils/helpers';
import { ThreatIntelService } from '../../../../services';
import { ThreatIntelIocSourceType } from '../../../../../common/constants';
import { PeriodSchedule } from '../../../../../models/interfaces';
import { IOC_UPLOAD_MAX_FILE_SIZE } from '../../utils/constants';
import { ThreatIntelSourceDetailsFileUploader } from './ThreatIntelSourceDetailsFileUploader';

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
  const [customSchemaFileUploadSource, setCustomSchemaFileUploadSource] = useState<
    CustomSchemaFileUploadSource
  >(sourceItem.source as CustomSchemaFileUploadSource);
  const { id, description, name, enabled, type } = sourceItemState;
  const hasCustomIocSchema = 'ioc_schema' in sourceItemState && !!sourceItemState['ioc_schema'];
  const [iocSchema, setIocSchema] = useState<string | undefined>(
    hasCustomIocSchema
      ? JSON.stringify(sourceItemState.ioc_schema?.json_path_schema, null, 4)
      : undefined
  );
  const [schedule, setSchedule] = useState<ThreatIntelS3CustomSourcePayload['schedule']>(
    (sourceItem as ThreatIntelS3CustomSourcePayload).schedule
  );
  const [saveInProgress, setSaveInProgress] = useState(false);
  const [saveDisabled, setSaveDisabled] = useState(false);
  const [inputErrors, setInputErrors] = useState<ThreatIntelSourceFormInputErrors>({});

  const setFieldError = (fieldErrors: ThreatIntelSourceFormInputErrors) => {
    setInputErrors({
      ...inputErrors,
      ...fieldErrors,
    });
  };

  useEffect(() => {
    let shouldDisableSave = false;
    if (
      !isReadOnly &&
      ((type === ThreatIntelIocSourceType.IOC_UPLOAD &&
        fileUploadSource.ioc_upload?.iocs.length === 0 &&
        customSchemaFileUploadSource.custom_schema_ioc_upload?.iocs.length === 0) ||
        hasErrorInThreatIntelSourceFormInputs(inputErrors, {
          enabled,
          hasCustomIocSchema,
          type,
        }))
    ) {
      shouldDisableSave = true;
    } else if (
      (!isReadOnly &&
        type === ThreatIntelIocSourceType.IOC_UPLOAD &&
        fileUploadSource.ioc_upload?.iocs.length > 0) ||
      customSchemaFileUploadSource.custom_schema_ioc_upload?.iocs.length > 0
    ) {
      shouldDisableSave = false;
    }

    setSaveDisabled(shouldDisableSave || !iocSchema || !!validateCustomSchema(iocSchema));
  }, [fileUploadSource, customSchemaFileUploadSource, isReadOnly, type, iocSchema]);

  const onNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const name = event.target.value;
    const nameError = validateSourceName(name);
    setFieldError({
      name: nameError || '',
    });

    setSourceItemState({
      ...sourceItemState,
      name: event.target.value,
    });
    setSaveDisabled(!event.target.value);
  };

  const onDescriptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const descriptionError = validateSourceDescription(event.target.value);
    setFieldError({
      description: descriptionError || '',
    });
    setSourceItemState({
      ...sourceItemState,
      description: event.target.value,
    });
  };

  const onS3DataChange = (field: keyof S3ConnectionSource['s3'], value: string) => {
    const error = validateS3ConfigField(value);
    setFieldError({
      s3: {
        ...inputErrors.s3,
        [field]: error || '',
      },
    });
    setS3ConnectionDetails({
      s3: {
        ...s3ConnectionDetails.s3,
        [field]: value,
      },
    });
  };

  const onRefreshSwitchChange = (checked: boolean) => {
    setSourceItemState({
      ...sourceItemState,
      enabled: !checked,
    });
  };

  const onIocUploadFileChange = (files: FileList | null) => {
    setFieldError({
      fileUpload: {
        ...inputErrors.fileUpload,
        file: files?.length === 0 ? 'File required.' : '',
      },
    });
    if (!!files?.item(0)) {
      readIocsFromFile(files[0], (response) => {
        if (response.ok) {
          setFileUploadSource(response.sourceData);
        } else {
          setFieldError({
            fileUpload: {
              ...inputErrors.fileUpload,
              file: response.errorMessage,
            },
          });
        }
      });
    }
  };

  const onCustomSchemaIocUploadFileChange = (files: FileList | null) => {
    setFieldError({
      fileUpload: {
        ...inputErrors.fileUpload,
        file: files?.length === 0 ? 'File required.' : '',
      },
    });

    if (!!files?.item(0)) {
      const file = files[0];

      if (file.size > IOC_UPLOAD_MAX_FILE_SIZE) {
        setFieldError({
          fileUpload: {
            ...inputErrors.fileUpload,
            file: 'File size should be less then 500KB.',
          },
        });
        return;
      }

      const reader = new FileReader();
      reader.readAsText(file);
      reader.onload = function () {
        setCustomSchemaFileUploadSource({
          custom_schema_ioc_upload: {
            file_name: files[0].name,
            iocs: reader.result?.toString() || '',
          },
        });
      };
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
      ioc_types: [],
    };

    let payload: ThreatIntelSourcePayload;
    switch (sourceItemState.type) {
      case ThreatIntelIocSourceType.IOC_UPLOAD:
        payload = {
          ...payloadBase,
          type: ThreatIntelIocSourceType.IOC_UPLOAD,
          source: fileUploadSource,
          enabled: false,
          ioc_schema: iocSchema ? { json_path_schema: JSON.parse(iocSchema) } : undefined,
        };

        if (hasCustomIocSchema) {
          (payload as ThreatIntelCustomSchemaIocUploadSourcePayload).source = customSchemaFileUploadSource;
        }
        break;

      case ThreatIntelIocSourceType.S3_CUSTOM:
      default:
        payload = {
          ...payloadBase,
          type: ThreatIntelIocSourceType.S3_CUSTOM,
          schedule: {
            ...sourceItemState.schedule,
            interval: {
              ...sourceItemState.schedule.interval,
              start_time: Date.now(),
            },
          },
          source: s3ConnectionDetails,
          ioc_schema: iocSchema ? { json_path_schema: JSON.parse(iocSchema) } : undefined,
        };
        break;
    }

    if (sourceItem.type === ThreatIntelIocSourceType.IOC_UPLOAD) {
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

  const onCustomSchemaChange = (value: string) => {
    const customSchemaError = validateCustomSchema(value);
    if (type === ThreatIntelIocSourceType.IOC_UPLOAD) {
      setFieldError({
        fileUpload: {
          ...inputErrors['fileUpload'],
          customSchema: customSchemaError || '',
        },
      });
    } else if (type === ThreatIntelIocSourceType.S3_CUSTOM) {
      setFieldError({
        s3: {
          ...inputErrors['s3'],
          customSchema: customSchemaError || '',
        },
      });
    }
    setIocSchema(value);
  };

  const onDiscard = () => {
    setFieldError({});
    setIsReadOnly(true);
    setSourceItemState(sourceItem);
    setS3ConnectionDetails(sourceItem.source as S3ConnectionSource);
    setFileUploadSource(sourceItem.source as FileUploadSource);
    setIocSchema(
      hasCustomIocSchema
        ? JSON.stringify(sourceItemState.ioc_schema?.json_path_schema, null, 4)
        : undefined
    );
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
              <EuiCompressedFieldText readOnly={isReadOnly} value={name} onChange={onNameChange} />
            </EuiCompressedFormRow>
            <EuiSpacer />
            <EuiCompressedFormRow label="Description">
              <EuiCompressedFieldText
                readOnly={isReadOnly}
                value={description}
                onChange={onDescriptionChange}
              />
            </EuiCompressedFormRow>
            <EuiSpacer />
            {type === ThreatIntelIocSourceType.S3_CUSTOM && schedule && (
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
                      scheduleUnitOptions={[
                        defaultIntervalUnitOptions.HOURS,
                        defaultIntervalUnitOptions.DAYS,
                      ]}
                    />
                  </EuiFlexItem>
                  {(!isReadOnly || !enabled) && (
                    <EuiFlexItem grow={false}>
                      <EuiCompressedSwitch
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
                  <EuiCompressedFieldText
                    readOnly={isReadOnly}
                    placeholder="arn:"
                    onChange={(event) => onS3DataChange('role_arn', event.target.value)}
                    value={s3ConnectionDetails.s3.role_arn}
                  />
                </EuiCompressedFormRow>
                <EuiSpacer />
                <EuiCompressedFormRow label="S3 bucket directory">
                  <EuiCompressedFieldText
                    readOnly={isReadOnly}
                    placeholder="S3 bucket name"
                    onChange={(event) => onS3DataChange('bucket_name', event.target.value)}
                    value={s3ConnectionDetails.s3.bucket_name}
                  />
                </EuiCompressedFormRow>
                <EuiSpacer />
                <EuiCompressedFormRow label="Specify a directory or file">
                  <EuiCompressedFieldText
                    readOnly={isReadOnly}
                    placeholder="Object key"
                    onChange={(event) => onS3DataChange('object_key', event.target.value)}
                    value={s3ConnectionDetails.s3.object_key}
                  />
                </EuiCompressedFormRow>
                <EuiSpacer />
                <EuiCompressedFormRow label="Region">
                  <EuiCompressedFieldText
                    readOnly={isReadOnly}
                    placeholder="Region"
                    onChange={(event) => onS3DataChange('region', event.target.value)}
                    value={s3ConnectionDetails.s3.region}
                  />
                </EuiCompressedFormRow>
              </>
            )}
            {type === ThreatIntelIocSourceType.IOC_UPLOAD &&
              (hasCustomIocSchema ? (
                <ThreatIntelSourceDetailsFileUploader
                  isReadOnly={isReadOnly}
                  fileName={customSchemaFileUploadSource.custom_schema_ioc_upload?.file_name}
                  fileError={inputErrors['fileUpload']?.file || ''}
                  helperText={<p>Maximum size: 500 kB. </p>}
                  onFileUploadChange={onCustomSchemaIocUploadFileChange}
                />
              ) : (
                <ThreatIntelSourceDetailsFileUploader
                  isReadOnly={isReadOnly}
                  fileName={fileUploadSource.ioc_upload?.file_name}
                  fileError={inputErrors['fileUpload']?.file || ''}
                  helperText={
                    <>
                      <p>Accepted format: JSON (.json) based on STIX spec.</p>
                      <p>Maximum size: 500 kB. </p>
                    </>
                  }
                  onFileUploadChange={onIocUploadFileChange}
                />
              ))}
            {type === ThreatIntelIocSourceType.URL_DOWNLOAD && (
              <EuiCompressedFormRow label="Source URL">
                <EuiCompressedFieldText
                  readOnly={isReadOnly}
                  value={(sourceItem.source as URLDownloadSource).url_download?.url}
                />
              </EuiCompressedFormRow>
            )}
            {hasCustomIocSchema && (
              <>
                <EuiSpacer size="m" />
                <EuiCompressedFormRow label="Ioc schema">
                  <EuiCodeEditor
                    mode="json"
                    width="600px"
                    value={iocSchema}
                    onChange={onCustomSchemaChange}
                    data-test-subj={'threat_intel_source_ioc_custom_schema'}
                    maxLines={20}
                    readOnly={isReadOnly}
                  />
                </EuiCompressedFormRow>
              </>
            )}
            <EuiSpacer />
          </EuiFlexItem>
          {type !== ThreatIntelIocSourceType.URL_DOWNLOAD && (
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
                <EuiSmallButton
                  isLoading={saveInProgress}
                  fill
                  onClick={onSave}
                  disabled={saveDisabled}
                >
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
