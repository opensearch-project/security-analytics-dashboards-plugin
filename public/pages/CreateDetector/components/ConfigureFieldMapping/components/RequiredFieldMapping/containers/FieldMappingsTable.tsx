/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import {
  EuiBasicTableColumn,
  EuiEmptyPrompt,
  EuiIcon,
  EuiInMemoryTable,
  EuiText,
} from '@elastic/eui';
import { DEFAULT_EMPTY_DATA } from '../../../../../../../utils/constants';
import { STATUS_ICON_PROPS } from '../../../utils/constants';
import SIEMFieldName from '../components';
import { FieldMappingsTableItem } from '../../../../../types/interfaces';

interface FieldMappingsTableProps extends RouteComponentProps {
  loading: boolean;
  unmappedIndexFields: string[];
  unmappedAliasNames: string[];
}

interface FieldMappingsTableState {
  remainingUnmappedAlias: Set<string>;
}

export default class FieldMappingsTable extends Component<
  FieldMappingsTableProps,
  FieldMappingsTableState
> {
  constructor(props: FieldMappingsTableProps) {
    super(props);
    this.state = {
      remainingUnmappedAlias: new Set(props.unmappedAliasNames),
    };
  }

  static getDerivedStateFromProps(props: FieldMappingsTableProps): FieldMappingsTableState {
    return {
      remainingUnmappedAlias: new Set(props.unmappedAliasNames),
    };
  }

  componentDidMount = async () => {};

  onMappingSelected = (selectedAlias: string) => {
    const newRemainingAlias = new Set(this.state.remainingUnmappedAlias);
    newRemainingAlias.delete(selectedAlias);
    this.setState({ remainingUnmappedAlias: newRemainingAlias });
  };

  render() {
    const { loading, unmappedIndexFields } = this.props;
    const items: FieldMappingsTableItem[] = unmappedIndexFields.map((indexField) => ({
      logFieldName: indexField,
      siemFieldName: undefined,
      status: 'unmapped',
    }));

    const columns: EuiBasicTableColumn<FieldMappingsTableItem>[] = [
      {
        field: 'logFieldName',
        name: 'Log field name',
        sortable: true,
        dataType: 'string',
        width: '25%',
        render: (log_field_name: string) => log_field_name || DEFAULT_EMPTY_DATA,
      },
      {
        field: '',
        name: 'Maps to',
        align: 'center',
        width: '15%',
        render: () => <EuiIcon type={'sortRight'} />,
      },
      {
        field: 'siemfieldName',
        name: 'SIEM field name',
        sortable: true,
        dataType: 'string',
        width: '45%',
        render: (siem_field: string, entry: FieldMappingsTableItem) => (
          <SIEMFieldName
            siemFieldNameOptions={Array.from(this.state.remainingUnmappedAlias)}
            onChange={this.onMappingSelected}
          />
        ),
      },
      {
        field: 'status',
        name: 'Status',
        sortable: true,
        dataType: 'string',
        align: 'center',
        width: '15%',
        render: (status: 'mapped' | 'unmapped', entry: FieldMappingsTableItem) => {
          const iconProps =
            status === 'unmapped' || !entry.siemFieldName
              ? STATUS_ICON_PROPS['unmapped']
              : STATUS_ICON_PROPS[status];
          return <EuiIcon {...iconProps} /> || DEFAULT_EMPTY_DATA;
        },
      },
    ];

    const sorting: { sort: { field: string; direction: 'asc' | 'desc' } } = {
      sort: {
        field: 'logFieldName',
        direction: 'asc',
      },
    };

    return (
      <EuiInMemoryTable
        loading={loading}
        items={items}
        columns={columns}
        pagination={true}
        sorting={sorting}
        isSelectable={false}
        message={
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
