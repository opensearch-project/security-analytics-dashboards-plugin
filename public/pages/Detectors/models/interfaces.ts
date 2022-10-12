/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { Direction } from '@elastic/eui';

export interface DetectorItem {
  id: string;
  name: string;
}

export interface DetectorsQueryParams {
  from: number;
  size: number;
  search: string;
  sortField: keyof DetectorItem;
  sortDirection: Direction;
}

export interface IndexOption {
  label: string;
}

export interface DetectorTypeOption {
  id: string;
  label: string;
}
