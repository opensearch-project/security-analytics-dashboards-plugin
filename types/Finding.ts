/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { CorrelationService, IndexPatternsService, OpenSearchService } from '../public/services';
import { FindingItemType } from './shared';

export interface Finding {
  id: string;
  detectorId: string;
  document_list: FindingDocument[];
  index: string;
  queries: Query[];
  related_doc_ids: string[];
  timestamp: number;
  detectionType: string;
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

export interface FindingDocumentItem extends FindingDocument {
  itemIdx: number;
}

/**
 * API interfaces
 */
export type GetFindingsParams = {
  sortOrder?: string;
  startIndex?: number;
  size?: number;
  detector_id?: string;
  detectorType?: string;
  detectionType?: string;
  severity?: string;
  searchString?: string;
  startTime?: number;
  endTime?: number;
  findingIds?: string[];
};

export interface GetFindingsResponse {
  total_findings: number;
  findings: Finding[];
}

export interface FindingDetailsFlyoutBaseProps {
  finding: FindingItemType;
  findings: FindingItemType[];
  shouldLoadAllFindings: boolean;
  backButton?: React.ReactNode;
}

export interface FindingDetailsFlyoutProps extends FindingDetailsFlyoutBaseProps {
  opensearchService: OpenSearchService;
  indexPatternsService: IndexPatternsService;
  correlationService: CorrelationService;
}
