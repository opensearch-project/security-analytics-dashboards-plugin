/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { EuiSpacer } from '@elastic/eui';
import FieldMappingsTable from '../../../CreateDetector/components/ConfigureFieldMapping/components/RequiredFieldMapping';
import { ContentPanel } from '../../../../components/ContentPanel';
import { Detector, FieldMapping } from '../../../../../models/interfaces';
import { EMPTY_FIELD_MAPPINGS } from '../../../CreateDetector/components/ConfigureFieldMapping/utils/constants';
import { FieldMappingPropertyMap } from '../../../../../server/models/interfaces';
import FieldMappingService from '../../../../services/FieldMappingService';
import { MappingViewType } from '../../../CreateDetector/components/ConfigureFieldMapping/components/RequiredFieldMapping/FieldMappingsTable';

export interface ruleFieldToIndexFieldMap {
  [fieldName: string]: string;
}

interface EditFieldMappingsProps extends RouteComponentProps {
  detector: Detector;
  filedMappingService: FieldMappingService;
  fieldMappings: FieldMapping[];
  loading: boolean;
  replaceFieldMappings: (mappings: FieldMapping[]) => void;
}

interface EditFieldMappingsState {
  loading: boolean;
  mappingsData: FieldMappingPropertyMap;
  createdMappings: ruleFieldToIndexFieldMap;
  invalidMappingFieldNames: string[];
}

export default class EditFieldMappings extends Component<
  EditFieldMappingsProps,
  EditFieldMappingsState
> {
  constructor(props: EditFieldMappingsProps) {
    super(props);
    const createdMappings: ruleFieldToIndexFieldMap = {};
    props.fieldMappings.forEach((mapping) => {
      createdMappings[mapping.ruleFieldName] = mapping.indexFieldName;
    });
    this.state = {
      loading: props.loading || false,
      mappingsData: EMPTY_FIELD_MAPPINGS,
      createdMappings,
      invalidMappingFieldNames: [],
    };
  }

  componentDidMount = async () => {
    this.getAllMappings();
  };

  getAllMappings = async () => {
    this.setState({ loading: true });
    const indexName = this.props.detector.inputs[0].detector_input.indices[0];
    const mappingsView = await this.props.filedMappingService.getMappings(indexName);
    if (mappingsView.ok) {
      const existingMappings = { ...this.state.createdMappings };
      const properties = mappingsView.response[indexName]?.mappings.properties;

      if (properties) {
        Object.keys(properties).forEach((ruleFieldName) => {
          existingMappings[ruleFieldName] = properties[ruleFieldName].path;
        });
        this.setState({ createdMappings: existingMappings, mappingsData: { properties } });
        this.updateMappingSharedState(existingMappings);
      }
    }
    this.setState({ loading: false });
  };

  /**
   * Returns the fieldName(s) that have duplicate alias assigned to them
   */
  getInvalidMappingFieldNames(mappings: ruleFieldToIndexFieldMap): string[] {
    const seenAliases = new Set();
    const invalidFields: string[] = [];

    Object.entries(mappings).forEach((entry) => {
      if (seenAliases.has(entry[1])) {
        invalidFields.push(entry[0]);
      }

      seenAliases.add(entry[1]);
    });

    return invalidFields;
  }

  onMappingCreation = (ruleFieldName: string, indxFieldName: string): void => {
    const newMappings: ruleFieldToIndexFieldMap = {
      ...this.state.createdMappings,
      [ruleFieldName]: indxFieldName,
    };
    const invalidMappingFieldNames = this.getInvalidMappingFieldNames(newMappings);
    this.setState({
      createdMappings: newMappings,
      invalidMappingFieldNames: invalidMappingFieldNames,
    });
    this.updateMappingSharedState(newMappings);
  };

  updateMappingSharedState = (createdMappings: ruleFieldToIndexFieldMap) => {
    this.props.replaceFieldMappings(
      Object.entries(createdMappings).map((entry) => {
        return {
          ruleFieldName: entry[0],
          indexFieldName: entry[1],
        };
      })
    );
  };

  render() {
    const { loading, mappingsData, createdMappings, invalidMappingFieldNames } = this.state;
    const existingMappings: ruleFieldToIndexFieldMap = {
      ...createdMappings,
    };
    const ruleFields: string[] = [];
    const indexFields: string[] = [];

    Object.keys(mappingsData.properties).forEach((ruleFieldName) => {
      existingMappings[ruleFieldName] = mappingsData.properties[ruleFieldName].path;
      ruleFields.unshift(ruleFieldName);
      indexFields.unshift(mappingsData.properties[ruleFieldName].path);
    });

    return (
      <div>
        {ruleFields.length > 0 && (
          <>
            <ContentPanel title={`Required field mappings (${ruleFields.length})`} titleSize={'m'}>
              <FieldMappingsTable<MappingViewType.Edit>
                {...this.props}
                loading={loading}
                ruleFields={ruleFields}
                indexFields={indexFields}
                mappingProps={{
                  type: MappingViewType.Edit,
                  existingMappings,
                  invalidMappingFieldNames,
                  onMappingCreation: this.onMappingCreation,
                }}
              />
            </ContentPanel>
            <EuiSpacer size={'m'} />
          </>
        )}
      </div>
    );
  }
}
