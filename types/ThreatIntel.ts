/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

export type ThreatIntelNextStepId = 'connect' | 'configure-scan';

export interface ThreatIntelNextStepCardProps {
  id: ThreatIntelNextStepId;
  title: string;
  description: string;
  footerButtonText: string;
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
  id: '',
  feedName: 'AlienVault',
  description: 'Short description for threat intel source',
  isEnabled: true,
  iocTypes: ['IP', 'Domain', 'File hash'],
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
