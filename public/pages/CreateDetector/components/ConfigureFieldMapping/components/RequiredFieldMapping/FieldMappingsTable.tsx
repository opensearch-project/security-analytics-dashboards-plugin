/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import {
  CriteriaWithPagination,
  EuiBasicTableColumn,
  EuiEmptyPrompt,
  EuiIcon,
  EuiInMemoryTable,
  EuiText,
  EuiToolTip,
} from '@elastic/eui';
import { DEFAULT_EMPTY_DATA } from '../../../../../../utils/constants';
import { STATUS_ICON_PROPS } from '../../utils/constants';
import FieldNameSelector from './FieldNameSelector';
import { FieldMappingsTableItem } from '../../../../models/interfaces';
import { ruleFieldToIndexFieldMap } from '../../containers/ConfigureFieldMapping';

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
    existingMappings: ruleFieldToIndexFieldMap;
    onMappingCreation: (fieldName: string, aliasName: string) => void;
  };
}

interface FieldMappingsTableProps<T extends MappingViewType> extends RouteComponentProps {
  loading: boolean;
  indexFields: string[];
  ruleFields: string[];
  mappingProps: MappingProps[T];
}

interface FieldMappingsTableState {
  pageIndex: number;
}

export default class FieldMappingsTable<T extends MappingViewType> extends Component<
  FieldMappingsTableProps<T>,
  FieldMappingsTableState
> {
  constructor(props: FieldMappingsTableProps<T>) {
    super(props);
    this.state = {
      pageIndex: 0,
    };
  }

  private onTableChange = (nextValues: CriteriaWithPagination<FieldMappingsTableItem>) => {
    this.setState({
      pageIndex: nextValues.page.index,
    });
  };

  render() {
    const { loading, indexFields, ruleFields } = this.props;
    let items: FieldMappingsTableItem[];

    if (this.props.mappingProps.type === MappingViewType.Edit) {
      items = ruleFields.map((ruleField) => ({
        ruleFieldName: ruleField,
        logFieldName: undefined,
      }));
    } else {
      items = ruleFields.map((ruleField, idx) => {
        return {
          logFieldName: indexFields[idx],
          ruleFieldName: ruleField,
        };
      });
    }

    const columns: EuiBasicTableColumn<FieldMappingsTableItem>[] = [
      {
        field: 'ruleFieldName',
        name: 'Rule field', // Wazuh: rename 'Detection rule' to 'Rule'
        dataType: 'string',
        width: '25%',
        render: (ruleFieldName: string) => ruleFieldName || DEFAULT_EMPTY_DATA,
      },
      {
        field: 'logFieldName',
        name: 'Data source field',
        dataType: 'string',
        width: '45%',
        render: (logFieldName: string, entry: FieldMappingsTableItem) => {
          if (this.props.mappingProps.type === MappingViewType.Edit) {
            const { onMappingCreation, existingMappings } = this.props
              .mappingProps as MappingProps[MappingViewType.Edit];
            const onMappingSelected = (selectedField: string) => {
              onMappingCreation(entry.ruleFieldName, selectedField);
            };
            return (
              <FieldNameSelector
                fieldNameOptions={indexFields}
                selectedField={existingMappings[entry.ruleFieldName]}
                onChange={onMappingSelected}
              />
            );
          }

          return (
            <EuiText>
              <span>{logFieldName}</span>
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
          const { existingMappings: createdMappings } = this.props
            .mappingProps as MappingProps[MappingViewType.Edit];
          let iconProps = STATUS_ICON_PROPS['unmapped'];
          let iconTooltip = 'This field needs to be mapped with a field from your log source.';
          if (createdMappings[entry.ruleFieldName]) {
            iconProps = STATUS_ICON_PROPS['mapped'];
            iconTooltip = 'This field has been mapped.';
          }

          return (
            (
              <EuiToolTip position="top" content={iconTooltip}>
                <EuiIcon {...iconProps} />
              </EuiToolTip>
            ) || DEFAULT_EMPTY_DATA
          );
        },
      });
    }

    const sorting: { sort: { field: string; direction: 'asc' | 'desc' } } = {
      sort: {
        field: 'ruleFieldName',
        direction: 'asc',
      },
    };

    return (
      <EuiInMemoryTable
        loading={loading}
        items={items}
        columns={columns}
        pagination={{
          pageIndex: this.state.pageIndex,
        }}
        sorting={sorting}
        isSelectable={false}
        onTableChange={this.onTableChange}
        message={
          <EuiEmptyPrompt
            style={{ maxWidth: '45em' }}
            body={
              <EuiText size="s">
                <p>There are no field mappings.</p>
              </EuiText>
            }
          />
        }
      />
    );
  }
}
