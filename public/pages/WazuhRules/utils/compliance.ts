/*
 * Copyright Wazuh Inc.
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { dump, load } from 'js-yaml';

export type ComplianceKey =
  | 'pci_dss'
  | 'hipaa'
  | 'gdpr'
  | 'nist_800_53'
  | 'nist_800_171'
  | 'cmmc'
  | 'iso_27001'
  | 'nis2'
  | 'tsc'
  | 'fedramp';

export type ComplianceState = Record<ComplianceKey, string[]>;

export interface ComplianceFramework {
  key: ComplianceKey;
  label: string;
  columnHeader: string;
  placeholder: string;
  addButtonName: string;
}

export const COMPLIANCE_FRAMEWORKS: ComplianceFramework[] = [
  {
    key: 'pci_dss',
    label: 'PCI DSS',
    columnHeader: 'Requirement',
    placeholder: 'e.g. 1.1.1',
    addButtonName: 'Add PCI DSS requirement',
  },
  {
    key: 'hipaa',
    label: 'HIPAA',
    columnHeader: 'Control',
    placeholder: 'e.g. 164.308.a.1.II',
    addButtonName: 'Add HIPAA control',
  },
  {
    key: 'gdpr',
    label: 'GDPR',
    columnHeader: 'Article',
    placeholder: 'e.g. IV_35.7.d',
    addButtonName: 'Add GDPR article',
  },
  {
    key: 'nist_800_53',
    label: 'NIST SP 800-53',
    columnHeader: 'Control',
    placeholder: 'e.g. AC.1',
    addButtonName: 'Add NIST SP 800-53 control',
  },
  {
    key: 'nist_800_171',
    label: 'NIST SP 800-171',
    columnHeader: 'Control',
    placeholder: 'e.g. 3.1.1',
    addButtonName: 'Add NIST SP 800-171 control',
  },
  {
    key: 'cmmc',
    label: 'CMMC',
    columnHeader: 'Practice',
    placeholder: 'e.g. AC.1.001',
    addButtonName: 'Add CMMC practice',
  },
  {
    key: 'iso_27001',
    label: 'ISO/IEC 27001',
    columnHeader: 'Control',
    placeholder: 'e.g. A.9.1.1',
    addButtonName: 'Add ISO/IEC 27001 control',
  },
  {
    key: 'nis2',
    label: 'NIS2',
    columnHeader: 'Requirement',
    placeholder: 'e.g. Article 21',
    addButtonName: 'Add NIS2 requirement',
  },
  {
    key: 'tsc',
    label: 'TSC',
    columnHeader: 'Criteria',
    placeholder: 'e.g. CC6.1',
    addButtonName: 'Add TSC criteria',
  },
  {
    key: 'fedramp',
    label: 'FedRAMP',
    columnHeader: 'Control',
    placeholder: 'e.g. AC-1',
    addButtonName: 'Add FedRAMP control',
  },
];

export const COMPLIANCE_KEYS: ComplianceKey[] = COMPLIANCE_FRAMEWORKS.map((f) => f.key);

export const EMPTY_COMPLIANCE: ComplianceState = Object.fromEntries(
  COMPLIANCE_KEYS.map((k) => [k, []])
) as ComplianceState;

export function parseComplianceYml(yml: string): ComplianceState {
  try {
    const parsed = yml ? (load(yml) as any) : {};
    const result: ComplianceState = { ...EMPTY_COMPLIANCE };
    for (const key of COMPLIANCE_KEYS) {
      if (Array.isArray(parsed?.[key])) {
        result[key] = parsed[key].filter(Boolean);
      }
    }
    return result;
  } catch {
    return { ...EMPTY_COMPLIANCE };
  }
}

export function dumpComplianceYml(state: ComplianceState): string {
  const obj: Record<string, string[]> = {};
  for (const key of COMPLIANCE_KEYS) {
    if (state[key].length) obj[key] = state[key];
  }
  return Object.keys(obj).length ? dump(obj) : '';
}
