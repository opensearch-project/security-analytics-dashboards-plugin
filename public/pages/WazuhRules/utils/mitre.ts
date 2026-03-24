/*
 * Copyright Wazuh Inc.
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { dump, load } from 'js-yaml';

export interface MitreState {
  tactic: string[];
  technique: string[];
  subtechnique: string[];
}

export interface MitreSection {
  field: keyof MitreState;
  title: string;
  columnHeader: string;
  placeholder: string;
  addButtonName: string;
}

export const MITRE_SECTIONS: MitreSection[] = [
  {
    field: 'tactic',
    title: 'Tactics',
    columnHeader: 'Tactic ID',
    placeholder: 'e.g. TA0001',
    addButtonName: 'Add tactic',
  },
  {
    field: 'technique',
    title: 'Techniques',
    columnHeader: 'Technique ID',
    placeholder: 'e.g. T1078',
    addButtonName: 'Add technique',
  },
  {
    field: 'subtechnique',
    title: 'Sub-techniques',
    columnHeader: 'Sub-technique ID',
    placeholder: 'e.g. T1078.001',
    addButtonName: 'Add sub-technique',
  },
];

export const EMPTY_MITRE: MitreState = { tactic: [], technique: [], subtechnique: [] };

export function parseMitreYml(yml: string): MitreState {
  try {
    const parsed = yml ? (load(yml) as any) : {};
    return {
      tactic: Array.isArray(parsed?.tactic) ? parsed.tactic.filter(Boolean) : [],
      technique: Array.isArray(parsed?.technique) ? parsed.technique.filter(Boolean) : [],
      subtechnique: Array.isArray(parsed?.subtechnique) ? parsed.subtechnique.filter(Boolean) : [],
    };
  } catch {
    return { ...EMPTY_MITRE };
  }
}

export function dumpMitreYml(state: MitreState): string {
  const obj: Record<string, string[]> = {};
  if (state.tactic.length) obj.tactic = state.tactic;
  if (state.technique.length) obj.technique = state.technique;
  if (state.subtechnique.length) obj.subtechnique = state.subtechnique;
  return Object.keys(obj).length ? dump(obj) : '';
}
