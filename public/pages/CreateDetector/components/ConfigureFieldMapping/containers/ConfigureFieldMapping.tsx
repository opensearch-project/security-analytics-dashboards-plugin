/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import {
  EuiSpacer,
  EuiTitle,
  EuiText,
  EuiCallOut,
  EuiAccordion,
  EuiHorizontalRule,
  EuiPanel,
} from '@elastic/eui';
import FieldMappingsTable from '../components/RequiredFieldMapping';
import { createDetectorSteps } from '../../../utils/constants';
import { ContentPanel } from '../../../../../components/ContentPanel';
import { Detector, FieldMapping } from '../../../../../../models/interfaces';
import { EMPTY_FIELD_MAPPINGS_VIEW } from '../utils/constants';
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
  loading: boolean;
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
      loading: props.loading || false,
      mappingsData: EMPTY_FIELD_MAPPINGS_VIEW,
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
      this.props.detector.detector_type.toLowerCase()
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
    this.props.updateDataValidState(DetectorCreationStep.CONFIGURE_FIELD_MAPPING, true);
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

    // read only data
    const mappedRuleFields: string[] = [];
    const mappedLogFields: string[] = [];
    Object.keys(mappingsData.properties).forEach((ruleFieldName) => {
      mappedRuleFields.unshift(ruleFieldName);
      mappedLogFields.unshift(mappingsData.properties[ruleFieldName].path);
    });

    // edit data
    const ruleFields = [...(mappingsData.unmapped_field_aliases || [])];
    const indexFields = [...(mappingsData.unmapped_index_fields || [])];

    return (
      <div>
        <EuiTitle size={'m'}>
          <h3>{createDetectorSteps[DetectorCreationStep.CONFIGURE_FIELD_MAPPING].title}</h3>
        </EuiTitle>

        <EuiText size="s" color="subdued">
          To perform threat detection, known field names from your log data source are automatically
          mapped to rule field names. Additional fields that may require manual mapping will be
          shown below.
        </EuiText>

        <EuiSpacer size={'m'} />

        {ruleFields.length > 0 ? (
          <>
            <EuiCallOut
              title={`${ruleFields.length} rule fields may need manual mapping`}
              color={'warning'}
            >
              <p>
                To generate accurate findings, we recommend mapping the following security rules
                fields with the log field from your data source.
              </p>
            </EuiCallOut>
            <EuiSpacer size={'m'} />
            <ContentPanel title={`Manual field mappings (${ruleFields.length})`} titleSize={'m'}>
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
        ) : (
          <>
            <EuiCallOut title={'We have automatically mapped all fields'} color={'success'}>
              <p>
                Your data source(s) have been mapped with all security rule fields. No action is
                needed.
              </p>
            </EuiCallOut>
            <EuiSpacer size={'m'} />
          </>
        )}

        <EuiPanel>
          <EuiAccordion
            buttonContent={
              <div data-test-subj="mapped-fields-btn">
                <EuiTitle>
                  <h4>{`View mapped fields (${mappedRuleFields.length})`}</h4>
                </EuiTitle>
              </div>
            }
            buttonProps={{ style: { paddingLeft: '10px', paddingRight: '10px' } }}
            id={'mappedFieldsAccordion'}
            initialIsOpen={false}
          >
            <EuiHorizontalRule margin={'xs'} />
            <FieldMappingsTable<MappingViewType.Readonly>
              {...this.props}
              loading={loading}
              ruleFields={mappedRuleFields}
              indexFields={mappedLogFields}
              mappingProps={{
                type: MappingViewType.Readonly,
              }}
            />
          </EuiAccordion>
        </EuiPanel>
        <EuiSpacer size={'m'} />
      </div>
    );
  }
}
