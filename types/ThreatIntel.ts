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

export type ThreatIntelSourceItem = ThreatIntelSourceSearchHitSourceConfig & {
  id: string;
  version: number;
};

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

export interface ThreatIntelSourcePayloadBase {
  name: string;
  description?: string;
  format: 'STIX2';
  store_type: 'OS';
  enabled: boolean;
  ioc_types: ThreatIntelIocType[];
}

export interface ThreatIntelS3CustomSourcePayload extends ThreatIntelSourcePayloadBase {
  type: 'S3_CUSTOM';
  schedule: {
    interval: {
      start_time: number;
      period: number;
      unit: string;
    };
  };
  source: S3ConnectionSource;
}

export interface ThreatIntelIocUploadSourcePayload extends ThreatIntelSourcePayloadBase {
  type: 'IOC_UPLOAD';
  source: FileUploadSource;
}

export type ThreatIntelSourcePayload =
  | ThreatIntelS3CustomSourcePayload
  | ThreatIntelIocUploadSourcePayload;

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

export type ThreatIntelAlertTriggerAction = TriggerAction;

export interface ThreatIntelAlertTrigger {
  name: string;
  data_sources: string[];
  ioc_types: string[];
  severity: AlertSeverity;
  actions: ThreatIntelAlertTriggerAction[];
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

export type ThreatIntelSourceSearchHitSourceConfig = ThreatIntelSourcePayload & {
  created_by_user: string | null;
  created_at: string | number;
  enabled_time: string | number;
  last_update_time: string | number;
  state: ThreatIntelSourceState;
  refresh_type: ThreatIntelSourceRefreshType;
  last_refreshed_time: string | number;
  last_refreshed_user: string | null;
};

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
  feed_ids?: string;
  ioc_types?: string;
  searchString?: string;
  sortString?: string;
}

export interface GetThreatIntelFindingsParams {
  sortString?: string;
  sortOrder?: string;
  missing?: string;
  size?: number;
  searchString?: string;
  startIndex?: number;
  findingIds?: string;
  iocIds?: string;
  startTime?: number;
  endTime?: number;
}

export interface ThreatIntelFindingHit {
  _id: string;
  _source: {
    id: string;
    related_doc_ids: string[];
    ioc_feed_ids: {
      ioc_id: string;
      feed_id: string;
      feed_name: string;
      index: string;
    }[];
    monitor_id: string;
    monitor_name: string;
    ioc_value: any;
    ioc_type: ThreatIntelIocType;
    timestamp: number;
    execution_id: string;
  };
}

export type ThreatIntelFinding = ThreatIntelFindingHit['_source'];

export type ThreatIntelFindingsGroupByType = 'indicatorType';

export interface GetThreatIntelFindingsResponse {
  total_findings: number;
  ioc_findings: ThreatIntelFinding[];
}

export interface ThreatIntelAlert {
  id: string;
  version: number;
  schema_version: number;
  seq_no: number;
  primary_term: number;
  trigger_id: string;
  trigger_name: string;
  state: string;
  error_message: string;
  ioc_value: string;
  ioc_type: ThreatIntelIocType;
  severity: string;
  finding_ids: string[];
  acknowledged_time: number;
  last_updated_time: number;
  start_time: number;
  end_time: number;
}

export interface GetThreatIntelAlertsResponse {
  total_alerts: number;
  alerts: ThreatIntelAlert[];
}

export interface ThreatIntelFindingDetailsFlyoutProps {
  backButton?: React.ReactNode;
  finding: ThreatIntelFinding;
}

export interface ThreatIntelFindingDocumentItem {
  id: string;
  pos: number;
  index: string;
  document?: string;
}

export interface GetThreatIntelAlertsParams {
  startTime?: number;
  endTime?: number;
  severityLevel?: string;
  alertState?: string;
  sortString?: string;
  sortOrder?: string;
  missing?: string;
  size?: number;
  startIndex?: number;
  searchString?: string;
}
