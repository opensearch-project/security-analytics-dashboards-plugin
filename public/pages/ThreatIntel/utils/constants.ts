/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { IocLabel, ThreatIntelIocType } from '../../../../common/constants';

export enum ConfigureThreatIntelScanStep {
  SelectLogSources = 'SelectLogSources',
  SetupAlertTriggers = 'SetupAlertTriggers',
}

export const checkboxes: { id: ThreatIntelIocType; label: string }[] = [
  {
    id: ThreatIntelIocType.IPV4,
    label: IocLabel[ThreatIntelIocType.IPV4],
  },
  {
    id: ThreatIntelIocType.IPV6,
    label: IocLabel[ThreatIntelIocType.IPV6],
  },
  {
    id: ThreatIntelIocType.Domain,
    label: IocLabel[ThreatIntelIocType.Domain],
  },
  {
    id: ThreatIntelIocType.FileHash,
    label: IocLabel[ThreatIntelIocType.FileHash],
  },
];
