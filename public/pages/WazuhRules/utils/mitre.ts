/*
 * Copyright Wazuh Inc.
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { dump, load } from 'js-yaml';

export interface MitreEntry {
  id: string;
  name: string;
}

export interface MitreState {
  tactic: MitreEntry[];
  technique: MitreEntry[];
  subtechnique: MitreEntry[];
}

export interface MitreSection {
  field: keyof MitreState;
  title: string;
  idPlaceholder: string;
  namePlaceholder: string;
  addButtonName: string;
}

export const MITRE_SECTIONS: MitreSection[] = [
  {
    field: 'tactic',
    title: 'Tactics',
    idPlaceholder: 'e.g. TA0001',
    namePlaceholder: 'e.g. Initial Access',
    addButtonName: 'Add tactic',
  },
  {
    field: 'technique',
    title: 'Techniques',
    idPlaceholder: 'e.g. T1078',
    namePlaceholder: 'e.g. Valid Accounts',
    addButtonName: 'Add technique',
  },
  {
    field: 'subtechnique',
    title: 'Sub-techniques',
    idPlaceholder: 'e.g. T1078.001',
    namePlaceholder: 'e.g. Default Accounts',
    addButtonName: 'Add sub-technique',
  },
];

export const EMPTY_MITRE: MitreState = { tactic: [], technique: [], subtechnique: [] };

function parseMitreField(field: unknown): MitreEntry[] {
  if (typeof field !== 'object' || field === null || Array.isArray(field)) return [];
  const obj = field as Record<string, unknown>;
  const ids = Array.isArray(obj.id) ? obj.id : [];
  const names = Array.isArray(obj.name) ? obj.name : [];
  const len = Math.max(ids.length, names.length);
  return Array.from({ length: len }, (_, i) => ({ id: ids[i] ?? '', name: names[i] ?? '' }));
}

export function parseMitreYml(yml: string): MitreState {
  try {
    const parsed = (yml ? load(yml) : null) as Record<string, unknown> | null | undefined;
    return {
      tactic: parseMitreField(parsed?.tactic),
      technique: parseMitreField(parsed?.technique),
      subtechnique: parseMitreField(parsed?.subtechnique),
    };
  } catch {
    return { ...EMPTY_MITRE };
  }
}

export function dumpMitreYml(state: MitreState): string {
  const obj: Record<string, { id: string[]; name: string[] }> = {};
  for (const key of ['tactic', 'technique', 'subtechnique'] as const) {
    const entries = state[key].filter((e) => e.id || e.name);
    if (entries.length) {
      obj[key] = {
        id: entries.map((e) => e.id),
        name: entries.map((e) => e.name),
      };
    }
  }
  return Object.keys(obj).length ? dump(obj) : '';
}
