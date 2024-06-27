/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { ThreatIntelIocType } from '../common/constants';
import { PeriodSchedule } from '../models/interfaces';
import { AlertSeverity } from '../public/pages/Alerts/utils/constants';
import { TriggerAction } from './Alert';

export type ThreatIntelNextStepId = 'add-source' | 'configure-scan';

export interface ThreatIntelNextStepCardProps {
  id: ThreatIntelNextStepId;
  title: string;
  description: string;
  footerButtonProps: {
    text: string;
    disabled?: boolean;
  };
}

export enum FeedType {
  LICENSED,
  OPEN_SOURCED,
  S3_CUSTOM,
  INTERNAL,
  DEFAULT_OPEN_SOURCED,
  EXTERNAL_LICENSED,
  GUARDDUTY,
}

export interface ThreatIntelSourceItem extends ThreatIntelSourceSearchHitSourceConfig {
  id: string;
  version: number;
}

export interface S3ConnectionSource {
  s3: {
    bucket_name: string;
    object_key: string;
    region: string;
    role_arn: string;
  };
}

export interface FileUploadSource {
  ioc_upload: {
    file_name: string;
    iocs: any[];
  };
}

export interface ThreatIntelSourcePayload {
  type: 'S3_CUSTOM';
  name: string;
  description?: string;
  format: 'STIX2';
  store_type: 'OS';
  enabled: boolean;
  schedule: {
    interval: {
      start_time: number;
      period: number;
      unit: string;
    };
  };
  source: S3ConnectionSource | FileUploadSource;
  ioc_types: ThreatIntelIocType[];
}

export interface LogSourceIocConfig {
  enabled: boolean;
  fieldAliases: string[];
}

export type ThreatIntelIocConfigMap = {
  [k in ThreatIntelIocType]?: LogSourceIocConfig;
};

export interface ThreatIntelLogSource {
  name: string;
  iocConfigMap: ThreatIntelIocConfigMap;
}

export interface ThreatIntelAlertTrigger {
  name: string;
  data_sources: string[];
  ioc_types: string[];
  severity: AlertSeverity;
  action: TriggerAction & { destination_name: string };
}

export interface ThreatIntelScanConfig extends ThreatIntelMonitorPayload {
  id: string;
}

export type ThreatIntelScanConfigFormModel = Omit<
  ThreatIntelScanConfig,
  'per_ioc_type_scan_input_list' | 'id'
> & { logSources: ThreatIntelLogSource[] };

export interface ThreatIntelIocData {
  id: string;
  name: string;
  type: ThreatIntelIocType;
  value: string;
  severity: string;
  created: number;
  modified: number;
  description: string;
  labels: string[];
  feedId: string;
  specVersion: string;
  version: number;
  num_findings: number;
}

export type AddThreatIntelSourcePayload = ThreatIntelSourcePayload;
export type UpdateThreatIntelSourcePayload = ThreatIntelSourcePayload;

export type ThreatIntelSourceState = string;
export type ThreatIntelSourceRefreshType = string;

export interface ThreatIntelSourceSearchHitSourceConfig extends ThreatIntelSourcePayload {
  created_by_user: string | null;
  created_at: string | number;
  enabled_time: string | number;
  last_update_time: string | number;
  state: ThreatIntelSourceState;
  refresh_type: ThreatIntelSourceRefreshType;
  last_refreshed_time: string | number;
  last_refreshed_user: string | null;
}

export interface ThreatIntelSourceSearchHit {
  _index: string;
  _id: string;
  _version: number;
  _seq_no: number;
  _primary_term: number;
  _score: number;
  _source: {
    source_config: ThreatIntelSourceSearchHitSourceConfig;
  };
}

export interface ThreatIntelSourceGetHit {
  _id: string;
  _version: number;
  source_config: ThreatIntelSourceSearchHitSourceConfig;
}

export interface IocFieldAliases {
  ioc_type: ThreatIntelIocType;
  index_to_fields_map: {
    [index: string]: string[];
  };
}

export interface ThreatIntelMonitorPayload {
  name: string;
  per_ioc_type_scan_input_list: IocFieldAliases[];
  schedule: PeriodSchedule;
  indices: string[];
  enabled: boolean;
  triggers: ThreatIntelAlertTrigger[];
}

export interface GetIocsQueryParams {
  startIndex?: number;
  size?: number;
  feedIds?: string;
  iocTypes?: string;
  search?: string;
  sortString?: string;
}

export interface GetThreatIntelFindingsParams {
  sortString?: string;
  sortOrder?: string;
  missing?: string;
  size?: string;
  searchString?: string;
  startIndex?: string;
  findingIds?: string;
  iocIds?: string;
  startTime?: string;
  endTime?: string;
}

export interface GetThreatIntelFindingsResponse {}
