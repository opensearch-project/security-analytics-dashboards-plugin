/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import {
  EuiSmallButton,
  EuiCheckableCard,
  EuiCompressedFieldText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormLabel,
  EuiCompressedFormRow,
  EuiPanel,
  EuiSpacer,
  EuiCompressedSwitch,
  EuiText,
  EuiCompressedCheckbox,
  EuiCodeEditor,
  EuiLink,
} from '@elastic/eui';
import { BREADCRUMBS, ROUTES, defaultIntervalUnitOptions } from '../../../../utils/constants';
import { Interval } from '../../../CreateDetector/components/DefineDetector/components/DetectorSchedule/Interval';
import { RouteComponentProps } from 'react-router-dom';
import ThreatIntelService from '../../../../services/ThreatIntelService';
import {
  CustomSchemaFileUploadSource,
  FileUploadSource,
  S3ConnectionSource,
  ThreatIntelS3CustomSourcePayload,
  ThreatIntelSourcePayload,
  ThreatIntelSourcePayloadBase,
  ThreatIntelSourceFormInputErrors as AddThreatIntelSourceFormInputErrors,
  ThreatIntelSourceFormInputFieldsTouched,
} from '../../../../../types';
import {
  getEmptyCustomSchemaIocFileUploadSource,
  getEmptyIocFileUploadSource,
  getEmptyS3ConnectionSource,
  getEmptyThreatIntelSourcePayloadBase,
  hasErrorInThreatIntelSourceFormInputs,
  readIocsFromFile,
  validateCustomSchema,
  validateS3ConfigField,
  validateSchedule,
  validateSourceDescription,
  validateSourceName,
} from '../../utils/helpers';
import { PeriodSchedule } from '../../../../../models/interfaces';
import { ThreatIntelIocSourceType } from '../../../../../common/constants';
import {
  CUSTOM_SCHEMA_PLACEHOLDER,
  defaultInputTouched,
  IOC_SCHEMA_CODE_EDITOR_MAX_LINES,
  IOC_UPLOAD_MAX_FILE_SIZE,
} from '../../utils/constants';
import { ThreatIntelSourceFileUploader } from '../../components/ThreatIntelSourceFileUploader/ThreatIntelSourceFileUploader';

export interface AddThreatIntelSourceProps extends RouteComponentProps {
  threatIntelService: ThreatIntelService;
}

