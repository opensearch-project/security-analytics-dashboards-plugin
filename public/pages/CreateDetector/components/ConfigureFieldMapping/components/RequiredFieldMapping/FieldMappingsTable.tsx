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
import { FieldMappingsTableItem } from '../../../../models/interfaces';
import { IndexFieldToAliasMap } from '../../containers/ConfigureFieldMapping';

export enum MappingViewType {
  Readonly,
  Edit,
}

export interface MappingProps {
  [MappingViewType.Readonly]: {
    type: MappingViewType.Readonly;
  };
  [MappingViewType.Edit]: {
    type: MappingViewType.Edit;
    createdMappings: IndexFieldToAliasMap;
    invalidMappingFieldNames: string[];
    onMappingCreation: (fieldName: string, aliasName: string) => void;
  };
}

interface FieldMappingsTableProps<T extends MappingViewType> extends RouteComponentProps {
  loading: boolean;
  indexFields: string[];
  aliasNames: string[];
  mappingProps: MappingProps[T];
}

interface FieldMappingsTableState {}

export default class FieldMappingsTable<T extends MappingViewType> extends Component<
  FieldMappingsTableProps<T>,
  FieldMappingsTableState
> {
  render() {
    const { loading, indexFields, aliasNames } = this.props;
    let items: FieldMappingsTableItem[];

    if (this.props.mappingProps.type === MappingViewType.Edit) {
      items = indexFields.map((indexField) => ({
        logFieldName: indexField,
        siemFieldName: undefined,
      }));
    } else {
      items = indexFields.map((indexField, idx) => {
        return {
          logFieldName: indexField,
          siemFieldName: aliasNames[idx],
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
          if (this.props.mappingProps.type === MappingViewType.Edit) {
            const { onMappingCreation, invalidMappingFieldNames } = this.props
              .mappingProps as MappingProps[MappingViewType.Edit];
            const onMappingSelected = (selectedAlias: string) => {
              onMappingCreation(entry.logFieldName, selectedAlias);
            };
            return (
              <SIEMFieldNameSelector
                siemFieldNameOptions={aliasNames}
                isInvalid={invalidMappingFieldNames.includes(entry.logFieldName)}
                onChange={onMappingSelected}
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

    if (this.props.mappingProps.type === MappingViewType.Edit) {
      columns.push({
        field: 'status',
        name: 'Status',
        sortable: true,
        dataType: 'string',
        align: 'center',
        width: '15%',
        render: (_status: 'mapped' | 'unmapped', entry: FieldMappingsTableItem) => {
          const { createdMappings, invalidMappingFieldNames } = this.props
            .mappingProps as MappingProps[MappingViewType.Edit];
          let iconProps = STATUS_ICON_PROPS['unmapped'];
          if (
            createdMappings[entry.logFieldName] &&
            !invalidMappingFieldNames.includes(entry.logFieldName)
          ) {
            iconProps = STATUS_ICON_PROPS['mapped'];
          }

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
