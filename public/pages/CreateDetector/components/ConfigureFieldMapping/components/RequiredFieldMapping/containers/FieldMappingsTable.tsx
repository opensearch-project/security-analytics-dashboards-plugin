/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { EuiEmptyPrompt, EuiIcon, EuiInMemoryTable, EuiText } from '@elastic/eui';
import { DEFAULT_EMPTY_DATA } from '../../../../../../../utils/constants';
import { STATUS_ICON_PROPS } from '../../../utils/constants';
import SIEMFieldName from '../components';

interface FieldMappingsTableProps extends RouteComponentProps {
  loading: boolean;
  mappings: object[];
}

interface FieldMappingsTableState {}

export default class FieldMappingsTable extends Component<
  FieldMappingsTableProps,
  FieldMappingsTableState
> {
  constructor(props: FieldMappingsTableProps) {
    super(props);
    this.state = {};
  }

  componentDidMount = async () => {};

  render() {
    const { loading, mappings } = this.props;

    const columns = [
      {
        field: 'log_field_name',
        name: 'Log field name',
        sortable: true,
        dataType: 'string',
        width: '25%',
        render: (log_field_name) => log_field_name || DEFAULT_EMPTY_DATA,
      },
      {
        field: '',
        name: 'Maps to',
        align: 'center',
        width: '15%',
        render: () => <EuiIcon type={'sortRight'} />,
      },
      {
        field: 'siem_field',
        name: 'SIEM field name',
        sortable: true,
        dataType: 'string',
        width: '45%',
        render: (siem_field) => <SIEMFieldName siemFieldName={siem_field} />,
      },
      {
        field: 'status',
        name: 'Status',
        sortable: true,
        dataType: 'string',
        align: 'center',
        width: '15%',
        render: (status, entry) => {
          const iconProps =
            !status || !entry.siem_field ? STATUS_ICON_PROPS.alert : STATUS_ICON_PROPS[status];
          return <EuiIcon {...iconProps} /> || DEFAULT_EMPTY_DATA;
        },
      },
    ];

    const sorting = {
      sort: {
        field: 'log_field_name',
        direction: 'asc',
      },
    };

    return (
      <EuiInMemoryTable
        loading={loading}
        items={mappings}
        columns={columns}
        pagination={true}
        sorting={sorting}
        isSelectable={false}
        noItemsMessage={
          <EuiEmptyPrompt
            style={{ maxWidth: '45em' }}
            body={
              <EuiText>
                <p>There are no field mappings.</p>
              </EuiText>
            }
          />
        }
      />
    );
  }
}
