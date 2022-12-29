/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  DurationRange,
  EuiBasicTableColumn,
  EuiButton,
  EuiButtonIcon,
  EuiFlexGroup,
  EuiFlexItem,
  EuiInMemoryTable,
  EuiLink,
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
import {
  getAlertsVisualizationSpec,
  getChartTimeUnit,
  getDomainRange,
  TimeUnit,
} from '../../../Overview/utils/helpers';
import moment from 'moment';
import {
  ALERT_STATE,
  BREADCRUMBS,
  DEFAULT_DATE_RANGE,
  DEFAULT_EMPTY_DATA,
  MAX_RECENTLY_USED_TIME_RANGES,
} from '../../../../utils/constants';
import { CoreServicesContext } from '../../../../components/core_services';
import AlertsService from '../../../../services/AlertsService';
import DetectorService from '../../../../services/DetectorService';
import { AlertItem } from '../../../../../server/models/interfaces';
import { AlertFlyout } from '../../components/AlertFlyout/AlertFlyout';
import { FindingsService, RuleService, OpenSearchService } from '../../../../services';
import { Detector } from '../../../../../models/interfaces';
import { parseAlertSeverityToOption } from '../../../CreateDetector/components/ConfigureAlerts/utils/helpers';
import { DISABLE_ACKNOWLEDGED_ALERT_HELP_TEXT } from '../../utils/constants';
import {
  capitalizeFirstLetter,
  createSelectComponent,
  errorNotificationToast,
  renderTime,
  renderVisualization,
  successNotificationToast,
} from '../../../../utils/helpers';
import { NotificationsStart } from 'opensearch-dashboards/public';
import { match, withRouter } from 'react-router-dom';
import { DateTimeFilter } from '../../../Overview/models/interfaces';
import { ChartContainer } from '../../../../components/Charts/ChartContainer';

export interface AlertsProps {
  alertService: AlertsService;
  detectorService: DetectorService;
  findingService: FindingsService;
  ruleService: RuleService;
  opensearchService: OpenSearchService;
  notifications: NotificationsStart;
  match: match;
  dateTimeFilter?: DateTimeFilter;
  setDateTimeFilter?: Function;
}

export interface AlertsState {
  groupBy: string;
  recentlyUsedRanges: DurationRange[];
  selectedItems: AlertItem[];
  alerts: AlertItem[];
  flyoutData?: { alertItem: AlertItem };
  alertsFiltered: boolean;
  filteredAlerts: AlertItem[];
  detectors: { [key: string]: Detector };
  loading: boolean;
  timeUnit: TimeUnit;
  dateFormat: string;
}

const groupByOptions = [
  { text: 'Alert status', value: 'status' },
  { text: 'Alert severity', value: 'severity' },
];

class Alerts extends Component<AlertsProps, AlertsState> {
  static contextType = CoreServicesContext;

  constructor(props: AlertsProps) {
    super(props);

    const {
      dateTimeFilter = {
        startTime: DEFAULT_DATE_RANGE.start,
        endTime: DEFAULT_DATE_RANGE.end,
      },
    } = props;
    const timeUnits = getChartTimeUnit(dateTimeFilter.startTime, dateTimeFilter.endTime);
    this.state = {
      loading: true,
      groupBy: 'status',
      recentlyUsedRanges: [DEFAULT_DATE_RANGE],
      selectedItems: [],
      alerts: [],
      alertsFiltered: false,
      filteredAlerts: [],
      detectors: {},
      timeUnit: timeUnits.timeUnit,
      dateFormat: timeUnits.dateFormat,
    };
  }

  componentDidUpdate(prevProps: Readonly<AlertsProps>, prevState: Readonly<AlertsState>) {
    const {
      dateTimeFilter = {
        startTime: DEFAULT_DATE_RANGE.start,
        endTime: DEFAULT_DATE_RANGE.end,
      },
    } = this.props;
    const alertsChanged =
      prevProps.dateTimeFilter?.startTime !== dateTimeFilter.startTime ||
      prevProps.dateTimeFilter?.endTime !== dateTimeFilter.endTime ||
      prevState.alerts !== this.state.alerts ||
      prevState.alerts.length !== this.state.alerts.length;

    if (alertsChanged) {
      this.filterAlerts();
    } else if (this.state.groupBy !== prevState.groupBy) {
      renderVisualization(this.generateVisualizationSpec(this.state.filteredAlerts), 'alerts-view');
    }
  }

