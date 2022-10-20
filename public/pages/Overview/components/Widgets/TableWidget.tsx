/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiBasicTable } from '@elastic/eui';
import React from 'react';
import { TableWidgetItem, TableWidgetProps } from '../../models/types';

export class TableWidget<T extends TableWidgetItem> extends React.Component<TableWidgetProps<T>> {
  render() {
    const { columns, items } = this.props;

    return <EuiBasicTable<T> columns={columns} items={items} itemId={(item: T) => `${item.id}`} />;
  }
}
