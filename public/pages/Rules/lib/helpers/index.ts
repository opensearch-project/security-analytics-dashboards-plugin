/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

export const ruleTypes: string[] = [
  'application',
  'apt',
  'cloud',
  'compliance',
  'linux',
  'macos',
  'network',
  'proxy',
  'web',
  'windows',
];

export const ruleSeverity: string[] = ['low', 'medium', 'informational', 'high', 'critical'];

export const ruleSource: string[] = ['default', 'custom'];
