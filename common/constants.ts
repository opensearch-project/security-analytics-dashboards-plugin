/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

export const DEFAULT_RULE_UUID = '25b9c01c-350d-4b95-bed1-836d04a4f324';

export enum ThreatIntelIocType {
  Domain = 'domain_name',
  FileHash = 'hashes',
  IPV4 = 'ipv4_addr',
  IPV6 = 'ipv6_addr',
}

export const IocLabel: { [k in ThreatIntelIocType]: string } = {
  [ThreatIntelIocType.IPV4]: 'IPV4-Address',
  [ThreatIntelIocType.IPV6]: 'IPV6-Address',
  [ThreatIntelIocType.Domain]: 'Domains',
  [ThreatIntelIocType.FileHash]: 'File hash',
};
