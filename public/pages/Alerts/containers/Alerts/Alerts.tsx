/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
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
  EuiEmptyPrompt,
  EuiTableSelectionType,
  EuiTabs,
  EuiTab,
  EuiIcon,
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
import { AlertFlyout } from '../../components/AlertFlyout/AlertFlyout';
import { CorrelationAlertFlyout } from '../../components/CorrelationAlertFlyout/CorrelationAlertFlyout';
import { CorrelationService, FindingsService, IndexPatternsService, OpenSearchService } from '../../../../services';
import { parseAlertSeverityToOption } from '../../../CreateDetector/components/ConfigureAlerts/utils/helpers';
import { DISABLE_ACKNOWLEDGED_ALERT_HELP_TEXT } from '../../utils/constants';
import {
  capitalizeFirstLetter,
  createSelectComponent,
  errorNotificationToast,
  getDuration,
  renderTime,
  renderVisualization,
  successNotificationToast,
} from '../../../../utils/helpers';
import { NotificationsStart } from 'opensearch-dashboards/public';
import { match, RouteComponentProps, withRouter } from 'react-router-dom';
import { ChartContainer } from '../../../../components/Charts/ChartContainer';
import { AlertItem, CorrelationAlertTableItem, DataSourceProps, DateTimeFilter, Detector } from '../../../../../types';
import { DurationRange } from '@elastic/eui/src/components/date_picker/types';
import { DataStore } from '../../../../store/DataStore';

export interface AlertsProps extends RouteComponentProps, DataSourceProps {
  alertService: AlertsService;
  detectorService: DetectorService;
  findingService: FindingsService;
  opensearchService: OpenSearchService;
  correlationService: CorrelationService
  notifications: NotificationsStart;
  indexPatternService: IndexPatternsService;
  match: match<{ detectorId: string }>;
  dateTimeFilter: DateTimeFilter;
  setDateTimeFilter?: Function;
}

export interface AlertsState {
  groupBy: string;
  recentlyUsedRanges: DurationRange[];
  selectedItems: AlertItem[];
  correlatedItems: CorrelationAlertTableItem[];
  alerts: AlertItem[];
  correlationAlerts: CorrelationAlertTableItem[];
  flyoutData?: { alertItem: AlertItem };
  flyoutCorrelationData?: { alertItem: CorrelationAlertTableItem };
  alertsFiltered: boolean;
  filteredCorrelationAlerts: CorrelationAlertTableItem[];
  filteredAlerts: AlertItem[];
  detectors: { [key: string]: Detector };
  loading: boolean;
  timeUnit: TimeUnit;
  dateFormat: string;
  widgetEmptyMessage: React.ReactNode | undefined;
  widgetEmptyCorrelationMessage: React.ReactNode | undefined;
  tab: string;
}

const groupByOptions = [
  { text: 'Alert status', value: 'status' },
  { text: 'Alert severity', value: 'severity' },
];

export class Alerts extends Component<AlertsProps, AlertsState> {
  static contextType = CoreServicesContext;
  private abortControllers: AbortController[] = [];


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
      correlatedItems: [],
      alerts: [],
      correlationAlerts: [],
      alertsFiltered: false,
      filteredAlerts: [],
      filteredCorrelationAlerts: [],
      detectors: {},
      timeUnit: timeUnits.timeUnit,
      dateFormat: timeUnits.dateFormat,
      widgetEmptyMessage: undefined,
      widgetEmptyCorrelationMessage: undefined,
      tab: 'findings'
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

    const correlationAlertsChanged =
      prevProps.dateTimeFilter?.startTime !== dateTimeFilter.startTime ||
      prevProps.dateTimeFilter?.endTime !== dateTimeFilter.endTime ||
      prevState.correlationAlerts !== this.state.correlationAlerts ||
      prevState.correlationAlerts.length !== this.state.correlationAlerts.length;

    if (prevState.tab !== this.state.tab) {
      this.onRefresh();
    }
    if (this.props.dataSource !== prevProps.dataSource) {
      this.onRefresh();
    } else if (alertsChanged) {
      this.filterAlerts();
    } else if (correlationAlertsChanged) {
      this.filterCorrelationAlerts();
    } else if (this.state.groupBy !== prevState.groupBy) {
      this.renderVisAsPerTab();
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
    this.setState({
      alertsFiltered: true,
      filteredAlerts: filteredAlerts,
      widgetEmptyMessage: filteredAlerts.length ? undefined : (
        <EuiEmptyPrompt
          body={
            <p>
              <span style={{ display: 'block' }}>No alerts.</span>Adjust the time range to see more
              results.
            </p>
          }
        />
      ),
    });
    renderVisualization(this.generateVisualizationSpec(filteredAlerts), 'alerts-view');
  };

