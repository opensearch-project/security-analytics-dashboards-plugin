/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { EuiAccordion, EuiHorizontalRule, EuiPanel, EuiSpacer, EuiTitle } from '@elastic/eui';
import FieldMappingsTable from '../../../CreateDetector/components/ConfigureFieldMapping/components/RequiredFieldMapping';
import { ContentPanel } from '../../../../components/ContentPanel';
import { Detector, FieldMapping } from '../../../../../models/interfaces';
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
  createdMappings: ruleFieldToIndexFieldMap;
  invalidMappingFieldNames: string[];
  mappedRuleFields: string[];
  unmappedRuleFields: string[];
  logFieldOptions: string[];
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
      createdMappings,
      invalidMappingFieldNames: [],
      mappedRuleFields: [],
      unmappedRuleFields: [],
      logFieldOptions: [],
    };
  }

  componentDidMount = async () => {
    this.getAllMappings();
  };

  getAllMappings = async () => {
    this.setState({ loading: true });
    const indexName = this.props.detector.inputs[0].detector_input.indices[0];

    const mappingsViewRes = await this.props.filedMappingService.getMappingsView(
      indexName,
      this.props.detector.detector_type.toLowerCase()
    );

    if (mappingsViewRes.ok) {
      const mappingsRes = await this.props.filedMappingService.getMappings(indexName);
      if (mappingsRes.ok) {
        const mappedFieldsInfo = mappingsRes.response[indexName].mappings.properties;
        const mappedRuleFields = Object.keys(mappedFieldsInfo);
        const unmappedRuleFields = (mappingsViewRes.response.unmapped_field_aliases || []).filter(
          (ruleField) => {
            return !mappedRuleFields.includes(ruleField);
          }
        );

        const logFieldsSet = new Set<string>(mappingsViewRes.response.unmapped_index_fields);
        Object.values(mappingsViewRes.response.properties).forEach((val) => {
          logFieldsSet.add(val.path);
        });
        const logFieldOptions = Array.from(logFieldsSet);
        const existingMappings = { ...this.state.createdMappings };
        mappedRuleFields.forEach((ruleField) => {
          existingMappings[ruleField] = mappedFieldsInfo[ruleField].path;
        });

        this.setState({
          mappedRuleFields,
          unmappedRuleFields,
          logFieldOptions,
          createdMappings: existingMappings,
        });
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

  onMappingCreation = (ruleFieldName: string, indexFieldName: string): void => {
    const newMappings: ruleFieldToIndexFieldMap = {
      ...this.state.createdMappings,
      [ruleFieldName]: indexFieldName,
    };
    if (!indexFieldName) {
      delete newMappings[ruleFieldName];
    }
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
    const {
      loading,
      createdMappings,
      invalidMappingFieldNames,
      mappedRuleFields,
      unmappedRuleFields,
      logFieldOptions,
    } = this.state;
    const existingMappings: ruleFieldToIndexFieldMap = {
      ...createdMappings,
    };

    return (
      <div>
        {unmappedRuleFields.length > 0 && (
          <>
            <ContentPanel
              title={`Required field mappings (${unmappedRuleFields.length})`}
              titleSize={'m'}
            >
              <FieldMappingsTable<MappingViewType.Edit>
                {...this.props}
                loading={loading}
                ruleFields={unmappedRuleFields}
                indexFields={logFieldOptions}
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
        <EuiPanel>
          <EuiAccordion
            buttonContent={
              <div data-test-subj="mapped-fields-btn">
                <EuiTitle>
                  <h4>{`Mapped fields (${mappedRuleFields.length})`}</h4>
                </EuiTitle>
              </div>
            }
            buttonProps={{ style: { paddingLeft: '10px', paddingRight: '10px' } }}
            id={'mappedFieldsAccordion'}
            initialIsOpen={unmappedRuleFields.length === 0}
          >
            <EuiHorizontalRule margin={'xs'} />
            <FieldMappingsTable<MappingViewType.Edit>
              {...this.props}
              loading={loading}
              ruleFields={mappedRuleFields}
              indexFields={logFieldOptions}
              mappingProps={{
                type: MappingViewType.Edit,
                existingMappings,
                invalidMappingFieldNames,
                onMappingCreation: this.onMappingCreation,
              }}
            />
          </EuiAccordion>
        </EuiPanel>
        <EuiSpacer size={'m'} />
      </div>
    );
  }
}
