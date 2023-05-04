/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import {
  EuiAccordion,
  EuiHorizontalRule,
  EuiPanel,
  EuiSpacer,
  EuiTitle,
  EuiCallOut,
} from '@elastic/eui';
import FieldMappingsTable from '../../../CreateDetector/components/ConfigureFieldMapping/components/RequiredFieldMapping';
import { ContentPanel } from '../../../../components/ContentPanel';
import { FieldMapping } from '../../../../../models/interfaces';
import FieldMappingService from '../../../../services/FieldMappingService';
import { MappingViewType } from '../../../CreateDetector/components/ConfigureFieldMapping/components/RequiredFieldMapping/FieldMappingsTable';
import { Detector } from '../../../../../types';
import _ from 'lodash';

export interface ruleFieldToIndexFieldMap {
  [fieldName: string]: string;
}

interface EditFieldMappingsProps extends RouteComponentProps {
  detector: Detector;
  fieldMappingService?: FieldMappingService;
  fieldMappings: FieldMapping[];
  loading: boolean;
  replaceFieldMappings: (mappings: FieldMapping[]) => void;
  initialIsOpen?: boolean;
  ruleQueryFields?: Set<string>;
}

interface EditFieldMappingsState {
  loading: boolean;
  createdMappings: ruleFieldToIndexFieldMap;
  invalidMappingFieldNames: string[];
  mappedRuleFields: string[];
  unmappedRuleFields: string[];
  logFieldOptions: string[];
  ruleQueryFields?: Set<string>;
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
      ruleQueryFields: props.ruleQueryFields ? props.ruleQueryFields : new Set<string>(),
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

  public componentDidUpdate(
    prevProps: Readonly<EditFieldMappingsProps>,
    prevState: Readonly<EditFieldMappingsState>,
    snapshot?: any
  ): void {
    const indexVariablePath = 'detector.inputs[0].detector_input.indices[0]';
    const currentIndex: string = _.get(this.props, indexVariablePath);
    const previousIndex: string = _.get(prevProps, indexVariablePath);

    // if index is changed reload mappings
    if (!!currentIndex && currentIndex !== previousIndex) {
      this.getAllMappings();
    }

    // if rule selection is changed reload mappings
    if (prevProps.ruleQueryFields !== this.props.ruleQueryFields) {
      this.setState(
        {
          // update ruleQueryField, this is used to filter field mappings based on rule selection
          ruleQueryFields: this.props.ruleQueryFields,
        },
        () => this.getAllMappings()
      );
    }
  }

  getAllMappings = async () => {
    this.setState({ loading: true });
    const indexName = this.props.detector.inputs[0].detector_input.indices[0];
    if (indexName) {
      const mappingsViewRes = await this.props.fieldMappingService?.getMappingsView(
        indexName,
        this.props.detector.detector_type.toLowerCase()
      );

      if (mappingsViewRes?.ok) {
        let unmappedRuleFields = mappingsViewRes.response.unmapped_field_aliases || [];
        const logFieldsSet = new Set<string>(mappingsViewRes.response.unmapped_index_fields);
        Object.values(mappingsViewRes.response.properties).forEach((val) => {
          logFieldsSet.add(val.path);
        });
        const logFieldOptions = Array.from(logFieldsSet);
        const existingMappings = { ...this.state.createdMappings };

        const mappingsRes = await this.props.fieldMappingService?.getMappings(indexName);
        if (mappingsRes?.ok) {
          const mappedFieldsInfo = mappingsRes.response[indexName].mappings.properties;
          let mappedRuleFields = Object.keys(mappedFieldsInfo);
          unmappedRuleFields = unmappedRuleFields.filter((ruleField) => {
            return !mappedRuleFields.includes(ruleField);
          });

          mappedRuleFields.forEach((ruleField) => {
            existingMappings[ruleField] = mappedFieldsInfo[ruleField].path;
          });

          for (let key in existingMappings) {
            if (logFieldOptions.indexOf(existingMappings[key]) === -1) {
              delete existingMappings[key];
            }
          }

          if (this.state.ruleQueryFields?.size) {
            mappedRuleFields = _.intersection(mappedRuleFields, [...this.state.ruleQueryFields]);
            unmappedRuleFields = _.intersection(unmappedRuleFields, [
              ...this.state.ruleQueryFields,
            ]);
          }

          this.setState({
            mappedRuleFields,
            unmappedRuleFields,
            logFieldOptions,
            createdMappings: existingMappings,
          });
        } else {
          if (this.state.ruleQueryFields?.size) {
            unmappedRuleFields = _.intersection(unmappedRuleFields, [
              ...this.state.ruleQueryFields,
            ]);
          }

          this.setState({
            mappedRuleFields: [],
            unmappedRuleFields,
            logFieldOptions,
            createdMappings: existingMappings,
          });
        }
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
    const { initialIsOpen } = this.props;
    const existingMappings: ruleFieldToIndexFieldMap = {
      ...createdMappings,
    };

    return (
      <div className={'editFieldMappings'}>
        <EuiPanel>
          <EuiAccordion
            buttonContent={
              <div data-test-subj="mapped-fields-btn">
                <EuiTitle>
                  <h4>{`Automatically mapped fields (${mappedRuleFields.length})`}</h4>
                </EuiTitle>
              </div>
            }
            buttonProps={{ style: { paddingLeft: '10px', paddingRight: '10px' } }}
            id={'mappedFieldsAccordion'}
            initialIsOpen={
              initialIsOpen !== undefined ? initialIsOpen : unmappedRuleFields.length === 0
            }
          >
            <EuiHorizontalRule margin={'xs'} />
            <div data-test-subj="auto-mapped-fields-table">
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
            </div>
          </EuiAccordion>
        </EuiPanel>

        <EuiSpacer size={'m'} />

        {unmappedRuleFields.length > 0 ? (
          <>
            <EuiCallOut
              title={`${unmappedRuleFields.length} rule fields may need manual mapping`}
              color={'warning'}
            >
              <p>
                To generate accurate findings, we recommend mapping the following security rules
                fields with the log fields in your data source.
              </p>
            </EuiCallOut>

            <EuiSpacer size={'m'} />
            <ContentPanel title={`Pending field mappings`} titleSize={'m'}>
              <div data-test-subj="pending-mapped-fields-table">
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
              </div>
            </ContentPanel>
          </>
        ) : (
          <EuiCallOut
            title={`We have automatically mapped ${mappedRuleFields.length} field(s)`}
            color={'success'}
          >
            <p>
              Your data sources have been mapped with every rule field name. No action is needed.
            </p>
          </EuiCallOut>
        )}

        <EuiSpacer size={'m'} />
      </div>
    );
  }
}
