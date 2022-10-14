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
import { DEFAULT_EMPTY_DATA } from '../../../../../../utils/constants';
import { STATUS_ICON_PROPS } from '../../utils/constants';
import SIEMFieldNameSelector from './SIEMFieldName';
import { FieldMappingsTableItem } from '../../../../types/interfaces';

interface FieldMappingsTableProps extends RouteComponentProps {
  loading: boolean;
  isMappingRequired: boolean;
  indexFields: string[];
  aliasNames: string[];
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
      remainingUnmappedAlias: new Set(props.aliasNames),
    };
  }

  static getDerivedStateFromProps(props: FieldMappingsTableProps): FieldMappingsTableState {
    return {
      remainingUnmappedAlias: new Set(props.aliasNames),
    };
  }

  onMappingSelected = (selectedAlias: string) => {
    const newRemainingAlias = new Set(this.state.remainingUnmappedAlias);
    newRemainingAlias.delete(selectedAlias);
    this.setState({ remainingUnmappedAlias: newRemainingAlias });
  };

  render() {
    const { loading, indexFields: unmappedIndexFields, isMappingRequired, aliasNames } = this.props;
    let items: FieldMappingsTableItem[];

    if (isMappingRequired) {
      items = unmappedIndexFields.map((indexField) => ({
        logFieldName: indexField,
        siemFieldName: undefined,
        status: 'unmapped',
      }));
    } else {
      items = unmappedIndexFields.map((indexField, idx) => {
        return {
          logFieldName: indexField,
          siemFieldName: aliasNames[idx],
          status: 'mapped',
        };
      });
    }

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
        field: 'siemFieldName',
        name: 'SIEM field name',
        sortable: true,
        dataType: 'string',
        width: '45%',
        render: (siemFieldName: string, entry: FieldMappingsTableItem) => {
          if (this.props.isMappingRequired) {
            return (
              <SIEMFieldNameSelector
                siemFieldNameOptions={Array.from(this.state.remainingUnmappedAlias)}
                onChange={this.onMappingSelected}
              />
            );
          }

          return (
            <EuiText>
              <span>{siemFieldName}</span>
            </EuiText>
          );
        },
      },
    ];

    if (this.props.isMappingRequired) {
      columns.push({
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
      });
    }

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
