/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { ALERT_SEVERITY_OPTIONS, DEFAULT_EMPTY_DATA } from '../../../utils/constants';
import {
  ThreatIntelAlertTrigger,
  ThreatIntelScanConfig,
  ThreatIntelNextStepCardProps,
  ThreatIntelScanConfigFormModel,
  ThreatIntelLogSource,
  ThreatIntelMonitorPayload,
  IocFieldAliases,
  S3ConnectionSource,
  FileUploadSource,
  ThreatIntelSourceItem,
  ThreatIntelSourcePayloadBase,
  ThreatIntelAlertTriggerAction,
  CustomSchemaFileUploadSource,
  ThreatIntelSourceFormInputErrorKeys,
  ThreatIntelSourceItemErrorCheckState,
} from '../../../../types';
import { AlertSeverity } from '../../Alerts/utils/constants';
import _ from 'lodash';
import { IOC_UPLOAD_MAX_FILE_SIZE } from './constants';
import {
  validateName,
  THREAT_INTEL_SOURCE_NAME_REGEX,
  validateDescription,
  THREAT_INTEL_SOURCE_DESCRIPTION_REGEX,
} from '../../../utils/validation';
import { PeriodSchedule } from '../../../../models/interfaces';
import { ThreatIntelIocSourceType } from '../../../../common/constants';

export function getEmptyScanConfigFormModel(triggerName: string): ThreatIntelScanConfigFormModel {
  return {
    enabled: true,
    name: 'Threat intel monitor',
    indices: [],
    logSources: [],
    schedule: {
      period: {
        interval: 1,
        unit: 'MINUTES',
      },
    },
    triggers: [getEmptyThreatIntelAlertTrigger(triggerName, false)],
  };
}

export function getEmptyThreatIntelAlertTriggerAction(): ThreatIntelAlertTriggerAction {
  return {
    id: '',
    name: '',
    destination_id: '',
    subject_template: {
      source: '',
      lang: 'mustache',
    },
    message_template: {
      source: '',
      lang: 'mustache',
    },
    throttle_enabled: false,
    throttle: {
      value: 10,
      unit: 'MINUTES',
    },
  };
}

export function getEmptyThreatIntelAlertTrigger(
  triggerName: string,
  includeEmptyAction: boolean = true
): ThreatIntelAlertTrigger {
  return {
    name: triggerName,
    data_sources: [],
    ioc_types: [],
    severity: AlertSeverity.ONE,
    actions: includeEmptyAction ? [getEmptyThreatIntelAlertTriggerAction()] : [],
  };
}

export function getThreatIntelALertSeverityLabel(severity: AlertSeverity) {
  return (
    Object.values(ALERT_SEVERITY_OPTIONS).find((option) => option.value === severity)?.label ||
    DEFAULT_EMPTY_DATA
  );
}

export function getThreatIntelNextStepsProps(
  logSourceAdded: boolean,
  isScanSetup: boolean
): ThreatIntelNextStepCardProps[] {
  return [
    {
      id: 'add-source',
      title: '1. Setup threat intel sources',
      description: 'Add/activate threat intel source(s) to get started',
      footerButtonProps: {
        text: 'Add threat intel source',
      },
    },
    {
      id: 'configure-scan',
      title: '2. Set up the scan for your log sources',
      description: 'Select log sources for scan and get alerted on security threats',
      footerButtonProps: {
        text: isScanSetup ? 'Edit scan configuration' : 'Configure scan',
        disabled: !logSourceAdded,
      },
    },
  ];
}

export function getEmptyS3ConnectionSource(): S3ConnectionSource {
  return {
    s3: {
      bucket_name: '',
      object_key: '',
      region: '',
      role_arn: '',
    },
  };
}

export function getEmptyIocFileUploadSource(): FileUploadSource {
  return {
    ioc_upload: {
      file_name: '',
      iocs: [],
    },
  };
}

export function getEmptyCustomSchemaIocFileUploadSource(): CustomSchemaFileUploadSource {
  return {
    custom_schema_ioc_upload: {
      file_name: '',
      iocs: '',
    },
  };
}

export function getEmptyThreatIntelSourcePayloadBase(): ThreatIntelSourcePayloadBase {
  return {
    name: '',
    description: '',
    format: 'STIX2',
    store_type: 'OS',
    enabled: true,
    ioc_types: [],
    enabled_for_scan: true,
  };
}

export function deriveFormModelFromConfig(
  scanConfig: ThreatIntelScanConfig
): ThreatIntelScanConfigFormModel {
  const logSourcesByName: { [name: string]: ThreatIntelLogSource } = {};
  scanConfig.per_ioc_type_scan_input_list.forEach(({ ioc_type, index_to_fields_map }) => {
    Object.entries(index_to_fields_map).forEach(([index, fieldAliases]) => {
      if (!logSourcesByName[index]) {
        logSourcesByName[index] = {
          name: index,
          iocConfigMap: {
            [ioc_type]: {
              fieldAliases,
              enabled: true,
            },
          },
        };
      } else {
        logSourcesByName[index].iocConfigMap[ioc_type] = {
          fieldAliases,
          enabled: true,
        };
      }
    });
  });

  const configClone: any = _.cloneDeep(scanConfig);
  delete configClone.per_ioc_type_scan_input_list;

  const formModel: ThreatIntelScanConfigFormModel = {
    ...configClone,
    logSources: Object.values(logSourcesByName),
  };

  return formModel;
}

