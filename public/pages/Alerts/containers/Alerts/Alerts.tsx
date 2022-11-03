/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiBasicTableColumn,
  EuiButton,
  EuiButtonEmpty,
  EuiButtonIcon,
  EuiFlexGroup,
  EuiFlexItem,
  EuiInMemoryTable,
  EuiPanel,
  EuiSpacer,
  EuiSuperDatePicker,
  EuiTitle,
  EuiToolTip,
} from '@elastic/eui';
import { FieldValueSelectionFilterConfigType } from '@elastic/eui/src/components/search_bar/filters/field_value_selection_filter';
import dateMath from '@elastic/datemath';
import React, { Component } from 'react';
import { ContentPanel } from '../../../../components/ContentPanel';
import { getAlertsVisualizationSpec } from '../../../Overview/utils/helpers';
import moment from 'moment';
import {
  ALERT_STATE,
  BREADCRUMBS,
  DATE_MATH_FORMAT,
  DEFAULT_EMPTY_DATA,
} from '../../../../utils/constants';
import { CoreServicesContext } from '../../../../components/core_services';
import AlertsService from '../../../../services/AlertsService';
import DetectorService from '../../../../services/DetectorService';
import { AlertItem } from '../../../../../server/models/interfaces';
import { AlertFlyout } from '../../components/AlertFlyout/AlertFlyout';
import { FindingsService, RuleService } from '../../../../services';
import { Detector } from '../../../../../models/interfaces';
import { parseAlertSeverityToOption } from '../../../CreateDetector/components/ConfigureAlerts/utils/helpers';
import { DISABLE_ACKNOWLEDGED_ALERT_HELP_TEXT } from '../../utils/constants';
import {
  capitalizeFirstLetter,
  createSelectComponent,
  renderVisualization,
} from '../../../../utils/helpers';

export interface AlertsProps {
  alertService: AlertsService;
  detectorService: DetectorService;
  findingService: FindingsService;
  ruleService: RuleService;
}

export interface AlertsState {
  groupBy: string;
  startTime: string;
  endTime: string;
  selectedItems: AlertItem[];
  alerts: AlertItem[];
  flyoutData?: { alertItem: AlertItem };
  alertsFiltered: boolean;
  filteredAlerts: AlertItem[];
  detectors: { [key: string]: Detector };
}

const groupByOptions = [
  { text: 'Alert status', value: 'status' },
  { text: 'Alert severity', value: 'severity' },
];

export default class Alerts extends Component<AlertsProps, AlertsState> {
  static contextType = CoreServicesContext;

  constructor(props: AlertsProps) {
    super(props);
    const now = moment.now();
    const startTime = moment(now).subtract(15, 'minutes').format(DATE_MATH_FORMAT);
    this.state = {
      groupBy: 'status',
      startTime,
      endTime: moment(now).format(DATE_MATH_FORMAT),
      selectedItems: [],
      alerts: [],
      alertsFiltered: false,
      filteredAlerts: [],
      detectors: {},
    };
  }

  componentDidUpdate(prevProps: Readonly<AlertsProps>, prevState: Readonly<AlertsState>) {
    const alertsChanged =
      prevState.startTime !== this.state.startTime ||
      prevState.endTime !== this.state.endTime ||
      prevState.alerts !== this.state.alerts ||
      prevState.alerts.length !== this.state.alerts.length;

    if (alertsChanged) {
      this.filterAlerts();
    } else if (this.state.groupBy !== prevState.groupBy) {
      renderVisualization(this.generateVisualizationSpec(this.state.filteredAlerts), 'alerts-view');
    }
  }

  filterAlerts = () => {
    const { alerts, startTime, endTime } = this.state;
    const startMoment = dateMath.parse(startTime);
    const endMoment = dateMath.parse(endTime);
    const filteredAlerts = alerts.filter((alert) =>
      moment(alert.last_notification_time).isBetween(moment(startMoment), moment(endMoment))
    );
    this.setState({ alertsFiltered: true, filteredAlerts: filteredAlerts });
    renderVisualization(this.generateVisualizationSpec(filteredAlerts), 'alerts-view');
  };

