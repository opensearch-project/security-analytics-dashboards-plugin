/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiBasicTableColumn,
  EuiButton,
  EuiFieldSearch,
  EuiFlexGroup,
  EuiFlexItem,
  EuiInMemoryTable,
  EuiLink,
  EuiPanel,
  EuiSelect,
  EuiSelectOption,
  EuiSpacer,
  EuiSuperDatePicker,
} from '@elastic/eui';
import { FlyoutData } from '../../../../components/Flyout/Flyout';
import React, { Component } from 'react';
import { ContentPanel } from '../../../../components/ContentPanel';
// import { AlertSeverity } from '../../utils/constants';
import { getVisualizationSpec } from '../../../Overview/utils/dummyData';
import { View, parse } from 'vega/build-es5/vega.js';
import { compile } from 'vega-lite';
import moment from 'moment';
import { BREADCRUMBS, DATE_MATH_FORMAT } from '../../../../utils/constants';
import { CoreServicesContext } from '../../../../components/core_services';
import AlertsService from '../../../../services/AlertsService';
import DetectorService from '../../../../services/DetectorService';

export interface AlertsProps {
  setFlyout: (flyoutData: FlyoutData) => void;
  alertService: AlertsService;
  detectorService: DetectorService;
}

export interface AlertsState {
  groupBy: string;
  startTime: string;
  endTime: string;
  selectedItems: AlertItem[];
  alerts: AlertItem[];
}

export interface AlertItem {
  id: string;
  allAlertsCount: number;
  activeCount: number;
  acknowledgedCount: number;
  errorCount: number;
  detectorName: string;
  severity: string;
}

const groupByOptions = [
  { text: 'Alert status', value: 'alert_status' },
  { text: 'Alert severity', value: 'alert_severity' },
];

const getColumns = (
  setFlyout: (flyoutData: FlyoutData) => void
): EuiBasicTableColumn<AlertItem>[] => [
  {
    field: 'allAlertsCount',
    name: 'Alerts',
    sortable: false,
    render: (alertsCount, alertByDetector) => {
      return (
        <EuiLink
          onClick={() => {
            setFlyout({
              title: 'Alerts details',
              type: 'dummy',
            });
          }}
        >
          {`${alertsCount} alerts for ${alertByDetector.detectorName}`}
        </EuiLink>
      );
    },
  },
  {
    field: 'activeCount',
    name: 'Active',
    sortable: false,
  },
  {
    field: 'acknowledgedCount',
    name: 'Acknowledged',
    sortable: false,
  },
  {
    field: 'errorCount',
    name: 'Errors',
    sortable: false,
  },
  {
    field: 'detectorName',
    name: 'Detector Name',
    sortable: false,
  },
  {
    field: 'severity',
    name: 'Severity',
    sortable: false,
  },
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
          alerts = alerts.concat(
            alertsRes.response.alerts.map((alert) => ({
              id: alert.id,
              allAlertsCount: alertsRes.response.alerts.length,
              activeCount: alertsRes.response.alerts.length,
              acknowledgedCount: 0,
              errorCount: 0,
              detectorName: alert.detector_id,
              severity: alert.severity,
            }))
          );
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
    // this.getAlerts();
  };

  onSelectionChange = (selectedItems: AlertItem[]) => {
    this.setState({ selectedItems });
  };

  render() {
    return (
      <ContentPanel title={'Security alerts'}>
        <EuiFlexGroup gutterSize={'s'}>
          <EuiFlexItem grow={9}>
            <EuiFieldSearch
              fullWidth={true}
              // onChange={this.onSearchChange}
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
            columns={getColumns(this.props.setFlyout)}
            items={this.state.alerts}
            itemId={(item) => `${item.id}`}
            isSelectable={true}
            pagination
            selection={{ onSelectionChange: this.onSelectionChange }}
          />
        </ContentPanel>
      </ContentPanel>
    );
  }
}