  filterCorrelationAlerts = () => {
    const { correlationAlerts } = this.state;
    const {
      dateTimeFilter = {
        startTime: DEFAULT_DATE_RANGE.start,
        endTime: DEFAULT_DATE_RANGE.end,
      },
    } = this.props;
    const startMoment = dateMath.parse(dateTimeFilter.startTime);
    const endMoment = dateMath.parse(dateTimeFilter.endTime);
    const filteredCorrelationAlerts = correlationAlerts.filter((correlationAlert) =>
      moment(correlationAlert.end_time).isBetween(moment(startMoment), moment(endMoment))
    );
    this.setState({
      alertsFiltered: true,
      filteredCorrelationAlerts: filteredCorrelationAlerts,
      widgetEmptyCorrelationMessage: filteredCorrelationAlerts.length ? undefined : (
        <EuiEmptyPrompt
          body={
            <p>
              <span style={{ display: 'block' }}>No alerts.</span>Adjust the time range to see more
              results.
            </p>
          }
        />
      ),
    });
    renderVisualization(this.generateCorrelationVisualizationSpec(filteredCorrelationAlerts), 'alerts-view');
  };

  private renderVisAsPerTab() {
    if (this.state.tab === "findings") {
      renderVisualization(this.generateVisualizationSpec(this.state.filteredAlerts), 'alerts-view');
    } else {
      renderVisualization(this.generateCorrelationVisualizationSpec(this.state.filteredCorrelationAlerts), 'alerts-view');
    }
  }