export const AddThreatIntelSource: React.FC<AddThreatIntelSourceProps> = ({
  history,
  threatIntelService,
}) => {
  const [source, setSource] = useState<ThreatIntelSourcePayloadBase>(
    getEmptyThreatIntelSourcePayloadBase()
  );
  const [schedule, setSchedule] = useState<ThreatIntelS3CustomSourcePayload['schedule']>({
    interval: {
      start_time: Date.now(),
      period: 1,
      unit: defaultIntervalUnitOptions.HOURS.value,
    },
  });
  const [sourceType, setSourceType] = useState<ThreatIntelIocSourceType>(
    ThreatIntelIocSourceType.S3_CUSTOM
  );
  const [s3ConnectionDetails, setS3ConnectionDetails] = useState<S3ConnectionSource>(
    getEmptyS3ConnectionSource()
  );
  const [fileUploadSource, setFileUploadSource] = useState<FileUploadSource>(
    getEmptyIocFileUploadSource()
  );
  const [customSchemaFileUploadSource, setCustomSchemaFileUploadSource] = useState<
    CustomSchemaFileUploadSource
  >(getEmptyCustomSchemaIocFileUploadSource());
  const [submitInProgress, setSubmitInProgress] = useState(false);
  const [inputTouched, setInputTouched] = useState<ThreatIntelSourceFormInputFieldsTouched>({
    ...defaultInputTouched,
  });
  const [inputErrors, setInputErrors] = useState<AddThreatIntelSourceFormInputErrors>({});
  const [useCustomSchemaByType, setUseCustomSchemaByType] = useState<
    { [k in ThreatIntelIocSourceType.S3_CUSTOM | ThreatIntelIocSourceType.IOC_UPLOAD]: boolean }
  >({
    [ThreatIntelIocSourceType.S3_CUSTOM]: false,
    [ThreatIntelIocSourceType.IOC_UPLOAD]: false,
  });
  const [customSchema, setCustomSchema] = useState(
    JSON.stringify(CUSTOM_SCHEMA_PLACEHOLDER, null, 4)
  );

  const setFieldError = (fieldErrors: AddThreatIntelSourceFormInputErrors) => {
    setInputErrors({
      ...inputErrors,
      ...fieldErrors,
    });
  };
  const setFieldTouched = (fieldsTouched: ThreatIntelSourceFormInputFieldsTouched) => {
    setInputTouched({
      ...inputTouched,
      ...fieldsTouched,
    });
  };

  useEffect(() => {
    setBreadcrumbs([BREADCRUMBS.THREAT_INTEL_OVERVIEW, BREADCRUMBS.THREAT_INTEL_ADD_CUSTOM_SOURCE]);
  }, []);

  const onRefreshSwitchChange = (checked: boolean) => {
    setSource({
      ...source,
      enabled: !checked,
    });
  };

  const onNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const name = event.target.value;
    const nameError = validateSourceName(name);
    setFieldError({
      name: nameError || '',
    });

    setSource({
      ...source,
      name,
    });
    setFieldTouched({ name: true });
  };

  const onDescriptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const descriptionError = validateSourceDescription(event.target.value);
    setFieldError({
      description: descriptionError || '',
    });

    setSource({
      ...source,
      description: event.target.value,
    });
    setFieldTouched({ description: true });
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
    setFieldTouched({ s3: { ...(inputTouched.s3 as any), [field]: true } });
  };

  const onIntervalChange = (schedule: PeriodSchedule) => {
    const error = validateSchedule(schedule);
    setFieldError({
      schedule: error,
    });
    setSchedule({
      interval: {
        start_time: Date.now(),
        period: schedule.period.interval,
        unit: schedule.period.unit,
      },
    });
    setFieldTouched({ schedule: true });
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
    setFieldTouched({ iocFileUpload: { file: true } });
  };

  const onCustomSchemaIoCUploadFileChange = (files: FileList | null) => {
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
    setFieldTouched({ customSchemaIocFileUpload: { file: true } });
  };

  const onCustomSchemaChange = (value: string) => {
    const customSchemaError = validateCustomSchema(value);
    if (sourceType === ThreatIntelIocSourceType.IOC_UPLOAD) {
      setFieldError({
        fileUpload: {
          ...inputErrors['fileUpload'],
          customSchema: customSchemaError || '',
        },
      });
    } else if (sourceType === ThreatIntelIocSourceType.S3_CUSTOM) {
      setFieldError({
        s3: {
          ...inputErrors['s3'],
          customSchema: customSchemaError || '',
        },
      });
    }
    setCustomSchema(value);
    setFieldTouched({
      customSchema: true,
    });
  };

  const shouldEnableSubmit = () => {
    const { name, s3, iocFileUpload, customSchemaIocFileUpload, customSchema } = inputTouched;
    const reqFieldsTouched =
      name &&
      ((sourceType === ThreatIntelIocSourceType.IOC_UPLOAD &&
        (useCustomSchemaByType.IOC_UPLOAD
          ? customSchemaIocFileUpload?.file && customSchema
          : iocFileUpload?.file)) ||
        (sourceType === ThreatIntelIocSourceType.S3_CUSTOM &&
          s3 &&
          Object.values(s3).every((val) => val) &&
          (!useCustomSchemaByType.S3_CUSTOM || customSchema)));
    return (
      reqFieldsTouched &&
      !hasErrorInThreatIntelSourceFormInputs(inputErrors, {
        type: sourceType,
        enabled: source.enabled,
        hasCustomIocSchema:
          (sourceType === ThreatIntelIocSourceType.S3_CUSTOM && useCustomSchemaByType.S3_CUSTOM) ||
          (sourceType === ThreatIntelIocSourceType.IOC_UPLOAD && useCustomSchemaByType.IOC_UPLOAD),
      })
    );
  };

  const parseCustomSchema = () => {
    try {
      const parsedSchema: Record<string, any> = {};
      const schemaObj = JSON.parse(customSchema);
      Object.entries(schemaObj).forEach(([key, val]: [string, any]) => {
        if (
          typeof val?.json_path !== 'string' ||
          val.json_path.includes('[place your JSON path here]')
        ) {
          return;
        }

        parsedSchema[key] = val;
      });

      return parsedSchema;
    } catch (err: any) {
      return {};
    }
  };

  const onSubmit = () => {
    setSubmitInProgress(true);
    let payload: ThreatIntelSourcePayload;
    switch (sourceType) {
      case ThreatIntelIocSourceType.IOC_UPLOAD:
        payload = {
          ...source,
          type: ThreatIntelIocSourceType.IOC_UPLOAD,
          ioc_types: [],
          source: fileUploadSource,
          enabled: false,
        };

        if (useCustomSchemaByType.IOC_UPLOAD) {
          payload = {
            ...payload,
            source: customSchemaFileUploadSource,
            ioc_schema: {
              json_path_schema: parseCustomSchema(),
            },
          };
        }

        break;

      case ThreatIntelIocSourceType.S3_CUSTOM:
      default:
        payload = {
          ...source,
          type: ThreatIntelIocSourceType.S3_CUSTOM,
          schedule: {
            ...schedule,
            interval: {
              ...schedule.interval,
              start_time: Date.now(),
            },
          },
          ioc_types: [],
          source: s3ConnectionDetails,
        };
        if (useCustomSchemaByType.S3_CUSTOM) {
          payload.ioc_schema = {
            json_path_schema: JSON.parse(customSchema),
          };
        }
        break;
    }

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

  const showCustomSchemaEditor =
    (sourceType === ThreatIntelIocSourceType.IOC_UPLOAD && useCustomSchemaByType.IOC_UPLOAD) ||
    (sourceType === ThreatIntelIocSourceType.S3_CUSTOM && useCustomSchemaByType.S3_CUSTOM);

  const getCustomSchemaError = () => {
    if (sourceType === ThreatIntelIocSourceType.IOC_UPLOAD) {
      return inputErrors['fileUpload']?.customSchema;
    } else if (sourceType === ThreatIntelIocSourceType.S3_CUSTOM) {
      return inputErrors['s3']?.customSchema;
    }

    return '';
  };

  return (
    <>
      <EuiPanel>
        <PageHeader
          appDescriptionControls={[
            {
              description: `Add your custom threat intelligence source that contains indicators of malicious
            behaviors in STIX (Structured Threat Information Expression) format.`,
            },
          ]}
        >
          <EuiText size="s">
            <h1>Add custom threat intelligence source</h1>
          </EuiText>
          <EuiSpacer size="xs" />
          <EuiText color="subdued" size="s">
            <p>
              Add your custom threat intelligence source that contains indicators of malicious
              behaviors in STIX (Structured Threat Information Expression) format.
            </p>
          </EuiText>
          <EuiSpacer />
        </PageHeader>
        <EuiText size="s">
          <h2>Details</h2>
        </EuiText>
        <EuiSpacer />
        <EuiCompressedFormRow
          label="Name"
          helpText="Source name must contain 1-128 characters. Valid characters are a-z, A-Z, 0-9, hyphens, spaces, and underscores."
          isInvalid={!!inputErrors.name}
          error={inputErrors.name}
        >
          <EuiCompressedFieldText
            placeholder="Title"
            onChange={onNameChange}
            onBlur={onNameChange}
            value={source.name}
          />
        </EuiCompressedFormRow>
        <EuiSpacer />
        <EuiCompressedFormRow
          label={
            <>
              {'Description - '}
              <em>optional</em>
            </>
          }
        >
          <EuiCompressedFieldText
            placeholder="Description"
            onChange={onDescriptionChange}
            onBlur={onDescriptionChange}
            value={source.description}
          />
        </EuiCompressedFormRow>
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
                  <EuiText size="s">
                    <h4>Remote data store location</h4>
                  </EuiText>
                  <EuiText size="s">
                    <p>Connect your custom data store.</p>
                  </EuiText>
                </>
              }
              checkableType="radio"
              checked={sourceType === ThreatIntelIocSourceType.S3_CUSTOM}
              onChange={() => {
                setSourceType(ThreatIntelIocSourceType.S3_CUSTOM);
              }}
            />
          </EuiFlexItem>
          <EuiFlexItem style={{ maxWidth: 400 }}>
            <EuiCheckableCard
              className="eui-fullHeight"
              id={'file-upload'}
              label={
                <>
                  <EuiText size="s">
                    <h4>Local file upload</h4>
                  </EuiText>
                  <EuiText size="s">
                    <p>Upload your own threat intel IoCs using a local file in STIX2 format.</p>
                  </EuiText>
                </>
              }
              checkableType="radio"
              checked={sourceType === ThreatIntelIocSourceType.IOC_UPLOAD}
              onChange={() => {
                setSourceType(ThreatIntelIocSourceType.IOC_UPLOAD);
              }}
            />
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiSpacer />
        {sourceType === ThreatIntelIocSourceType.S3_CUSTOM && (
          <>
            <EuiText size="s">
              <h2>Connection details</h2>
            </EuiText>
            <EuiSpacer />
            <EuiCompressedFormRow
              label={
                <>
                  <EuiFormLabel className={!!inputErrors.s3?.role_arn ? 'label--danger' : ''}>
                    IAM Role ARN
                  </EuiFormLabel>
                  <EuiText color="subdued" size="xs">
                    <span>
                      The ARN of the IAM role that gives OpenSearch permission to read the S3 bucket
                    </span>
                  </EuiText>
                </>
              }
              isInvalid={!!inputErrors.s3?.role_arn}
              error={inputErrors.s3?.role_arn}
            >
              <EuiCompressedFieldText
                placeholder="arn:"
                onChange={(event) => onS3DataChange('role_arn', event.target.value)}
                onBlur={(event) => onS3DataChange('role_arn', event.target.value)}
                value={s3ConnectionDetails.s3.role_arn}
              />
            </EuiCompressedFormRow>
            <EuiSpacer />
            <EuiCompressedFormRow
              label="S3 bucket"
              isInvalid={!!inputErrors.s3?.bucket_name}
              error={inputErrors.s3?.bucket_name}
            >
              <EuiCompressedFieldText
                placeholder="S3 bucket name"
                onChange={(event) => onS3DataChange('bucket_name', event.target.value)}
                onBlur={(event) => onS3DataChange('bucket_name', event.target.value)}
                value={s3ConnectionDetails.s3.bucket_name}
              />
            </EuiCompressedFormRow>
            <EuiSpacer />
            <EuiCompressedFormRow
              label="Specify a directory or file"
              isInvalid={!!inputErrors.s3?.object_key}
              error={inputErrors.s3?.object_key}
            >
              <EuiCompressedFieldText
                placeholder="File name"
                onChange={(event) => onS3DataChange('object_key', event.target.value)}
                onBlur={(event) => onS3DataChange('object_key', event.target.value)}
                value={s3ConnectionDetails.s3.object_key}
              />
            </EuiCompressedFormRow>
            <EuiSpacer />
            <EuiCompressedFormRow
              label="Region"
              isInvalid={!!inputErrors.s3?.region}
              error={inputErrors.s3?.region}
            >
              <EuiCompressedFieldText
                placeholder="Region"
                onChange={(event) => onS3DataChange('region', event.target.value)}
                onBlur={(event) => onS3DataChange('region', event.target.value)}
                value={s3ConnectionDetails.s3.region}
              />
            </EuiCompressedFormRow>
            <EuiSpacer />
            <EuiText size="s">
              <h2>Download schedule</h2>
            </EuiText>
            <EuiSpacer />
            <EuiCompressedSwitch
              label="Download on demand only"
              checked={!source.enabled}
              onChange={(event) => onRefreshSwitchChange(event.target.checked)}
            />
            <EuiSpacer />
            {source.enabled && sourceType === ThreatIntelIocSourceType.S3_CUSTOM && (
              <>
                <Interval
                  label="Download new data every"
                  schedule={{
                    period: {
                      interval: schedule.interval.period,
                      unit: schedule.interval.unit,
                    },
                  }}
                  scheduleUnitOptions={[
                    defaultIntervalUnitOptions.HOURS,
                    defaultIntervalUnitOptions.DAYS,
                  ]}
                  onScheduleChange={onIntervalChange}
                />
                <EuiSpacer />
              </>
            )}
            <EuiText size="s">
              <h2>Schema</h2>
            </EuiText>
            <EuiSpacer size="m" />
            <EuiCompressedFormRow>
              <EuiCompressedCheckbox
                id="threat-intel-source-custom-schema"
                onChange={(e) => {
                  setUseCustomSchemaByType({
                    ...useCustomSchemaByType,
                    [ThreatIntelIocSourceType.S3_CUSTOM]: e.target.checked,
                  });
                }}
                checked={useCustomSchemaByType.S3_CUSTOM}
                label="Use custom schema"
              />
            </EuiCompressedFormRow>
            <EuiSpacer size="s" />
          </>
        )}
        {sourceType === ThreatIntelIocSourceType.IOC_UPLOAD && (
          <>
            <EuiCompressedCheckbox
              id="threat-intel-source-custom-schema"
              onChange={(e) => {
                setUseCustomSchemaByType({
                  ...useCustomSchemaByType,
                  [ThreatIntelIocSourceType.IOC_UPLOAD]: e.target.checked,
                });
                setFieldError({
                  ...inputErrors,
                  fileUpload: {
                    file: '',
                  },
                });
              }}
              checked={useCustomSchemaByType.IOC_UPLOAD}
              label="Use custom schema"
            />
            {useCustomSchemaByType.IOC_UPLOAD && (
              <ThreatIntelSourceFileUploader
                showHeader
                onFileUploadChange={onCustomSchemaIoCUploadFileChange}
                formLabel="File"
                formHelperText={<p>Maximum size: 500 kB. </p>}
                uploaderError={inputErrors.fileUpload?.file}
              />
            )}
            {!useCustomSchemaByType.IOC_UPLOAD && (
              <ThreatIntelSourceFileUploader
                showHeader
                onFileUploadChange={onIocUploadFileChange}
                formLabel="File"
                formHelperText={
                  <>
                    <p>Accepted format: JSON (.json) based on STIX spec.</p>
                    <p>Maximum size: 500 kB. </p>
                  </>
                }
                uploaderError={inputErrors.fileUpload?.file}
              />
            )}
          </>
        )}
        {showCustomSchemaEditor && (
          <>
            <EuiCompressedFormRow
              label="Ioc Schema"
              isInvalid={!!getCustomSchemaError()}
              error={getCustomSchemaError()}
            >
              <>
                <EuiText size="xs">
                  <p>
                    Learn more about JsonPath{' '}
                    <EuiLink href="https://goessner.net/articles/JsonPath/" target="_blank">
                      here.
                    </EuiLink>
                  </p>
                </EuiText>
                <EuiSpacer size="s" />
                <EuiCodeEditor
                  mode="json"
                  width="600px"
                  value={customSchema}
                  onChange={onCustomSchemaChange}
                  data-test-subj={'threat_intel_source_ioc_custom_schema'}
                  maxLines={IOC_SCHEMA_CODE_EDITOR_MAX_LINES}
                />
              </>
            </EuiCompressedFormRow>
          </>
        )}
      </EuiPanel>
      <EuiSpacer />
      <EuiFlexGroup justifyContent="flexEnd">
        <EuiFlexItem grow={false}>
          <EuiSmallButton onClick={() => history.push(ROUTES.THREAT_INTEL_OVERVIEW)}>
            Cancel
          </EuiSmallButton>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiSmallButton
            disabled={!shouldEnableSubmit()}
            isLoading={submitInProgress}
            fill
            onClick={onSubmit}
          >
            Add threat intel source
          </EuiSmallButton>
        </EuiFlexItem>
      </EuiFlexGroup>
    </>
  );
};
