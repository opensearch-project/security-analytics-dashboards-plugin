/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

export const DEFAULT_RULE_UUID = '25b9c01c-350d-4b95-bed1-836d04a4f324';

export enum ThreatIntelIoc {
  IPAddress = 'IP',
  Domain = 'Domain',
  FileHash = 'FileHash',
}

export const IocLabel: { [k in ThreatIntelIoc]: string } = {
  [ThreatIntelIoc.IPAddress]: 'IP-Address',
  [ThreatIntelIoc.Domain]: 'Domains',
  [ThreatIntelIoc.FileHash]: 'File hash',
};
