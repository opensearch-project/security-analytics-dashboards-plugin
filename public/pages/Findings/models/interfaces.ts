/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

interface FilterOption {
  id: string;
  label: string;
}

interface Finding {
  id: string;
  detector_id: string;
  detector_name: string;
  document_list: FindingDocument[];
  index: string;
  queries: Query[];
  related_doc_ids: string[];
  timestamp: number;
}

interface Query {
  id: string;
  name: string;
  query: string;
  tags: string[];
  category: string;
  severity: string;
  description: string;
}

interface FindingDocument {
  id: string;
  index: string;
  found: boolean;
  document: string;
}
