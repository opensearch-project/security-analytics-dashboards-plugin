/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Query {
  id: string;
  name: string;
  query: string;
  tags: string[];
  category: string;
  severity: string;
  description: string;
}

export interface FindingDocument {
  id: string;
  index: string;
  found: boolean;
  document: string;
}
