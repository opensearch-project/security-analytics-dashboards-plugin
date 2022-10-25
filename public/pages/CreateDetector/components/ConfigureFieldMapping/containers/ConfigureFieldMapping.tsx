/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { EuiAccordion, EuiHorizontalRule, EuiPanel, EuiSpacer, EuiTitle } from '@elastic/eui';
import FieldMappingsTable from '../components/RequiredFieldMapping';
import { createDetectorSteps } from '../../../utils/constants';
import { ContentPanel } from '../../../../../components/ContentPanel';
import { Detector, FieldMapping } from '../../../../../../models/interfaces';
import { EMPTY_FIELD_MAPPINGS } from '../utils/dummyData';
import { DetectorCreationStep } from '../../../models/types';
import { GetFieldMappingViewResponse } from '../../../../../../server/models/interfaces';
import FieldMappingService from '../../../../../services/FieldMappingService';
import { MappingViewType } from '../components/RequiredFieldMapping/FieldMappingsTable';

export interface IndexFieldToAliasMap {
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
  createdMappings: IndexFieldToAliasMap;
  invalidMappingFieldNames: string[];
}

export default class ConfigureFieldMapping extends Component<
  ConfigureFieldMappingProps,
  ConfigureFieldMappingState
> {
  constructor(props: ConfigureFieldMappingProps) {
    super(props);
    const createdMappings: IndexFieldToAliasMap = {};
    props.fieldMappings.forEach((mapping) => {
      createdMappings[mapping.fieldName] = mapping.aliasName;
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
      this.setState({ mappingsData: mappingsView.response });
    }
    this.setState({ loading: false });
  };

  validateMappings(mappings: IndexFieldToAliasMap): boolean {
    const allFieldsMapped = this.state.mappingsData.unmapped_index_fields.every(
      (fieldName) => !!mappings[fieldName]
    );
    //const mappedAliases = Object.values(mappings);
    //const allAliasesUnique = mappedAliases.length === new Set(mappedAliases).size;

    return true; //allFieldsMapped; // && allAliasesUnique;
  }

  /**
   * Returns the fieldName(s) that have duplicate alias assigned to them
   */
  getInvalidMappingFieldNames(mappings: IndexFieldToAliasMap): string[] {
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

  onMappingCreation = (fieldName: string, aliasName: string): void => {
    const newMappings: IndexFieldToAliasMap = {
      ...this.state.createdMappings,
      [fieldName]: aliasName,
    };
    const invalidMappingFieldNames = this.getInvalidMappingFieldNames(newMappings);
    this.setState({
      createdMappings: newMappings,
      invalidMappingFieldNames: invalidMappingFieldNames,
    });

    this.props.replaceFieldMappings(
      Object.entries(newMappings).map((entry) => {
        return {
          fieldName: entry[0],
          aliasName: entry[1],
        };
      })
    );
    const mappingsValid = this.validateMappings(newMappings);
    this.props.updateDataValidState(DetectorCreationStep.CONFIGURE_FIELD_MAPPING, mappingsValid);
  };

  render() {
    const { loading, mappingsData, createdMappings, invalidMappingFieldNames } = this.state;
    const viewonlyMappings: { indexFields: string[]; aliasNames: string[] } = {
      indexFields: [],
      aliasNames: [],
    };

    Object.keys(mappingsData.properties).forEach((aliasName) => {
      viewonlyMappings.aliasNames.push(aliasName);
      viewonlyMappings.indexFields.push(mappingsData.properties[aliasName].path);
    });

    return (
      <div>
        <EuiTitle size={'l'}>
          <h3>{createDetectorSteps[DetectorCreationStep.CONFIGURE_FIELD_MAPPING].title}</h3>
        </EuiTitle>

        <EuiSpacer size={'m'} />

        {mappingsData.unmapped_index_fields.length > 0 && (
          <>
            <ContentPanel
              title={`Required field mappings (${mappingsData.unmapped_index_fields.length})`}
              titleSize={'m'}
            >
              <FieldMappingsTable<MappingViewType.Edit>
                loading={loading}
                aliasNames={mappingsData.unmapped_field_aliases || []}
                indexFields={mappingsData.unmapped_index_fields || []}
                mappingProps={{
                  type: MappingViewType.Edit,
                  createdMappings,
                  invalidMappingFieldNames,
                  onMappingCreation: this.onMappingCreation,
                }}
                {...this.props}
              />
            </ContentPanel>
            <EuiSpacer size={'m'} />
          </>
        )}

        <EuiPanel style={{ paddingLeft: '0px', paddingRight: '0px' }}>
          <EuiAccordion
            buttonContent={
              <EuiTitle>
                <h4>{`View all field mappings (${
                  Object.keys(mappingsData.properties).length
                })`}</h4>
              </EuiTitle>
            }
            buttonProps={{ style: { paddingLeft: '10px', paddingRight: '10px' } }}
            id={'allFieldMappingsAccordion'}
            initialIsOpen={true}
            isLoading={loading}
          >
            <EuiHorizontalRule margin={'xs'} />
            <div style={{ paddingLeft: '10px', paddingRight: '10px' }}>
              <EuiSpacer size={'m'} />
              <FieldMappingsTable<MappingViewType.Readonly>
                loading={loading}
                mappingProps={{
                  type: MappingViewType.Readonly,
                }}
                aliasNames={viewonlyMappings.aliasNames}
                indexFields={viewonlyMappings.indexFields}
                {...this.props}
              />
            </div>
          </EuiAccordion>
        </EuiPanel>
      </div>
    );
  }
}