  private getAlertsAsPerTab() {
    if (this.state.tab === "findings") {
      this.abortPendingGetAlerts();
      const abortController = new AbortController();
      this.abortControllers.push(abortController);
      this.getAlerts(abortController.signal);
    } else {
      this.getCorrelationAlerts();
    }
  }

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
        render: (detectorName: string) => detectorName || DEFAULT_EMPTY_DATA,
      },
      {
        field: 'state',
        name: 'Status',
        sortable: true,
        dataType: 'string',
        render: (status: string) => (status ? capitalizeFirstLetter(status) : DEFAULT_EMPTY_DATA),
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

  getCorrelationColumns(): EuiBasicTableColumn<CorrelationAlertTableItem>[] {
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
        render: (triggerName: string) => triggerName || DEFAULT_EMPTY_DATA,
      },
      {
        field: 'correlation_rule_name',
        name: 'Correlation Rule Name',
        sortable: true,
        dataType: 'string',
        render: (correlationRulename: string, alertItem: CorrelationAlertTableItem) => (
          <EuiLink onClick={() => this.setCorrelationFlyout(alertItem)}>{correlationRulename}</EuiLink>
        ),
      },
      {
        field: 'correlation_rule_categories',
        name: 'Log Types',
        sortable: false,
        dataType: 'string',
        render: (correlationRuleCategories: string[]) => correlationRuleCategories.join(', ') || DEFAULT_EMPTY_DATA,
      },
      {
        field: 'state',
        name: 'Status',
        sortable: true,
        dataType: 'string',
        render: (status: string) => (status ? capitalizeFirstLetter(status) : DEFAULT_EMPTY_DATA),
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
            render: (alertItem: CorrelationAlertTableItem) => {
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
                    onClick={() => this.onAcknowledgeCorrelationAlert([alertItem])}
                  />
                </EuiToolTip>
              );
            },
          },
          {
            render: (alertItem: CorrelationAlertTableItem) => (
              <EuiToolTip content={'View details'}>
                <EuiButtonIcon
                  aria-label={'View details'}
                  iconType={'expand'}
                  onClick={() => this.setCorrelationFlyout(alertItem)}
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

  setCorrelationFlyout(alertItem?: CorrelationAlertTableItem): void {
    this.setState({ flyoutCorrelationData: alertItem ? { alertItem } : undefined });
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

  generateCorrelationVisualizationSpec(alerts: CorrelationAlertTableItem[]) {
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

  componentWillUnmount(): void {
    this.abortPendingGetAlerts();
  }

  async getCorrelationAlerts() {
    this.setState({ loading: true, correlationAlerts: [] });
    const { correlationService, notifications } = this.props;
    try {
      const correlationRes = await correlationService.getCorrelationAlerts();
      if (correlationRes.ok) {
        const alerts = correlationRes.response.correlationAlerts;
        // Fetch correlation queries for each alert
        const enrichedAlerts = await Promise.all(alerts.map(async (alert) => {
          const correlation = await DataStore.correlations.getCorrelationRule(alert.correlation_rule_id);
          const correlationQueries = correlation?.queries || [];
          const correlationRuleCategories = correlationQueries.map((query) => query.logType);
          return {
            ...alert,
            correlation_rule_categories: correlationRuleCategories,
          };
        }));
        this.setState({ correlationAlerts: enrichedAlerts });
      } else {
        errorNotificationToast(notifications, 'retrieve', 'correlations', correlationRes.error);
      }
    } catch (e: any) {
      errorNotificationToast(notifications, 'retrieve', 'correlationAlerts', e);
    }
    this.filterCorrelationAlerts();
    this.setState({ loading: false });
  }

  async getAlerts(abort: AbortSignal) {
    this.setState({ loading: true, alerts: [] });
    const { detectorService, notifications, dateTimeFilter } = this.props;
    const { detectors } = this.state;
    try {
      const detectorsRes = await detectorService.getDetectors();
      const duration = getDuration(dateTimeFilter);
      if (detectorsRes.ok) {
        this.setState({ detectors: detectors });
        const detectorIds = detectorsRes.response.hits.hits.map((hit) => {
          detectors[hit._id] = { ...hit._source, id: hit._id };
          return hit._id;
        });

        const detectorId = this.props.match.params['detectorId'];

        for (let id of detectorIds) {
          if (!detectorId || detectorId === id) {
            await DataStore.alerts.getAlertsByDetector(
              id,
              detectors[id].name,
              abort,
              duration,
              (alerts) => {
                this.setState({ alerts: [...this.state.alerts, ...alerts] })
              }
            );
          }
        }
      } else {
        errorNotificationToast(notifications, 'retrieve', 'detectors', detectorsRes.error);
      }
    } catch (e: any) {
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

  createAcknowledgeControlForCorrelations() {
    const { correlatedItems } = this.state;
    return (
      <EuiButton
        disabled={!correlatedItems.length}
        onClick={() => this.onAcknowledgeCorrelationAlert(correlatedItems)}
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

  private abortPendingGetAlerts() {
    this.abortControllers.forEach(controller => controller.abort());
    this.abortControllers = [];
  }

  onRefresh = async () => {
    this.getAlertsAsPerTab();
    this.renderVisAsPerTab();
  };

  onSelectionChange = (selectedItems: AlertItem[]) => {
    this.setState({ selectedItems });
  };

  onCorrelationSelectionChange = (correlatedItems: CorrelationAlertTableItem[]) => {
    this.setState({ correlatedItems });
  };

  onFlyoutClose = () => {
    this.setState({ flyoutData: undefined });
  };
  onCorrelationFlyoutClose = () => {
    this.setState({ flyoutCorrelationData: undefined });
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
    } catch (e: any) {
      errorNotificationToast(notifications, 'acknowledge', 'alerts', e);
    }
    if (successCount)
      successNotificationToast(notifications, 'acknowledged', `${successCount} alerts`);
    this.setState({ selectedItems: [] });
    this.onRefresh();
  };

  onAcknowledgeCorrelationAlert = async (selectedItems: CorrelationAlertTableItem[] = []) => {
    const { correlationService, notifications } = this.props;
    let successCount = 0;
    try {
      // Separating the selected items by detector ID, and adding all selected alert IDs to an array for that detector ID.
      const alertIds: string[] = [];
      selectedItems.forEach((item) => {
        alertIds.push(item.id);
      });

      if (alertIds.length > 0) {
        const response = await correlationService.acknowledgeCorrelationAlerts(alertIds);
        if (response.ok) {
          successCount += alertIds.length;
        } else {
          errorNotificationToast(notifications, 'acknowledge', 'alerts', response.error);
        }
      }
    } catch (e: any) {
      errorNotificationToast(notifications, 'acknowledge', 'alerts', e);
    }
    if (successCount)
      successNotificationToast(notifications, 'acknowledged', `${successCount} alerts`);
    this.setState({ selectedItems: [] });
    this.onRefresh();
  };

  render() {
    const {
      alerts,
      alertsFiltered,
      detectors,
      filteredAlerts,
      filteredCorrelationAlerts,
      correlationAlerts,
      flyoutCorrelationData,
      flyoutData,
      loading,
      recentlyUsedRanges,
      widgetEmptyMessage,
      widgetEmptyCorrelationMessage,
    } = this.state;

    const {
      dateTimeFilter = {
        startTime: DEFAULT_DATE_RANGE.start,
        endTime: DEFAULT_DATE_RANGE.end,
      },
    } = this.props;
    const severities = new Set<string>();
    const statuses = new Set<string>();
    const corrSeverities = new Set<string>();
    const corrStatuses = new Set<string>();
    filteredAlerts.forEach((alert) => {
      if (alert) {
        severities.add(alert.severity);
        statuses.add(alert.state);
      }
    });

    filteredCorrelationAlerts.forEach((alert) => {
      if (alert) {
        corrSeverities.add(alert.severity);
        corrStatuses.add(alert.state);
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

    const correlationSearch = {
      box: {
        placeholder: 'Search alerts',
        schema: true,
      },
      filters: [
        {
          type: 'field_value_selection',
          field: 'severity',
          name: 'Alert severity',
          options: Array.from(corrSeverities).map((severity) => ({
            value: severity,
            name: parseAlertSeverityToOption(severity)?.label || severity,
          })),
          multiSelect: 'or',
        } as FieldValueSelectionFilterConfigType,
        {
          type: 'field_value_selection',
          field: 'state',
          name: 'Status',
          options: Array.from(corrStatuses).map((status) => ({
            value: status,
            name: capitalizeFirstLetter(status) || status,
          })),
          multiSelect: 'or',
        } as FieldValueSelectionFilterConfigType,
      ],
    };


    const selection: EuiTableSelectionType<AlertItem> = {
      onSelectionChange: this.onSelectionChange,
      selectable: (item: AlertItem) => item.state === ALERT_STATE.ACTIVE,
      selectableMessage: (selectable) => (selectable ? '' : DISABLE_ACKNOWLEDGED_ALERT_HELP_TEXT),
    };

    const correlationSelection: EuiTableSelectionType<CorrelationAlertTableItem> = {
      onSelectionChange: this.onCorrelationSelectionChange,
      selectable: (item: CorrelationAlertTableItem) => item.state === ALERT_STATE.ACTIVE,
      selectableMessage: (selectable) => (selectable ? '' : DISABLE_ACKNOWLEDGED_ALERT_HELP_TEXT),
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
            indexPatternService={this.props.indexPatternService}
          />
        )}
        {flyoutCorrelationData && (
          <CorrelationAlertFlyout
            {...this.props}
            alertItem={flyoutCorrelationData.alertItem}
            onClose={this.onCorrelationFlyoutClose}
            onAcknowledge={this.onAcknowledgeCorrelationAlert}
            indexPatternService={this.props.indexPatternService}
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
            <EuiSpacer size={'m'} />
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiPanel>
              <EuiFlexGroup direction="column">
                <EuiFlexItem style={{ alignSelf: 'flex-end' }}>
                  {this.createGroupByControl()}
                </EuiFlexItem>
                <EuiFlexItem>
                  {!alerts || alerts.length === 0 ? (
                    <EuiEmptyPrompt
                      title={<h2>No alerts</h2>}
                      body={
                        <p>
                          Adjust the time range to see more results or create alert triggers in your{' '}
                          <EuiLink href={`${location.pathname}#/detectors`}>detectors</EuiLink> to
                          generate alerts.
                        </p>
                      }
                    />
                  ) : (
                    <ChartContainer chartViewId={'alerts-view'} loading={loading} />
                  )}
                </EuiFlexItem>
              </EuiFlexGroup>
            </EuiPanel>
            <EuiSpacer size="xxl" />
          </EuiFlexItem>
          <EuiFlexItem>
            <ContentPanel title={'Alerts'} actions={[
              this.state.tab === 'findings'
                ? this.createAcknowledgeControl()
                : this.createAcknowledgeControlForCorrelations()
            ]}>
              <EuiTabs>
                <EuiTab onClick={() => this.setState({ tab: 'findings' })} isSelected={this.state.tab === 'findings'}>
                  Findings
                </EuiTab>
                <EuiTab onClick={() => this.setState({ tab: 'correlations' })} isSelected={this.state.tab === 'correlations'}>
                  <EuiToolTip content="This object was created using an experimental feature. It may not appear in view if the feature is discontinued.">
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span style={{ marginRight: '4px' }}>Correlations</span>
                      <EuiIcon type="beaker" />
                    </div>
                  </EuiToolTip>
                </EuiTab>
              </EuiTabs>
              {this.state.tab === 'findings' && (
                // Content for the "Findings" tab
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
                  message={widgetEmptyMessage}
                />
              )}
              {this.state.tab === 'correlations' && (
                <EuiInMemoryTable
                  columns={this.getCorrelationColumns()}
                  items={alertsFiltered ? filteredCorrelationAlerts : correlationAlerts}
                  itemId={(item) => `${item.id}`}
                  isSelectable={true}
                  pagination
                  search={correlationSearch}
                  sorting={sorting}
                  selection={correlationSelection}
                  loading={loading}
                  message={widgetEmptyCorrelationMessage}
                />
              )}
            </ContentPanel>
          </EuiFlexItem>

        </EuiFlexGroup>
      </>
    );
  }
}

export default withRouter<AlertsProps, React.ComponentType<AlertsProps>>(Alerts);