  getColumns(): EuiBasicTableColumn<AlertItem>[] {
    return [
      {
        field: 'start_time',
        name: 'Start time',
        sortable: true,
        dataType: 'date',
      },
      {
        field: 'trigger_name',
        name: 'Alert trigger name',
        sortable: false,
        dataType: 'string',
        render: (triggerName: string, alertItem: AlertItem) => (
          <EuiButtonEmpty onClick={() => this.setFlyout(alertItem)}>{triggerName}</EuiButtonEmpty>
        ),
      },
      {
        field: 'detectorName',
        name: 'Detector',
        sortable: true,
        dataType: 'string',
        render: (detectorName) => detectorName || DEFAULT_EMPTY_DATA,
      },
      {
        field: 'state',
        name: 'Status',
        sortable: true,
        dataType: 'string',
        render: (status) => (status ? capitalizeFirstLetter(status) : DEFAULT_EMPTY_DATA),
      },
      {
        field: 'severity',
        name: 'Alert severity',
        sortable: true,
        dataType: 'string',
        render: (severity: string) =>
          parseAlertSeverityToOption(severity)?.label || DEFAULT_EMPTY_DATA,
      },
      {
        name: 'Actions',
        sortable: false,
        actions: [
          {
            render: (alertItem: AlertItem) => {
              const disableAcknowledge = alertItem.state !== ALERT_STATE.ACTIVE;
              return (
                <EuiToolTip
                  content={
                    disableAcknowledge ? DISABLE_ACKNOWLEDGED_ALERT_HELP_TEXT : 'Acknowledge'
                  }
                >
                  <EuiButtonIcon
                    aria-label={'Acknowledge'}
                    disabled={disableAcknowledge}
                    iconType={'check'}
                    onClick={() => this.onAcknowledge([alertItem])}
                  />
                </EuiToolTip>
              );
            },
          },
          {
            render: (alertItem: AlertItem) => (
              <EuiToolTip content={'View details'}>
                <EuiButtonIcon
                  aria-label={'View details'}
                  iconType={'expand'}
                  onClick={() => this.setFlyout(alertItem)}
                />
              </EuiToolTip>
            ),
          },
        ],
      },
    ];
  }

  setFlyout(alertItem?: AlertItem): void {
    this.setState({ flyoutData: alertItem ? { alertItem } : undefined });
  }

  generateVisualizationSpec(alerts: AlertItem[]) {
    const visData = alerts.map((alert) => {
      const time = new Date(alert.start_time);
      time.setMilliseconds(0);
      time.setSeconds(0);

      return {
        alert: 1,
        time,
        status: alert.state,
        severity: alert.severity,
      };
    });

    return getAlertsVisualizationSpec(visData, this.state.groupBy);
  }

  createGroupByControl(): React.ReactNode {
    return createSelectComponent(
      groupByOptions,
      this.state.groupBy,
      'alert-vis-groupBy',
      (event) => {
        this.setState({ groupBy: event.target.value });
      }
    );
  }

  componentDidMount(): void {
    this.context.chrome.setBreadcrumbs([BREADCRUMBS.SECURITY_ANALYTICS, BREADCRUMBS.ALERTS]);
    this.onRefresh();
  }

  async getAlerts() {
    const { alertService, detectorService } = this.props;
    const { detectors } = this.state;

    const detectorsRes = await detectorService.getDetectors();
    if (detectorsRes.ok) {
      const detectorIds = detectorsRes.response.hits.hits.map((hit) => {
        detectors[hit._id] = hit._source;
        return hit._id;
      });
      let alerts: AlertItem[] = [];

      for (let id of detectorIds) {
        const alertsRes = await alertService.getAlerts({ detector_id: id });

        if (alertsRes.ok) {
          const detectorAlerts = alertsRes.response.alerts.map((alert) => {
            const detector = detectors[id];
            return { ...alert, detectorName: detector.name };
          });
          alerts = alerts.concat(detectorAlerts);
        }
      }

      this.setState({ alerts: alerts, detectors: detectors });
      this.filterAlerts();
    }
  }

  createAcknowledgeControl() {
    const { selectedItems } = this.state;
    return (
      <EuiButton disabled={!selectedItems.length} onClick={() => this.onAcknowledge(selectedItems)}>
        Acknowledge
      </EuiButton>
    );
  }

  onTimeChange = ({ start, end }: { start: string; end: string }) => {
    this.setState({ startTime: start, endTime: end });
  };

  onRefresh = async () => {
    this.getAlerts();
    renderVisualization(this.generateVisualizationSpec(this.state.filteredAlerts), 'alerts-view');
  };

  onSelectionChange = (selectedItems: AlertItem[]) => {
    this.setState({ selectedItems });
  };

  onFlyoutClose = () => {
    this.setState({ flyoutData: undefined });
  };

