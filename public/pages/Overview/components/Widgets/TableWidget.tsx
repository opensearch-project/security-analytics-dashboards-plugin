/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiInMemoryTable } from '@elastic/eui';
import { TableWidgetItem, TableWidgetProps } from '../../../../../types';
import React from 'react';

export class TableWidget<T extends TableWidgetItem> extends React.Component<TableWidgetProps<T>> {
  render() {
    const { columns, items, sorting, message, className, loading = false } = this.props;

    return (
      <EuiInMemoryTable<T>
        className={className}
        compressed
        columns={columns}
        items={items}
        itemId={(item: T) => `${item.id}`}
        pagination={{ pageSize: 10, pageSizeOptions: [10] }}
        sorting={sorting}
        loading={loading}
        message={message}
      />
    );
  }
}
