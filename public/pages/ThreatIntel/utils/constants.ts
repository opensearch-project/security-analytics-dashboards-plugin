/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { ThreatIntelSourceFormInputFieldsTouched } from '../../../../types';

export enum ConfigureThreatIntelScanStep {
  SelectLogSources = 'SelectLogSources',
  SetupAlertTriggers = 'SetupAlertTriggers',
}

export const IOC_UPLOAD_MAX_FILE_SIZE = 512000;

export const IOC_SCHEMA_CODE_EDITOR_MAX_LINES = 25;

export const CUSTOM_SCHEMA_PLACEHOLDER = {
  type: {
    json_path: '[place your JSON path here] -- required',
  },
  value: {
    json_path: '[place your JSON path here] -- required',
  },
  id: {
    json_path: '[place your JSON path here] -- optional',
  },
  name: {
    json_path: '[place your JSON path here] -- optional',
  },
  severity: {
    json_path: '[place your JSON path here] -- optional',
  },
  created: {
    json_path: '[place your JSON path here] -- optional',
  },
  modified: {
    json_path: '[place your JSON path here] -- optional',
  },
  description: {
    json_path: '[place your JSON path here] -- optional',
  },
  labels: {
    json_path: '[place your JSON path here] -- optional',
  },
  spec_version: {
    json_path: '[place your JSON path here] -- optional',
  },
  feed_id: {
    json_path: '[place your JSON path here] -- optional',
  },
  feed_name: {
    json_path: '[place your JSON path here] -- optional',
  },
};

export const defaultInputTouched: ThreatIntelSourceFormInputFieldsTouched = {
  name: false,
  description: false,
  schedule: false,
  customSchema: false,
  customSchemaIocFileUpload: {
    file: false,
  },
  iocFileUpload: {
    file: false,
  },
  s3: {
    role_arn: false,
    bucket_name: false,
    object_key: false,
    region: false,
  },
};
