/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { EuiAccordion, EuiHorizontalRule, EuiPanel, EuiSpacer, EuiTitle } from '@elastic/eui';
import FieldMappingsTable from '../components/RequiredFieldMapping';
import { CREATE_DETECTOR_STEPS } from '../../../utils/constants';
import { ContentPanel } from '../../../../../components/ContentPanel';
import { Detector } from '../../../../../../models/interfaces';
import { EMPTY_FIELD_MAPPINGS, EXAMPLE_FIELD_MAPPINGS_RESPONSE } from '../utils/dummyData';
import { FieldMappingViewResponse } from '../../../types/interfaces';

interface ConfigureFieldMappingProps extends RouteComponentProps {
  isEdit: boolean;
  detector: Detector;
  onDetectorChange: (detector: Detector) => void;
}

interface ConfigureFieldMappingState {
  loading: boolean;
  mappingsData: FieldMappingViewResponse;
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
    };
  }

  componentDidMount = async () => {
    this.getAllMappings();
  };

  getAllMappings = async () => {
    this.setState({ loading: true });
    await this.setState({ mappingsData: EXAMPLE_FIELD_MAPPINGS_RESPONSE });
    this.setState({ loading: false });
  };

  render() {
    const { loading, mappingsData } = this.state;
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
          <h3>{CREATE_DETECTOR_STEPS.CONFIGURE_FIELD_MAPPING.title}</h3>
        </EuiTitle>

        <EuiSpacer size={'m'} />

        <ContentPanel
          title={`Required field mappings (${mappingsData.unmappedIndexFields.length})`}
          titleSize={'m'}
        >
          <FieldMappingsTable
            loading={loading}
            aliasNames={mappingsData.unmappedFieldAliases}
            indexFields={mappingsData.unmappedIndexFields}
            isMappingRequired={true}
            {...this.props}
          />
        </ContentPanel>

        <EuiSpacer size={'m'} />

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
              <FieldMappingsTable
                loading={loading}
                aliasNames={viewonlyMappings.aliasNames}
                indexFields={viewonlyMappings.indexFields}
                isMappingRequired={false}
                {...this.props}
              />
            </div>
          </EuiAccordion>
        </EuiPanel>
      </div>
    );
  }
}
