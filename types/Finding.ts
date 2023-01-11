/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Finding {
  id: string;
  detectorId: string;
  document_list: FindingDocument[];
  index: string;
  queries: Query[];
  related_doc_ids: string[];
  timestamp: number;
}

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

/**
 * API interfaces
 */
export type GetFindingsParams =
  | {
      detectorId: string;
      detectorType?: string;
    }
  | {
      detectorType: string;
      detectorId?: string;
    };

export interface GetFindingsResponse {
  total_findings: number;
  findings: Finding[];
}
