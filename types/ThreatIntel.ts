/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { ThreatIntelIoc } from '../common/constants';
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

export interface ThreatIntelSourceItem {
  id: string;
  feedName: string;
  description: string;
  isEnabled: boolean;
  iocTypes: string[];
}

export interface LogSourceIocConfig {
  enabled: boolean;
  fieldAliases: string[];
}

export type ThreatIntelIocConfigMap = {
  [k in ThreatIntelIoc]: LogSourceIocConfig;
};

export interface ThreatIntelLogSource {
  name: string;
  iocConfigMap: ThreatIntelIocConfigMap;
}

export interface ThreatIntelAlertTrigger {
  name: string;
  triggerCondition: {
    indicatorType: ThreatIntelIoc[];
    dataSource: string[];
  };
  alertSeverity: AlertSeverity;
  action: TriggerAction & { destination_name: string };
}

export interface ThreatIntelScanConfig {
  isRunning: boolean;
  logSources: ThreatIntelLogSource[];
  triggers: ThreatIntelAlertTrigger[];
}

export interface ThreatIntelIocData {
  id: string;
  name: string;
  type: ThreatIntelIoc;
  value: string;
  severity: string;
  created: number;
  modified: number;
  description: string;
  labels: string[];
  feedId: string;
  specVersion: string;
  version: number;
}

export const dummyIoCDetails: ThreatIntelIocData = {
  id: 'indicator--8e2e2d2b-17d4-4cbf-938f-98ee46b3cd3f',
  name: 'my-bad-ip',
  type: ThreatIntelIoc.IPAddress,
  value: '192.0.2.1',
  severity: 'High',
  created: 1718761171,
  modified: 1718761171,
  description: 'Random IP address',
  labels: [],
  feedId: 'random-feed-id',
  specVersion: '',
  version: 1,
};

// export interface ThreatIntelSourceItem {
//   id: string;
//   version: number;
//   feedName: string;
//   description: string;
//   feedFormat: string;
//   feedType: FeedType;
//   createdByUser: string;
//   createdAt: number;
//   enabledTime: number;
//   lastUpdateTime: number;
//   schedule: string;
//   state: string;
//   refreshType: string;
//   lastRefreshedTime: number;
//   lastRefreshedUser: string;
//   isEnabled: boolean;
//   iocMapStore: Record<string, object>;
//   iocTypes: string[];
// }

export const dummySource: ThreatIntelSourceItem = {
  id: 'hello-world',
  feedName: 'AlienVault',
  description: 'Short description for threat intel source',
  isEnabled: false,
  iocTypes: ['IP', 'Domain', 'File hash'],
};

export const dummyLogSource: ThreatIntelLogSource = {
  name: 'windows*',
  iocConfigMap: {
    [ThreatIntelIoc.IPAddress]: {
      enabled: true,
      fieldAliases: ['src_ip', 'dst.ip'],
    },
    [ThreatIntelIoc.Domain]: {
      enabled: true,
      fieldAliases: ['domain'],
    },
    [ThreatIntelIoc.FileHash]: {
      enabled: false,
      fieldAliases: ['hash'],
    },
  },
};

export const dummyLogSource2: ThreatIntelLogSource = {
  name: 'cloudtrail*',
  iocConfigMap: {
    [ThreatIntelIoc.IPAddress]: {
      enabled: true,
      fieldAliases: ['src_ip', 'dst.ip'],
    },
    [ThreatIntelIoc.Domain]: {
      enabled: true,
      fieldAliases: ['domain'],
    },
    [ThreatIntelIoc.FileHash]: {
      enabled: false,
      fieldAliases: ['hash'],
    },
  },
};

/**
 * 
 * 
 * 
 * 
 *  private String id;
    private Long version;
    private String feedName;
    private String feedFormat;
    private FeedType feedType;
    private String createdByUser;
    private Instant createdAt;

    //    private Source source; TODO: create Source Object
    private Instant enabledTime;
    private Instant lastUpdateTime;
    private IntervalSchedule schedule;
    private TIFJobState state;
    public RefreshType refreshType;
    public Instant lastRefreshedTime;
    public String lastRefreshedUser;
    private Boolean isEnabled;
    private Map<String, Object> iocMapStore;
    private List<String> iocTypes;
 */
