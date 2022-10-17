/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
import QueryFilter from './QueryFilter';
import { DEFAULT_EMPTY_DATA } from '../../utils/constants';
import { EuiInMemoryTable, EuiEmptyPrompt, EuiText } from '@elastic/eui';
import { Fragment } from 'react';

interface TableWithFiltersProps {
  tableData: object;
  loadingFindings: boolean;
  showFilter: boolean;
}

interface TableWithFiltersState {
  columns: object;
  isAddFilterPopoverOpen: boolean;
}

const mockColumns = [
  {
    field: 'name',
    name: 'Name',
    sortable: true,
    dataType: 'string',
    render: (name: string) => name || DEFAULT_EMPTY_DATA,
  },
  {
    field: 'status',
    name: 'Status',
    sortable: true,
    dataType: 'string',
    render: (status: string) => status || DEFAULT_EMPTY_DATA,
  },
  {
    field: 'type',
    name: 'Detector type',
    sortable: true,
    dataType: 'string',
    render: (type: string) => type || DEFAULT_EMPTY_DATA,
  },
  {
    field: 'policy',
    name: 'Policy',
    sortable: true,
    dataType: 'string',
    render: (policy: string) => policy || DEFAULT_EMPTY_DATA,
  },
  {
    field: 'rules',
    name: 'Rules',
    sortable: true,
    dataType: 'string',
    render: (rules: string) => rules || DEFAULT_EMPTY_DATA,
  },
  {
    field: 'last_updated_time',
    name: 'Last updated time',
    sortable: true,
    dataType: 'date',
    render: (time: string) => time || DEFAULT_EMPTY_DATA,
  },
];

export default class TableWithFilters extends Component<
  TableWithFiltersProps,
  TableWithFiltersState
> {
  constructor(props: TableWithFiltersProps) {
    super(props);

    this.state = {
      columns: [],
      isAddFilterPopoverOpen: false,
    };
  }

  componentDidMount() {
    this.setState({
      columns: this.getColumns(),
    });
  }

  getColumns() {
    return mockColumns; // TODO: Implement parsing of prop
  }

  render() {
    const { columns } = this.state;
    const { tableData, loadingFindings, showFilter } = this.props;
    const sorting = {
      sort: {
        field: 'name',
        direction: 'asc',
      },
    };

    return (
      <Fragment>
        <QueryFilter showFilter={showFilter} />
        <EuiInMemoryTable
          items={tableData}
          itemId={(item) => `${item.id}:${item.name}`}
          columns={columns}
          pagination={true}
          sorting={sorting}
          isSelectable={false}
          loading={loadingFindings}
          noItemsMessage={
            <EuiEmptyPrompt
              style={{ maxWidth: '45em' }}
              body={
                <EuiText>
                  <p>There are no existing detectors.</p>
                </EuiText>
              }
            />
          }
        />
      </Fragment>
    );
  }
}
