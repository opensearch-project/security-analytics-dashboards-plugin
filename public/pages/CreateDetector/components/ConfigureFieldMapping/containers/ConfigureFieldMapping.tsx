/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { EuiSpacer, EuiTitle } from '@elastic/eui';
import FieldMappingsTable from '../components/RequiredFieldMapping';
import { createDetectorSteps } from '../../../utils/constants';
import { ContentPanel } from '../../../../../components/ContentPanel';
import { Detector, FieldMapping } from '../../../../../../models/interfaces';
import { EMPTY_FIELD_MAPPINGS } from '../utils/constants';
import { DetectorCreationStep } from '../../../models/types';
import { GetFieldMappingViewResponse } from '../../../../../../server/models/interfaces';
import FieldMappingService from '../../../../../services/FieldMappingService';
import { MappingViewType } from '../components/RequiredFieldMapping/FieldMappingsTable';

export interface ruleFieldToIndexFieldMap {
  [fieldName: string]: string;
}

interface ConfigureFieldMappingProps extends RouteComponentProps {
  isEdit: boolean;
  detector: Detector;
  filedMappingService: FieldMappingService;
  replaceFieldMappings: (mappings: FieldMapping[]) => void;
  fieldMappings: FieldMapping[];
  updateDataValidState: (step: DetectorCreationStep, isValid: boolean) => void;
}

interface ConfigureFieldMappingState {
  loading: boolean;
  mappingsData: GetFieldMappingViewResponse;
  createdMappings: ruleFieldToIndexFieldMap;
  invalidMappingFieldNames: string[];
}

export default class ConfigureFieldMapping extends Component<
  ConfigureFieldMappingProps,
  ConfigureFieldMappingState
> {
  constructor(props: ConfigureFieldMappingProps) {
    super(props);
    const createdMappings: ruleFieldToIndexFieldMap = {};
    props.fieldMappings.forEach((mapping) => {
      createdMappings[mapping.ruleFieldName] = mapping.indexFieldName;
    });
    this.state = {
      loading: false,
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
    const mappingsView = await this.props.filedMappingService.getMappingsView(
      this.props.detector.inputs[0].detector_input.indices[0],
      this.props.detector.detector_type
    );
    if (mappingsView.ok) {
      const existingMappings = { ...this.state.createdMappings };
      Object.keys(mappingsView.response.properties).forEach((ruleFieldName) => {
        existingMappings[ruleFieldName] = mappingsView.response.properties[ruleFieldName].path;
      });
      this.setState({ createdMappings: existingMappings, mappingsData: mappingsView.response });
      this.updateMappingSharedState(existingMappings);
    }
    this.setState({ loading: false });
  };

  validateMappings(mappings: ruleFieldToIndexFieldMap): boolean {
    // TODO: Implement validation
    return true; //allFieldsMapped; // && allAliasesUnique;
  }

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

    return []; //invalidFields;
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
    const mappingsValid = this.validateMappings(newMappings);
    this.props.updateDataValidState(DetectorCreationStep.CONFIGURE_FIELD_MAPPING, mappingsValid);
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
    const { isEdit } = this.props;
    const { loading, mappingsData, createdMappings, invalidMappingFieldNames } = this.state;
    const existingMappings: ruleFieldToIndexFieldMap = {
      ...createdMappings,
    };
    const ruleFields = [...(mappingsData.unmapped_field_aliases || [])];
    const indexFields = [...(mappingsData.unmapped_index_fields || [])];

    Object.keys(mappingsData.properties).forEach((ruleFieldName) => {
      existingMappings[ruleFieldName] = mappingsData.properties[ruleFieldName].path;
      ruleFields.unshift(ruleFieldName);
      indexFields.unshift(mappingsData.properties[ruleFieldName].path);
    });

    return (
      <div>
        {!isEdit && (
          <div>
            <EuiTitle size={'l'}>
              <h3>{createDetectorSteps[DetectorCreationStep.CONFIGURE_FIELD_MAPPING].title}</h3>
            </EuiTitle>
            <EuiSpacer size={'m'} />
          </div>
        )}

        {ruleFields.length > 0 && (
          <>
            <ContentPanel title={`Required field mappings (${ruleFields.length})`} titleSize={'m'}>
              <FieldMappingsTable<MappingViewType.Edit>
                loading={loading}
                ruleFields={ruleFields}
                indexFields={indexFields}
                mappingProps={{
                  type: MappingViewType.Edit,
                  existingMappings,
                  invalidMappingFieldNames,
                  onMappingCreation: this.onMappingCreation,
                }}
                {...this.props}
              />
            </ContentPanel>
            <EuiSpacer size={'m'} />
          </>
        )}
      </div>
    );
  }
}
