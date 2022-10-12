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

interface ConfigureFieldMappingProps extends RouteComponentProps {
  isEdit: boolean;
  detector: Detector;
}

interface ConfigureFieldMappingState {
  loading: boolean;
  allMappings: object[];
  requiredMappings: object[];
}

export default class ConfigureFieldMapping extends Component<
  ConfigureFieldMappingProps,
  ConfigureFieldMappingState
> {
  constructor(props: ConfigureFieldMappingProps) {
    super(props);
    const { isEdit } = props;
    this.state = {
      loading: false,
      allMappings: [],
      requiredMappings: [],
    };
  }

  componentDidMount = async () => {
    this.getAllMappings();
  };

  getAllMappings = async () => {
    this.setState({ loading: true });

    await this.setState({ allMappings: EXAMPLE_FIELD_MAPPINGS });
    this.getRequiredMappings();

    this.setState({ loading: false });
  };

  getRequiredMappings = () => {
    const { allMappings } = this.state;
    // TODO: Method for determining a "required" mapping is likely incorrect
    const requiredMappings = allMappings.filter((mapping) => mapping.required);
    this.setState({ requiredMappings: requiredMappings });
  };

  render() {
    const { isEdit } = this.props;
    const { loading, allMappings, requiredMappings } = this.state;
    return (
      <div>
        <EuiTitle size={'l'}>
          <h3>{CREATE_DETECTOR_STEPS.CONFIGURE_FIELD_MAPPING.title}</h3>
        </EuiTitle>

        <EuiSpacer size={'m'} />

        <ContentPanel
          title={`Required field mappings (${requiredMappings.length})`}
          titleSize={'m'}
        >
          <FieldMappingsTable loading={loading} mappings={requiredMappings} />
        </ContentPanel>

        <EuiSpacer size={'m'} />

        <EuiPanel style={{ paddingLeft: '0px', paddingRight: '0px' }}>
          <EuiAccordion
            buttonContent={
              <EuiTitle>
                <h4>{`View all field mappings (${allMappings.length})`}</h4>
              </EuiTitle>
            }
            buttonProps={{ style: { paddingLeft: '10px', paddingRight: '10px' } }}
            id={'allFieldMappingsAccordion'}
            initialIsOpen={!isEdit}
            isLoading={loading}
          >
            <EuiHorizontalRule margin={'xs'} />
            <div style={{ paddingLeft: '10px', paddingRight: '10px' }}>
              <EuiSpacer size={'m'} />
              <FieldMappingsTable loading={loading} mappings={allMappings} />
            </div>
          </EuiAccordion>
        </EuiPanel>
      </div>
    );
  }
}

// TODO: Need clarify on what this data model will look like.
export const EXAMPLE_FIELD_MAPPINGS = [
  {
    log_field_name: 'field-1',
    siem_field: '',
    status: 'alert',
  },
  {
    required: true,
    log_field_name: 'required-Field-2',
    siem_field: 'SIEM-2',
    status: 'alert',
  },
  {
    required: true,
    log_field_name: 'required-Field-3',
    siem_field: '',
    status: 'alert',
  },
  {
    required: true,
    log_field_name: 'required-Field-4',
    siem_field: '',
    status: 'alert',
  },
  {
    required: true,
    log_field_name: 'required-Field-5',
    siem_field: 'SIEM-5',
    status: 'ok',
  },
  {
    required: true,
    log_field_name: 'required-Field-6',
    siem_field: '',
    status: 'alert',
  },
  {
    required: true,
    log_field_name: 'required-Field-7',
    siem_field: '',
    status: 'alert',
  },
  {
    required: true,
    log_field_name: 'required-Field-8',
    siem_field: 'SIEM-8',
    status: 'alert',
  },
  {
    required: true,
    log_field_name: 'required-Field-9',
    siem_field: '',
    status: 'alert',
  },
  {
    log_field_name: 'field-10',
    siem_field: '',
    status: 'alert',
  },
  {
    log_field_name: 'field-11',
    siem_field: 'SIEM-11',
    status: 'ok',
  },
  {
    log_field_name: 'field-12',
    siem_field: 'SIEM-12',
    status: 'ok',
  },
  {
    log_field_name: 'field-13',
    siem_field: '',
    status: 'alert',
  },
  {
    log_field_name: 'field-14',
    siem_field: '',
    status: 'alert',
  },
  {
    log_field_name: 'field-15',
    siem_field: '',
    status: 'alert',
  },
];
