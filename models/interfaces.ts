/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

interface RuleSource {
  source: {
    author: string;
    category: string;
    description: string;
    falsepositives: [];
    last_update_time: string;
    level: string;
    log_source: string;
    queries: [];
    references: string[];
    rule: string;
    status: string;
    tags: string[];
    title: string;
  };
}

export interface Rules {
  _id: string;
  _index: string;
  _primary_term: number;
  _score: number;
  _seq_no: number;
  source: RuleSource[];
  version: number;
}
