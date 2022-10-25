/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiBasicTableColumn,
  EuiButton,
  EuiButtonEmpty,
  EuiFieldSearch,
  EuiFlexGroup,
  EuiFlexItem,
  EuiInMemoryTable,
  EuiPanel,
  EuiSelect,
  EuiSelectOption,
  EuiSpacer,
  EuiSuperDatePicker,
} from '@elastic/eui';
import React, { Component } from 'react';
import { ContentPanel } from '../../../../components/ContentPanel';
import { getVisualizationSpec } from '../../../Overview/utils/dummyData';
import { View, parse } from 'vega/build-es5/vega.js';
import { compile } from 'vega-lite';
import moment from 'moment';
import { BREADCRUMBS, DATE_MATH_FORMAT } from '../../../../utils/constants';
import { CoreServicesContext } from '../../../../components/core_services';
import AlertsService from '../../../../services/AlertsService';
import DetectorService from '../../../../services/DetectorService';
import { AlertItem } from '../../../../../server/models/interfaces';
import { AlertFlyout } from '../../components/AlertFlyout/AlertFlyout';
import { FindingsService } from '../../../../services';

export interface AlertsProps {
  alertService: AlertsService;
  detectorService: DetectorService;
  findingService: FindingsService;
}

export interface AlertsState {
  groupBy: string;
  startTime: string;
  endTime: string;
  selectedItems: AlertItem[];
  alerts: AlertItem[];
  flyoutData?: { alertItem: AlertItem };
}

const groupByOptions = [
  { text: 'Alert status', value: 'alert_status' },
  { text: 'Alert severity', value: 'alert_severity' },
];

export default class Alerts extends Component<AlertsProps, AlertsState> {
  static contextType = CoreServicesContext;

  constructor(props: AlertsProps) {
    super(props);
    const now = moment.now();
    const startTime = moment(now).subtract(15, 'hours').format(DATE_MATH_FORMAT);
    this.state = {
      groupBy: 'alert_status',
      startTime,
      endTime: moment(now).format(DATE_MATH_FORMAT),
      selectedItems: [],
      alerts: [],
    };
  }

  getColumns(): EuiBasicTableColumn<AlertItem>[] {
    return [
      {
        field: 'start_time',
        name: 'Start time',
        sortable: true,
      },
      {
        field: 'trigger_name',
        name: 'Alert trigger name',
        sortable: false,
        render: (triggerName: string, alertItem: AlertItem) => (
          <EuiButtonEmpty onClick={() => this.setFlyout(alertItem)}>{triggerName}</EuiButtonEmpty>
        ),
      },
      {
        field: 'detector_id',
        name: 'Detector',
        sortable: true,
      },
      {
        field: 'state',
        name: 'Status',
        sortable: true,
      },
      {
        field: 'severity',
        name: 'Alert severity',
        sortable: true,
      },
      {
        field: 'start_time',
        name: 'Start time',
        sortable: true,
      },
      {
        name: 'Actions',
        sortable: false,
        actions: [
          {
            render: (alertItem: AlertItem) => (
              <EuiButton disabled={!!alertItem.acknowledged_time} onClick={() => {}}>
                Ack
              </EuiButton>
            ),
          },
          {
            render: (alertItem: AlertItem) => (
              <EuiButton onClick={() => this.setFlyout(alertItem)}>View details</EuiButton>
            ),
          },
        ],
      },
    ];
  }

  setFlyout(alertItem?: AlertItem): void {
    this.setState({ flyoutData: alertItem ? { alertItem } : undefined });
  }

  generateVisualizationSpec() {
    return getVisualizationSpec();
  }

  renderVis() {
    let view;
    const spec = this.generateVisualizationSpec();

    try {
      renderVegaSpec(
        compile({ ...spec, width: 'container', height: 400 }).spec
      ).catch((err: Error) => console.error(err));
    } catch (error) {
      console.log(error);
    }

    function renderVegaSpec(spec: {}) {
      view = new View(parse(spec), {
        // view = new View(parse(spec, null, { expr: vegaExpressionInterpreter }), {
        renderer: 'canvas', // renderer (canvas or svg)
        container: '#view', // parent DOM container
        hover: true, // enable hover processing
      });
      return view.runAsync();
    }
  }