  onAcknowledge = async (selectedItems: AlertItem[] = []) => {
    const { alertService } = this.props;

    try {
      // Separating the selected items by detector ID, and adding all selected alert IDs to an array for that detector ID.
      const detectors: { [key: string]: string[] } = {};
      selectedItems.forEach((item) => {
        if (!detectors[item.detector_id]) detectors[item.detector_id] = [item.id];
        else detectors[item.detector_id].push(item.id);
      });

      for (let detectorId of Object.keys(detectors)) {
        const alertIds = detectors[detectorId];
        if (alertIds.length > 0) {
          const response = await alertService.acknowledgeAlerts(alertIds, detectorId);
          if (response.ok) {
            // TODO display toast when all responses return OK
          } else {
            // TODO display toast
            console.error('Failed to acknowledge alerts:', response.error);
          }
        }
      }
    } catch (e) {
      // TODO display toast
      console.error('Failed to acknowledge alerts:', response.error);
    }

    this.setState({ selectedItems: [] });
    this.onRefresh();
  };

  render() {
    const { ruleService } = this.props;
    const { alerts, alertsFiltered, detectors, filteredAlerts, flyoutData } = this.state;

    const severities = new Set();
    const statuses = new Set();
    filteredAlerts.forEach((alert) => {
      if (alert) {
        severities.add(alert.severity);
        statuses.add(alert.state);
      }
    });

    const search = {
      box: {
        placeholder: 'Search alerts',
        schema: true,
      },
      filters: [
        {
          type: 'field_value_selection',
          field: 'severity',
          name: 'Alert severity',
          options: Array.from(severities).map((severity) => ({
            value: severity,
            name: parseAlertSeverityToOption(severity)?.label || severity,
          })),
          multiSelect: 'or',
        } as FieldValueSelectionFilterConfigType,
        {
          type: 'field_value_selection',
          field: 'state',
          name: 'Status',
          options: Array.from(statuses).map((status) => ({
            value: status,
            name: capitalizeFirstLetter(status) || status,
          })),
          multiSelect: 'or',
        } as FieldValueSelectionFilterConfigType,
      ],
    };

    const selection = {
      onSelectionChange: this.onSelectionChange,
      selectable: (item) => item.state === ALERT_STATE.ACTIVE,
      selectableMessage: (selectable) =>
        selectable ? undefined : DISABLE_ACKNOWLEDGED_ALERT_HELP_TEXT,
    };

    const sorting: any = {
      sort: {
        field: 'start_time',
        direction: 'asc',
      },
    };

    return (
      <>
        {flyoutData && (
          <AlertFlyout
            alertItem={flyoutData.alertItem}
            detector={detectors[flyoutData.alertItem.detector_id]}
            onClose={this.onFlyoutClose}
            onAcknowledge={this.onAcknowledge}
            findingsService={this.props.findingService}
            ruleService={ruleService}
          />
        )}
        <EuiFlexGroup direction="column">
          <EuiFlexItem>
            <EuiFlexGroup gutterSize={'s'} justifyContent={'spaceBetween'}>
              <EuiFlexItem>
                <EuiTitle size="l">
                  <h1>Security alerts</h1>
                </EuiTitle>
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiSuperDatePicker
                  onTimeChange={this.onTimeChange}
                  onRefresh={this.onRefresh}
                  updateButtonProps={{ fill: false }}
                />
              </EuiFlexItem>
            </EuiFlexGroup>
            <EuiSpacer size="xxl" />
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiPanel>
              <EuiFlexGroup direction="column">
                <EuiFlexItem style={{ alignSelf: 'flex-end' }}>
                  {this.createGroupByControl()}
                </EuiFlexItem>
                <EuiFlexItem>
                  <div id="alerts-view"></div>
                </EuiFlexItem>
              </EuiFlexGroup>
            </EuiPanel>
            <EuiSpacer size="xxl" />
          </EuiFlexItem>
          <EuiFlexItem>
            <ContentPanel title={'Alerts'} actions={[this.createAcknowledgeControl()]}>
              <EuiInMemoryTable
                columns={this.getColumns()}
                items={alertsFiltered ? filteredAlerts : alerts}
                itemId={(item) => `${item.id}`}
                isSelectable={true}
                pagination
                search={search}
                sorting={sorting}
                selection={selection}
              />
            </ContentPanel>
          </EuiFlexItem>
        </EuiFlexGroup>
      </>
    );
  }
}
