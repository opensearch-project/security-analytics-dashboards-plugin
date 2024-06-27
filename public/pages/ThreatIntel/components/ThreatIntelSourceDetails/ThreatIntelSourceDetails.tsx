/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  EuiBottomBar,
  EuiButton,
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
import { Interval } from '../../../CreateDetector/components/DefineDetector/components/DetectorSchedule/Interval';
import { FileUploadSource, S3ConnectionSource, ThreatIntelSourceItem } from '../../../../../types';
import { ROUTES, defaultIntervalUnitOptions } from '../../../../utils/constants';
import { readIocsFromFile, threatIntelSourceItemToUpdatePayload } from '../../utils/helpers';
import { ThreatIntelService } from '../../../../services';
import { RouteComponentProps } from 'react-router-dom';
import { ThreatIntelIocType } from '../../../../../common/constants';

export interface ThreatIntelSourceDetailsProps {
  sourceItem: ThreatIntelSourceItem;
  threatIntelService: ThreatIntelService;
  history: RouteComponentProps['history'];
}

export const ThreatIntelSourceDetails: React.FC<ThreatIntelSourceDetailsProps> = ({
  sourceItem,
  threatIntelService,
  history,
}) => {
  const [isReadOnly, setIsReadOnly] = useState(true);
  const [sourceItemState, setSourceItemState] = useState(sourceItem);
  const [s3ConnectionDetails, setS3ConnectionDetails] = useState<S3ConnectionSource>(
    sourceItem.source as S3ConnectionSource
  );
  const [fileUploadSource, setFileUploadSource] = useState<FileUploadSource>(
    sourceItem.source as FileUploadSource
  );
  const {
    id,
    description,
    name,
    schedule,
    ioc_types,
    source: iocSourceData,
    enabled,
  } = sourceItemState;
  const iocSourceType = (iocSourceData as S3ConnectionSource).s3 ? 'data_store' : 'file';
  const [fileError, setFileError] = useState('');
  const [saveInProgress, setSaveInProgress] = useState(false);
  const checkboxes = [
    {
      id: `ip`,
      label: 'IP - addresses',
    },
    {
      id: `domain`,
      label: 'Domains',
    },
    {
      id: `file_hash`,
      label: 'File hash',
    },
  ];
  const [checkboxIdToSelectedMap, setCheckboxIdToSelectedMap] = useState<Record<string, boolean>>(
    () => {
      const newCheckboxIdToSelectedMap: any = {};
      ioc_types.forEach((ioc_type) => {
        newCheckboxIdToSelectedMap[ioc_type] = true;
      });
      return newCheckboxIdToSelectedMap;
    }
  );

  const onNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSourceItemState({
      ...sourceItemState,
      name: event.target.value,
    });
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

  const onSave = () => {
    setSaveInProgress(true);
    let payload = threatIntelSourceItemToUpdatePayload(sourceItemState);
    payload = {
      ...payload,
      schedule: {
        ...sourceItemState.schedule,
        interval: {
          ...sourceItemState.schedule.interval,
          start_time: Date.now(),
        },
      },
      ioc_types: Object.entries(checkboxIdToSelectedMap)
        .filter(([ioc, checked]) => checked)
        .map(([ioc]) => ioc as ThreatIntelIocType),
      source: iocSourceType === 'data_store' ? s3ConnectionDetails : fileUploadSource,
    };
    threatIntelService.updateThreatIntelSource(id, payload).then((res) => {
      setSaveInProgress(false);
      if (res.ok) {
        setSaveInProgress(false);
        setIsReadOnly(true);
        history.push({
          pathname: `${ROUTES.THREAT_INTEL_SOURCE_DETAILS}/${res.response.id}`,
          state: { source: res.response },
        });
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
            <EuiFormRow label="Name">
              <EuiFieldText readOnly={isReadOnly} value={name} onChange={onNameChange} />
            </EuiFormRow>
            <EuiSpacer />
            <EuiFormRow label="Description">
              <EuiFieldText
                readOnly={isReadOnly}
                value={description}
                onChange={onDescriptionChange}
              />
            </EuiFormRow>
            <EuiSpacer />
            {iocSourceType === 'data_store' && (
              <>
                <EuiFormLabel>Download schedule</EuiFormLabel>
                <EuiSpacer size="xs" />
                <EuiFlexGroup alignItems="center">
                  <EuiFlexItem>
                    <Interval
                      label=""
                      schedule={{
                        period: {
                          interval: schedule.interval.period,
                          unit: schedule.interval.unit,
                        },
                      }}
                      onScheduleChange={(sch) => {}}
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
                <EuiFormRow label={<EuiFormLabel>IAM Role ARN</EuiFormLabel>}>
                  <EuiFieldText
                    readOnly={isReadOnly}
                    placeholder="arn:"
                    onChange={(event) => onS3DataChange('role_arn', event.target.value)}
                    value={s3ConnectionDetails.s3.role_arn}
                  />
                </EuiFormRow>
                <EuiSpacer />
                <EuiFormRow label="S3 bucket directory">
                  <EuiFieldText
                    readOnly={isReadOnly}
                    placeholder="S3://"
                    onChange={(event) => onS3DataChange('bucket_name', event.target.value)}
                    value={s3ConnectionDetails.s3.bucket_name}
                  />
                </EuiFormRow>
                <EuiSpacer />
                <EuiFormRow label="Specify a directory or file">
                  <EuiFieldText
                    readOnly={isReadOnly}
                    placeholder="Object key"
                    onChange={(event) => onS3DataChange('object_key', event.target.value)}
                    value={s3ConnectionDetails.s3.object_key}
                  />
                </EuiFormRow>
                <EuiSpacer />
                <EuiFormRow label="Region">
                  <EuiFieldText
                    readOnly={isReadOnly}
                    placeholder="Region"
                    onChange={(event) => onS3DataChange('region', event.target.value)}
                    value={s3ConnectionDetails.s3.region}
                  />
                </EuiFormRow>
                <EuiSpacer />
              </>
            )}
            {iocSourceType === 'file' && (
              <>
                {isReadOnly && (
                  <EuiFormRow label="Uploaded file">
                    <EuiFieldText
                      readOnly={isReadOnly}
                      value={fileUploadSource.ioc_upload?.file_name}
                      icon={'download'}
                    />
                  </EuiFormRow>
                )}
                {!isReadOnly && (
                  <>
                    <EuiFormRow
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
                    </EuiFormRow>
                  </>
                )}
              </>
            )}
            <EuiFormRow label="Types of malicious indicators">
              <>
                <EuiSpacer size="s" />
                <EuiCheckboxGroup
                  options={checkboxes}
                  idToSelectedMap={checkboxIdToSelectedMap}
                  onChange={onIocTypesChange}
                  disabled={isReadOnly}
                />
              </>
            </EuiFormRow>
            <EuiSpacer />
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButton
              style={{ visibility: isReadOnly ? 'visible' : 'hidden' }}
              onClick={() => setIsReadOnly(false)}
            >
              Edit
            </EuiButton>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiPanel>
      {!isReadOnly && (
        <EuiBottomBar>
          <EuiFlexGroup justifyContent="flexEnd">
            <EuiFlexItem grow={false}>
              <EuiButton onClick={onDiscard}>Discard</EuiButton>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiButton isLoading={saveInProgress} fill onClick={onSave}>
                Save
              </EuiButton>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiBottomBar>
      )}
    </>
  );
};