  createSelectComponent(
    options: EuiSelectOption[],
    value: string,
    onChange: React.ChangeEventHandler<HTMLSelectElement>
  ) {
    return (
      <EuiFlexGroup justifyContent="flexStart" alignItems="flexStart" direction="column">
        <EuiFlexItem grow={false}>
          <h5>Group by</h5>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiSelect
            id="overview-vis-options"
            options={options}
            value={value}
            onChange={onChange}
          />
        </EuiFlexItem>
      </EuiFlexGroup>
    );
  }

  createGroupByControl(): React.ReactNode {
    return this.createSelectComponent(groupByOptions, this.state.groupBy, (event) => {
      this.setState({ groupBy: event.target.value });
    });
  }

  componentDidMount(): void {
    this.context.chrome.setBreadcrumbs([BREADCRUMBS.SECURITY_ANALYTICS, BREADCRUMBS.ALERTS]);
    this.renderVis();
    this.getAlerts();
  }

  async getAlerts() {
    const { alertService, detectorService } = this.props;

    const detectorsRes = await detectorService.getDetectors();
    if (detectorsRes.ok) {
      const detectorIds = detectorsRes.response.hits.hits.map((hit) => hit._id);
      let alerts: AlertItem[] = [];

      for (let id of detectorIds) {
        const alertsRes = await alertService.getAlerts({ detectorId: id });

        if (alertsRes.ok) {
          alerts = alerts.concat(alertsRes.response.alerts);
        }
      }

      this.setState({ alerts });
    }
  }

  createAcknowledgeControl() {
    return <EuiButton>Acknowledge</EuiButton>;
  }

  onTimeChange = ({ start, end }: { start: string; end: string }) => {
    this.setState({ startTime: start, endTime: end });
  };

  onRefresh = async () => {
    this.getAlerts();
  };

  onSelectionChange = (selectedItems: AlertItem[]) => {
    this.setState({ selectedItems });
  };

  onFlyoutClose = () => {
    this.setState({ flyoutData: undefined });
  };

  render() {
    return (
      <>
        {this.state.flyoutData && (
          <AlertFlyout
            alertItem={this.state.flyoutData.alertItem}
            onClose={this.onFlyoutClose}
            findingsService={this.props.findingService}
          />
        )}
        <ContentPanel title={'Security alerts'}>
          <EuiFlexGroup gutterSize={'s'}>
            <EuiFlexItem grow={9}>
              <EuiFieldSearch
                fullWidth={true}
                // onChange={this.onSearchChange} // TODO: Implement search
                placeholder={'Search findings'}
              />
            </EuiFlexItem>
            <EuiFlexItem grow={1}>
              <EuiSuperDatePicker onTimeChange={this.onTimeChange} onRefresh={this.onRefresh} />
            </EuiFlexItem>
          </EuiFlexGroup>
          <EuiSpacer size={'m'} />
          <EuiSpacer size="xxl" />
          <EuiPanel>
            <EuiFlexGroup>
              <EuiFlexItem grow={9}>
                <div id="view"></div>
              </EuiFlexItem>
              <EuiFlexItem grow={1}>{this.createGroupByControl()}</EuiFlexItem>
            </EuiFlexGroup>
          </EuiPanel>
          <EuiSpacer size="xxl" />
          <ContentPanel title={'Alerts'} actions={[this.createAcknowledgeControl()]}>
            <EuiInMemoryTable
              columns={this.getColumns()}
              items={this.state.alerts}
              itemId={(item) => `${item.id}`}
              isSelectable={true}
              pagination
              selection={{ onSelectionChange: this.onSelectionChange }}
            />
          </ContentPanel>
        </ContentPanel>
      </>
    );
  }
}
