/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiBasicTableColumn } from '@elastic/eui';
import { AlertItem, DetectorItem, FindingItem } from './interfaces';

export type TableWidgetItem = FindingItem | AlertItem | DetectorItem;

export type TableWidgetProps<T extends TableWidgetItem> = {
  columns: EuiBasicTableColumn<T>[];
  items: T[];
  loading?: boolean;
};
