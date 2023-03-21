/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
import { EuiTitle, EuiText } from '@elastic/eui';
import { FieldMapping } from '../../../../../models/interfaces';
import EditFieldMappings from '../../containers/FieldMappings/EditFieldMapping';
import { CoreServicesContext } from '../../../../components/core_services';
import { ContentPanel } from '../../../../components/ContentPanel';
import { FieldMappingService } from '../../../../services';
import { NotificationsStart } from 'opensearch-dashboards/public';
import { Detector } from '../../../../../types';

export interface UpdateFieldMappingsProps {
  detector: Detector;
  fieldMappingService?: FieldMappingService;
  notifications: NotificationsStart;
  onFieldMappingChange: (fieldMappings: FieldMapping[]) => void;
  ruleQueryFields: Set<string>;
}

export interface UpdateFieldMappingsState {
  fieldMappings: FieldMapping[];
  loading: boolean;
  ruleQueryFields: string[];
}

export default class NewFieldMappings extends Component<
  UpdateFieldMappingsProps,
  UpdateFieldMappingsState
> {
  static contextType = CoreServicesContext;

  constructor(props: UpdateFieldMappingsProps) {
    super(props);

    this.state = {
      ruleQueryFields: [],
      fieldMappings: [],
      loading: false,
    };
  }

  public componentDidUpdate(
    prevProps: Readonly<UpdateFieldMappingsProps>,
    prevState: Readonly<UpdateFieldMappingsState>,
    snapshot?: any
  ): void {
    if (prevProps.ruleQueryFields !== this.props.ruleQueryFields) {
      this.setState({
        ruleQueryFields: this.props.ruleQueryFields,
      });
    }
  }

  replaceFieldMappings = (fieldMappings: FieldMapping[]): void => {
    this.setState({ fieldMappings }, () => this.props.onFieldMappingChange(fieldMappings));
  };

  render() {
    const { detector, fieldMappingService } = this.props;
    const { fieldMappings = [], loading, ruleQueryFields = [] } = this.state;
    return (
      <ContentPanel
        className={'newFieldMappings'}
        title={
          <>
            <EuiTitle size={'m'}>
              <h3>New field mappings for your detector changes</h3>
            </EuiTitle>

            <EuiText size="s" color="subdued">
              When adding new log data sources, you may need to map additional log fields to rule
              field names. To perform threat detection, known field names from your log data source
              are automatically mapped to rule field names. Additional fields that may require
              manual mapping will be shown below.
            </EuiText>
          </>
        }
      >
        {!loading && (
          <EditFieldMappings
            {...this.props}
            detector={detector}
            fieldMappings={fieldMappings}
            ruleQueryFields={ruleQueryFields}
            fieldMappingService={fieldMappingService}
            replaceFieldMappings={this.replaceFieldMappings}
            loading={loading}
            initialIsOpen={false}
          />
        )}
      </ContentPanel>
    );
  }
}
