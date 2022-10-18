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

interface ConfigureFieldMappingProps extends RouteComponentProps {
  isEdit: boolean;
  detector: Detector;
  replaceFieldMappings: (mappings: FieldMapping[]) => void;
  filedMappingService: FieldMappingService;
}

interface ConfigureFieldMappingState {
  loading: boolean;
  mappingsData: GetFieldMappingViewResponse;
  createdMappings: { [fieldName: string]: string };
}

export default class ConfigureFieldMapping extends Component<
  ConfigureFieldMappingProps,
  ConfigureFieldMappingState
> {
  constructor(props: ConfigureFieldMappingProps) {
    super(props);
    this.state = {
      loading: false,
      mappingsData: EMPTY_FIELD_MAPPINGS,
      createdMappings: {},
    };
  }

  componentDidMount = async () => {
    this.getAllMappings();
  };

  getAllMappings = async () => {
    this.setState({ loading: true });
    const mappingsView = await this.props.filedMappingService.getMappingsView(
      this.props.detector.inputs[0].input.indices[0],
      this.props.detector.detector_type
    );
    if (mappingsView.ok) {
      this.setState({ mappingsData: mappingsView.response });
    }
    this.setState({ loading: false });
  };

  onMappingCreation = (fieldName: string, aliasName: string): void => {
    const newMappings = {
      ...this.state.createdMappings,
      [fieldName]: aliasName,
    };
    this.setState({
      createdMappings: newMappings,
    });
    this.props.replaceFieldMappings(
      Object.entries(newMappings).map((entry) => {
        return {
          fieldName: entry[0],
          aliasName: entry[1],
        };
      })
    );
  };

  render() {
    const { loading, mappingsData, createdMappings } = this.state;
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

        {mappingsData.unmappedIndexFields.length > 0 && (
          <>
            <ContentPanel
              title={`Required field mappings (${mappingsData.unmappedIndexFields.length})`}
              titleSize={'m'}
            >
              <FieldMappingsTable<MappingViewType.Edit>
                loading={loading}
                aliasNames={mappingsData.unmappedFieldAliases}
                indexFields={mappingsData.unmappedIndexFields}
                mappingProps={{
                  type: MappingViewType.Edit,
                  createdMappings: createdMappings,
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

  static validateData(detector: Detector): boolean {
    return true;
  }
}
