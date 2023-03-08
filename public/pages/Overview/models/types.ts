/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiBasicTableColumn } from '@elastic/eui';
import { SortDirection } from '../../../utils/constants';
import { AlertItem, DetectorItem, FindingItem } from './interfaces';

export type TableWidgetItem = FindingItem | AlertItem | DetectorItem;

export type TableWidgetProps<T extends TableWidgetItem> = {
  columns: EuiBasicTableColumn<T>[];
  items: T[];
  sorting?: {
    sort: {
      field: string;
      direction: SortDirection;
    };
  };
  className?: string;
  loading?: boolean;
  message?: React.ReactNode;
};
