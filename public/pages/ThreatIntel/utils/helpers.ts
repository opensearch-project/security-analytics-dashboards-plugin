/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { DEFAULT_EMPTY_DATA } from '../../../utils/constants';
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
} from '../../../../types';
import { AlertSeverity } from '../../Alerts/utils/constants';
import { ALERT_SEVERITY_OPTIONS } from '../../CreateDetector/components/ConfigureAlerts/utils/constants';
import _ from 'lodash';
import { ThreatIntelIocType } from '../../../../common/constants';

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
    triggers: [getEmptyThreatIntelAlertTrigger(triggerName)],
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

export function getEmptyThreatIntelAlertTrigger(triggerName: string): ThreatIntelAlertTrigger {
  return {
    name: triggerName,
    data_sources: [],
    ioc_types: [],
    severity: AlertSeverity.ONE,
    actions: [getEmptyThreatIntelAlertTriggerAction()],
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

export function getEmptyThreatIntelSourcePayloadBase(): ThreatIntelSourcePayloadBase {
  return {
    name: '',
    description: '',
    format: 'STIX2',
    store_type: 'OS',
    enabled: true,
    ioc_types: [],
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

  configClone.triggers.forEach((trigger: ThreatIntelAlertTrigger) => {
    if (trigger.actions.length === 0) {
      trigger.actions.push(getEmptyThreatIntelAlertTriggerAction());
    }
  });

  const formModel: ThreatIntelScanConfigFormModel = {
    ...configClone,
    logSources: Object.values(logSourcesByName),
  };

  return formModel;
}

export function configFormModelToMonitorPayload(
  formModel: ThreatIntelScanConfigFormModel
): ThreatIntelMonitorPayload {
  const fieldAliasesByIocType: { [k in ThreatIntelIocType]?: IocFieldAliases } = {};

  formModel.logSources.forEach((source) => {
    Object.entries(source.iocConfigMap).forEach(([iocType, iocConfig]) => {
      if (!iocConfig?.enabled) {
        return;
      }

      if (!fieldAliasesByIocType[iocType as ThreatIntelIocType]) {
        fieldAliasesByIocType[iocType as ThreatIntelIocType] = {
          ioc_type: iocType as ThreatIntelIocType,
          index_to_fields_map: {
            [source.name]: iocConfig.fieldAliases,
          },
        };
      } else {
        fieldAliasesByIocType[iocType as ThreatIntelIocType]!.index_to_fields_map[source.name] =
          iocConfig.fieldAliases;
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
  if (file.size > 512000) {
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
  const { name, description, enabled, ioc_types } = sourceItem;
  return {
    name,
    description,
    format: 'STIX2',
    store_type: 'OS',
    enabled,
    ioc_types,
  };
}
