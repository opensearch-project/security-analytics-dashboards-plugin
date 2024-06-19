/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { ThreatIntelIocType } from '../common/constants';
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
  [k in ThreatIntelIocType]: LogSourceIocConfig;
};

export interface ThreatIntelLogSource {
  name: string;
  iocConfigMap: ThreatIntelIocConfigMap;
}

export interface ThreatIntelAlertTrigger {
  name: string;
  triggerCondition: {
    indicatorType: ThreatIntelIocType[];
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
}