export function configFormModelToMonitorPayload(
  formModel: ThreatIntelScanConfigFormModel
): ThreatIntelMonitorPayload {
  const fieldAliasesByIocType: { [k: string]: IocFieldAliases } = {};

  formModel.logSources.forEach((source) => {
    Object.entries(source.iocConfigMap).forEach(([iocType, iocConfig]) => {
      if (!iocConfig?.enabled) {
        return;
      }

      if (!fieldAliasesByIocType[iocType]) {
        fieldAliasesByIocType[iocType] = {
          ioc_type: iocType,
          index_to_fields_map: {
            [source.name]: iocConfig.fieldAliases,
          },
        };
      } else {
        fieldAliasesByIocType[iocType]!.index_to_fields_map[source.name] = iocConfig.fieldAliases;
      }
    });
  });

  const formModelClone: any = _.cloneDeep(formModel);
  delete formModelClone['logSources'];

  return {
    ...formModelClone,
    per_ioc_type_scan_input_list: Object.values(fieldAliasesByIocType),
  };
}

export function readIocsFromFile(
  file: File,
  onRead: (
    readResponse: { ok: true; sourceData: FileUploadSource } | { ok: false; errorMessage: string }
  ) => void
) {
  if (file.size > IOC_UPLOAD_MAX_FILE_SIZE) {
    return onRead({ ok: false, errorMessage: 'File size should be less then 500KB.' });
  }

  const reader = new FileReader();
  reader.readAsText(file);
  reader.onload = function () {
    try {
      const iocStrings =
        reader.result
          ?.toString()
          .split('\n')
          .filter((iocObj) => !!iocObj) || [];
      const iocs = [];
      for (let iocStr of iocStrings) {
        try {
          const ioc = JSON.parse(iocStr);
          if (typeof ioc !== 'object') {
            throw '';
          }
          iocs.push(ioc);
        } catch (e: any) {
          onRead({
            ok: false,
            errorMessage: 'Invalid IoC format found, must follow STIX spec.',
          });
        }
      }
      onRead({
        ok: true,
        sourceData: {
          ioc_upload: {
            file_name: file.name,
            iocs,
          },
        },
      });
    } catch (e: any) {
      onRead({ ok: false, errorMessage: e?.message || e?.toString?.() });
    }
  };
  reader.onerror = function () {
    onRead({ ok: false, errorMessage: 'Error reading file.' });
  };
}

export function threatIntelSourceItemToBasePayload(
  sourceItem: ThreatIntelSourceItem
): ThreatIntelSourcePayloadBase {
  const { name, description, enabled, ioc_types, enabled_for_scan } = sourceItem;
  return {
    name,
    description,
    format: 'STIX2',
    store_type: 'OS',
    enabled,
    ioc_types,
    enabled_for_scan,
  };
}

export const validateCustomSchema = (value: string) => {
  if (!value) {
    return 'Custom schema cannot be empty.';
  }

  try {
    JSON.parse(value);
  } catch (err: any) {
    return err.message;
  }
};

export const validateSourceName = (name: string) => {
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

export const validateSourceDescription = (description: string) => {
  let error;
  const isValid = validateDescription(description, THREAT_INTEL_SOURCE_DESCRIPTION_REGEX);
  if (!isValid) {
    error = 'Invalid name.';
  }

  return error;
};

export const validateS3ConfigField = (value: string) => {
  if (!value) {
    return `Required.`;
  }
};

export const validateSchedule = (schedule: PeriodSchedule) => {
  return !schedule.period.interval || Number.isNaN(schedule.period.interval)
    ? 'Invalid schedule.'
    : '';
};

export const hasErrorInThreatIntelSourceFormInputs = (
  errors: { [key: string]: any },
  state: ThreatIntelSourceItemErrorCheckState
): boolean => {
  const { enabled, hasCustomIocSchema, type } = state;

  for (let key of Object.keys(errors)) {
    if (
      (type !== ThreatIntelIocSourceType.S3_CUSTOM &&
        key === ThreatIntelSourceFormInputErrorKeys.s3) ||
      (type !== ThreatIntelIocSourceType.IOC_UPLOAD &&
        key === ThreatIntelSourceFormInputErrorKeys.fileUpload) ||
      (!enabled && key === ThreatIntelSourceFormInputErrorKeys.schedule) ||
      (key === 'customSchema' && !hasCustomIocSchema)
    ) {
      continue;
    }

    if (typeof errors[key] === 'string' && !!errors[key]) {
      return true;
    }

    if (typeof errors[key] === 'object') {
      if (hasErrorInThreatIntelSourceFormInputs(errors[key], state)) {
        return true;
      }
    }
  }

  return false;
};
