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
import {
  THREAT_INTEL_SOURCE_DESCRIPTION_REGEX,
  THREAT_INTEL_SOURCE_NAME_REGEX,
  validateDescription,
  validateName,
} from '../../../../utils/validation';

interface AddThreatIntelSourceFormInputErrors {
  name?: string;
  description?: string;
  s3?: Partial<
    {
      [field in keyof S3ConnectionSource['s3']]: string;
    }
  >;
  fileUpload?: {
    file?: string;
  };
  schedule?: string;
  ioc_types?: string;
}

interface AddThreatIntelSourceFormInputTouched {
  name?: boolean;
  description?: boolean;
  s3?: Partial<
    {
      [field in keyof S3ConnectionSource['s3']]: boolean;
    }
  >;
  fileUpload?: {
    file?: boolean;
  };
  schedule?: boolean;
  ioc_types?: boolean;
}

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
  const [submitInProgress, setSubmitInProgress] = useState(false);
  const [checkboxIdToSelectedMap, setCheckboxIdToSelectedMap] = useState<Record<string, boolean>>(
    {}
  );
  const [inputTouched, setInputTouched] = useState<AddThreatIntelSourceFormInputTouched>({});
  const [inputErrors, setInputErrors] = useState<AddThreatIntelSourceFormInputErrors>({});

  const setFieldError = (fieldErrors: AddThreatIntelSourceFormInputErrors) => {
    setInputErrors({
      ...inputErrors,
      ...fieldErrors,
    });
  };
  const setFieldTouched = (fieldsTouched: AddThreatIntelSourceFormInputTouched) => {
    setInputTouched({
      ...inputTouched,
      ...fieldsTouched,
    });
  };

  useEffect(() => {
    context?.chrome.setBreadcrumbs([
      BREADCRUMBS.SECURITY_ANALYTICS,
      BREADCRUMBS.THREAT_INTEL_OVERVIEW,
      BREADCRUMBS.THREAT_INTEL_ADD_CUSTOM_SOURCE,
    ]);
  }, []);

  const validateIocTypes = (iocTypeMap: Record<string, boolean>) => {
    return !Object.values(iocTypeMap).some((val) => val)
      ? 'At least one ioc type should be selected'
      : '';
  };
  const onIocTypesChange = (optionId: string) => {
    const newCheckboxIdToSelectedMap = {
      ...checkboxIdToSelectedMap,
      ...{
        [optionId]: !checkboxIdToSelectedMap[optionId],
      },
    };
    setFieldError({
      ioc_types: validateIocTypes(newCheckboxIdToSelectedMap),
    });
    setFieldTouched({ ioc_types: true });
    setCheckboxIdToSelectedMap(newCheckboxIdToSelectedMap);
  };

  const onRefreshSwitchChange = (checked: boolean) => {
    setSource({
      ...source,
      enabled: !checked,
    });
  };

  const validateSourceName = (name: string) => {
    let error;
    if (!name) {
      error = 'Name is required.';
    } else if (name.length > 128) {
      error = 'Max length can be 128.';
    } else {
      const isValid = validateName(name, THREAT_INTEL_SOURCE_NAME_REGEX);
      if (!isValid) {
        error = 'Invalid name.';
      }
    }

    return error;
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

  const validateSourceDescription = (description: string) => {
    let error;
    const isValid = validateDescription(description, THREAT_INTEL_SOURCE_DESCRIPTION_REGEX);
    if (!isValid) {
      error = 'Invalid name.';
    }

    return error;
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

  const validateS3ConfigField = (value: string) => {
    if (!value) {
      return `Required.`;
    }
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
    setFieldTouched({ s3: { ...inputTouched.s3, [field]: true } });
  };

  const validateSchedule = (schedule: PeriodSchedule) => {
    setFieldError({
      schedule:
        !schedule.period.interval || Number.isNaN(schedule.period.interval)
          ? 'Invalid schedule'
          : '',
    });
  };
  const onIntervalChange = (schedule: PeriodSchedule) => {
    validateSchedule(schedule);
    setSchedule({
      interval: {
        start_time: Date.now(),
        period: schedule.period.interval,
        unit: schedule.period.unit,
      },
    });
    setFieldTouched({ schedule: true });
  };

  const onFileChange = (files: FileList | null) => {
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
    setFieldTouched({ fileUpload: { file: true } });
  };

  const isThereAnError = (errors: any): boolean => {
    for (let key of Object.keys(errors)) {
      if (
        (sourceType !== 'S3_CUSTOM' && key === 's3') ||
        (sourceType !== 'IOC_UPLOAD' && key === 'fileUpload') ||
        (!source.enabled && key === 'schedule')
      ) {
        continue;
      }

      if (typeof errors[key] === 'string' && !!errors[key]) {
        return true;
      }

      if (typeof errors[key] === 'object') {
        if (isThereAnError(errors[key])) {
          return true;
        }
      }
    }

    return false;
  };

  const shouldEnableSubmit = () => {
    const { name, s3, fileUpload, ioc_types } = inputTouched;
    const reqFieldsTouched =
      name &&
      ioc_types &&
      ((sourceType === 'IOC_UPLOAD' && fileUpload?.file) ||
        (sourceType === 'S3_CUSTOM' && s3 && Object.values(s3).every((val) => val)));
    return reqFieldsTouched && !isThereAnError(inputErrors);
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
        <EuiFormRow
          label="Name"
          helpText="Rule name must contain 1-128 characters. Valid characters are a-z, A-Z, 0-9, hyphens, spaces, and underscores."
          isInvalid={!!inputErrors.name}
          error={inputErrors.name}
        >
          <EuiFieldText
            placeholder="Title"
            onChange={onNameChange}
            onBlur={onNameChange}
            value={source.name}
          />
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
            onBlur={onDescriptionChange}
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
                  <EuiFormLabel className={!!inputErrors.s3?.role_arn ? 'label--danger' : ''}>
                    IAM Role ARN
                  </EuiFormLabel>
                  <EuiText color="subdued" size="xs">
                    <span>
                      The Amazon Resource Name for an IAM role in Amazon Web Services (AWS)
                    </span>
                  </EuiText>
                </>
              }
              isInvalid={!!inputErrors.s3?.role_arn}
              error={inputErrors.s3?.role_arn}
            >
              <EuiFieldText
                placeholder="arn:"
                onChange={(event) => onS3DataChange('role_arn', event.target.value)}
                onBlur={(event) => onS3DataChange('role_arn', event.target.value)}
                value={s3ConnectionDetails.s3.role_arn}
              />
            </EuiFormRow>
            <EuiSpacer />
            <EuiFormRow
              label="S3 bucket directory"
              isInvalid={!!inputErrors.s3?.bucket_name}
              error={inputErrors.s3?.bucket_name}
            >
              <EuiFieldText
                placeholder="S3 bucket name"
                onChange={(event) => onS3DataChange('bucket_name', event.target.value)}
                onBlur={(event) => onS3DataChange('bucket_name', event.target.value)}
                value={s3ConnectionDetails.s3.bucket_name}
              />
            </EuiFormRow>
            <EuiSpacer />
            <EuiFormRow
              label="Specify a directory or file"
              isInvalid={!!inputErrors.s3?.object_key}
              error={inputErrors.s3?.object_key}
            >
              <EuiFieldText
                placeholder="Object key"
                onChange={(event) => onS3DataChange('object_key', event.target.value)}
                onBlur={(event) => onS3DataChange('object_key', event.target.value)}
                value={s3ConnectionDetails.s3.object_key}
              />
            </EuiFormRow>
            <EuiSpacer />
            <EuiFormRow
              label="Region"
              isInvalid={!!inputErrors.s3?.region}
              error={inputErrors.s3?.region}
            >
              <EuiFieldText
                placeholder="Region"
                onChange={(event) => onS3DataChange('region', event.target.value)}
                onBlur={(event) => onS3DataChange('region', event.target.value)}
                value={s3ConnectionDetails.s3.region}
              />
            </EuiFormRow>
            <EuiSpacer />
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
              isInvalid={!!inputErrors.fileUpload?.file}
              error={inputErrors.fileUpload?.file}
            >
              <EuiFilePicker
                id={'filePickerId'}
                fullWidth
                initialPromptText="Select or drag and drop a file"
                onChange={onFileChange}
                display={'large'}
                multiple={false}
                aria-label="ioc file picker"
                isInvalid={!!inputErrors.fileUpload?.file}
                data-test-subj="import_ioc_file"
              />
            </EuiFormRow>
            <EuiSpacer />
          </>
        )}
        <EuiText>
          <h4>Types of malicious indicators</h4>
        </EuiText>
        <EuiText color="subdued" size="s">
          <p>
            Select atleast one IOC type to select from the{' '}
            {sourceType === 'IOC_UPLOAD' ? 'uploaded file' : 'S3 bucket'}.
          </p>
        </EuiText>
        <EuiSpacer size="m" />
        <EuiFormRow isInvalid={!!inputErrors.ioc_types} error={inputErrors.ioc_types}>
          <EuiCheckboxGroup
            options={checkboxes}
            idToSelectedMap={checkboxIdToSelectedMap}
            onChange={onIocTypesChange}
          />
        </EuiFormRow>
        <EuiSpacer />
      </EuiPanel>
      <EuiSpacer />
      <EuiFlexGroup justifyContent="flexEnd">
        <EuiFlexItem grow={false}>
          <EuiButton onClick={() => history.push(ROUTES.THREAT_INTEL_OVERVIEW)}>Cancel</EuiButton>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiButton
            disabled={!shouldEnableSubmit()}
            isLoading={submitInProgress}
            fill
            onClick={onSubmit}
          >
            Add threat intel source
          </EuiButton>
        </EuiFlexItem>
      </EuiFlexGroup>
    </>
  );
};