  filterAlerts = () => {
    const { alerts } = this.state;
    const {
      dateTimeFilter = {
        startTime: DEFAULT_DATE_RANGE.start,
        endTime: DEFAULT_DATE_RANGE.end,
      },
    } = this.props;
    const startMoment = dateMath.parse(dateTimeFilter.startTime);
    const endMoment = dateMath.parse(dateTimeFilter.endTime);
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
        render: renderTime,
      },
      {
        field: 'trigger_name',
        name: 'Alert trigger name',
        sortable: false,
        dataType: 'string',
        render: (triggerName: string, alertItem: AlertItem) => (
          <EuiLink onClick={() => this.setFlyout(alertItem)}>{triggerName}</EuiLink>
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
        severity: parseAlertSeverityToOption(alert.severity)?.label || alert.severity,
      };
    });
    const {
      dateTimeFilter = {
        startTime: DEFAULT_DATE_RANGE.start,
        endTime: DEFAULT_DATE_RANGE.end,
      },
    } = this.props;
    const chartTimeUnits = getChartTimeUnit(dateTimeFilter.startTime, dateTimeFilter.endTime);
    return getAlertsVisualizationSpec(visData, this.state.groupBy, {
      timeUnit: chartTimeUnits.timeUnit,
      dateFormat: chartTimeUnits.dateFormat,
      domain: getDomainRange(
        [dateTimeFilter.startTime, dateTimeFilter.endTime],
        chartTimeUnits.timeUnit.unit
      ),
    });
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
    this.setState({ loading: true });
    const { alertService, detectorService, notifications } = this.props;
    const { detectors } = this.state;
    try {
      const detectorsRes = await detectorService.getDetectors();
      if (detectorsRes.ok) {
        const detectorIds = detectorsRes.response.hits.hits.map((hit) => {
          detectors[hit._id] = { ...hit._source, id: hit._id };
          return hit._id;
        });

        let alerts: AlertItem[] = [];
        const detectorId = this.props.match.params['detectorId'];
        for (let id of detectorIds) {
          if (!detectorId || detectorId === id) {
            const alertsRes = await alertService.getAlerts({ detector_id: id });

            if (alertsRes.ok) {
              const detectorAlerts = alertsRes.response.alerts.map((alert) => {
                const detector = detectors[id];
                return { ...alert, detectorName: detector.name };
              });
              alerts = alerts.concat(detectorAlerts);
            } else {
              errorNotificationToast(notifications, 'retrieve', 'alerts', alertsRes.error);
            }
          }
        }

        this.setState({ alerts: alerts, detectors: detectors });
      } else {
        errorNotificationToast(notifications, 'retrieve', 'detectors', detectorsRes.error);
      }
    } catch (e) {
      errorNotificationToast(notifications, 'retrieve', 'alerts', e);
    }
    this.filterAlerts();
    this.setState({ loading: false });
  }

  createAcknowledgeControl() {
    const { selectedItems } = this.state;
    return (
      <EuiButton
        disabled={!selectedItems.length}
        onClick={() => this.onAcknowledge(selectedItems)}
        data-test-subj={'acknowledge-button'}
      >
        Acknowledge
      </EuiButton>
    );
  }

  onTimeChange = ({ start, end }: { start: string; end: string }) => {
    let { recentlyUsedRanges } = this.state;
    recentlyUsedRanges = recentlyUsedRanges.filter(
      (range) => !(range.start === start && range.end === end)
    );
    recentlyUsedRanges.unshift({ start: start, end: end });
    if (recentlyUsedRanges.length > MAX_RECENTLY_USED_TIME_RANGES)
      recentlyUsedRanges = recentlyUsedRanges.slice(0, MAX_RECENTLY_USED_TIME_RANGES);
    const endTime = start === end ? DEFAULT_DATE_RANGE.end : end;

    const timeUnits = getChartTimeUnit(start, endTime);
    this.setState({
      recentlyUsedRanges: recentlyUsedRanges,
      ...timeUnits,
    });

    this.props.setDateTimeFilter &&
      this.props.setDateTimeFilter({
        startTime: start,
        endTime: endTime,
      });
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
    const { alertService, notifications } = this.props;
    let successCount = 0;
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
            successCount += alertIds.length;
          } else {
            errorNotificationToast(notifications, 'acknowledge', 'alerts', response.error);
          }
        }
      }
    } catch (e) {
      errorNotificationToast(notifications, 'acknowledge', 'alerts', e);
    }
    if (successCount)
      successNotificationToast(notifications, 'acknowledged', `${successCount} alerts`);
    this.setState({ selectedItems: [] });
    this.onRefresh();
  };

  render() {
    const { ruleService } = this.props;
    const {
      alerts,
      alertsFiltered,
      detectors,
      filteredAlerts,
      flyoutData,
      loading,
      recentlyUsedRanges,
    } = this.state;

    const {
      dateTimeFilter = {
        startTime: DEFAULT_DATE_RANGE.start,
        endTime: DEFAULT_DATE_RANGE.end,
      },
    } = this.props;
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
        direction: 'dsc',
      },
    };

    return (
      <>
        {flyoutData && (
          <AlertFlyout
            {...this.props}
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
                <EuiTitle size="m">
                  <h1>Security alerts</h1>
                </EuiTitle>
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiSuperDatePicker
                  start={dateTimeFilter.startTime}
                  end={dateTimeFilter.endTime}
                  recentlyUsedRanges={recentlyUsedRanges}
                  isLoading={loading}
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
                  <ChartContainer chartViewId={'alerts-view'} loading={loading} />
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
                loading={loading}
              />
            </ContentPanel>
          </EuiFlexItem>
        </EuiFlexGroup>
      </>
    );
  }
}

export default withRouter(Alerts);
