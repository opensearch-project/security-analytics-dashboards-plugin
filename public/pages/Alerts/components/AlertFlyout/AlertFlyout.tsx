/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiBasicTable,
  EuiBasicTableColumn,
  EuiButton,
  EuiButtonIcon,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFlyout,
  EuiFlyoutBody,
  EuiFlyoutHeader,
  EuiLink,
  EuiSpacer,
  EuiTitle,
} from '@elastic/eui';
import { AlertItem } from '../../../../../server/models/interfaces';
import React from 'react';
import { ContentPanel } from '../../../../components/ContentPanel';
import { DEFAULT_EMPTY_DATA } from '../../../../utils/constants';
import { createTextDetailsGroup, renderTime } from '../../../../utils/helpers';
import { FindingsService } from '../../../../services';
import FindingDetailsFlyout from '../../../Findings/components/FindingDetailsFlyout';

export interface AlertFlyoutProps {
  alertItem: AlertItem;
  findingsService: FindingsService;
  onClose: () => void;
}

export interface AlertFlyoutState {
  findingFlyoutData?: Finding;
  findingItems: Finding[];
}

export class AlertFlyout extends React.Component<AlertFlyoutProps, AlertFlyoutState> {
  constructor(props: AlertFlyoutProps) {
    super(props);
    this.state = {
      findingItems: [],
    };
  }

  async componentDidMount() {
    const findingRes = await this.props.findingsService.getFindings({
      detectorId: this.props.alertItem.detector_id,
    });

    if (findingRes.ok) {
      this.setState({ findingItems: findingRes.response.findings });
    }
  }

  setFindingFlyoutData(finding?: Finding) {
    this.setState({ findingFlyoutData: finding });
  }

  createFindingTableColumns(): EuiBasicTableColumn<Finding>[] {
    return [
      {
        field: 'timestamp',
        name: 'Time',
        sortable: true,
        dataType: 'date',
        render: renderTime,
      },
      {
        field: 'id',
        name: 'Finding ID',
        sortable: true,
        dataType: 'string',
        render: (id, finding) =>
          <EuiLink onClick={() => this.setFindingFlyoutData(finding)}>{id}</EuiLink> ||
          DEFAULT_EMPTY_DATA,
      },
      {
        field: 'queries',
        name: 'Rule name',
        sortable: true,
        dataType: 'string',
        render: (queries: any) => queries[0].name || DEFAULT_EMPTY_DATA,
      },
      {
        field: 'detector_name',
        name: 'Threat detector',
        sortable: true,
        dataType: 'string',
        render: (name: string) => name || DEFAULT_EMPTY_DATA,
      },
      {
        field: 'queries',
        name: 'Log type',
        sortable: true,
        dataType: 'string',
        render: (queries: any) => queries[0].category || DEFAULT_EMPTY_DATA,
      },
    ];
  }

  render() {
    const { onClose, alertItem } = this.props;
    const {
      trigger_name,
      state,
      severity,
      start_time,
      last_notification_time,
      finding_ids,
      detector_id,
    } = alertItem;

    return !!this.state.findingFlyoutData ? (
      <FindingDetailsFlyout
        finding={this.state.findingFlyoutData}
        closeFlyout={onClose}
        backButton={
          <EuiButtonIcon
            iconType="arrowLeft"
            aria-lable="back"
            onClick={() => this.setFindingFlyoutData()}
            display="base"
            size="s"
          />
        }
      />
    ) : (
      <EuiFlyout
        onClose={onClose}
        hideCloseButton
        closeButtonProps={{
          size: 'm',
          display: 'base',
        }}
      >
        <EuiFlyoutHeader hasBorder={true}>
          <EuiFlexGroup justifyContent="spaceBetween">
            <EuiFlexItem grow={2}>
              <EuiTitle size={'m'}>
                <h3>Alert details</h3>
              </EuiTitle>
            </EuiFlexItem>
            <EuiFlexItem grow={8}>
              <EuiFlexGroup justifyContent="flexEnd" alignItems="center">
                <EuiFlexItem grow={false}>
                  <EuiButton>Acknowledge</EuiButton>
                </EuiFlexItem>
                <EuiFlexItem grow={false}>
                  <EuiButtonIcon iconType="cross" iconSize="m" display="empty" onClick={onClose} />
                </EuiFlexItem>
              </EuiFlexGroup>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlyoutHeader>
        <EuiFlyoutBody>
          {createTextDetailsGroup([
            { label: 'Alert trigger name', content: trigger_name },
            { label: 'Alert status', content: state },
            { label: 'Alert severity', content: severity },
          ])}
          {createTextDetailsGroup([
            { label: 'Start time', content: start_time },
            { label: 'Last updated time', content: last_notification_time },
          ])}
          {createTextDetailsGroup([{ label: 'Detector', content: detector_id }])}

          <EuiSpacer size={'xxl'} />

          <ContentPanel title={`Findings (${finding_ids.length})`}>
            <EuiBasicTable<Finding>
              columns={this.createFindingTableColumns()}
              items={this.state.findingItems}
            />
          </ContentPanel>
        </EuiFlyoutBody>
      </EuiFlyout>
    );
  }
}
