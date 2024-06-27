/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

export const DEFAULT_RULE_UUID = '25b9c01c-350d-4b95-bed1-836d04a4f324';

export enum ThreatIntelIocType {
  IPAddress = 'ip',
  Domain = 'domain',
  FileHash = 'hash',
}

export const IocLabel: { [k in ThreatIntelIocType]: string } = {
  [ThreatIntelIocType.IPAddress]: 'IP-Address',
  [ThreatIntelIocType.Domain]: 'Domains',
  [ThreatIntelIocType.FileHash]: 'File hash',
};
