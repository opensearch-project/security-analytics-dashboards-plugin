/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  CriteriaWithPagination,
  EuiBasicTable,
  EuiBasicTableColumn,
  EuiCompressedFieldSearch,
  EuiFilterGroup,
  EuiSmallButton,
  EuiSmallButtonIcon,
  EuiFlexGroup,
  EuiFlexItem,
  EuiInMemoryTable,
  EuiLink,
  EuiPanel,
  EuiSpacer,
  EuiCompressedSuperDatePicker,
  EuiToolTip,
  EuiEmptyPrompt,
  EuiTableSelectionType,
  EuiTabbedContent,
  EuiText,
} from '@elastic/eui';
import { FieldValueSelectionFilterConfigType } from '@elastic/eui/src/components/search_bar/filters/field_value_selection_filter';
import dateMath from '@elastic/datemath';
import React, { Component } from 'react';
import { debounce } from 'lodash';
import { ContentPanel } from '../../../../components/ContentPanel';
import { getChartTimeUnit, TimeUnit } from '../../../Overview/utils/helpers';
import moment from 'moment';
import {
  ALERT_STATE,
  AlertTabId,
  BREADCRUMBS,
  DEFAULT_DATE_RANGE,
  DEFAULT_EMPTY_DATA,
  MAX_ALERTS_RESULT_WINDOW,
  MAX_RECENTLY_USED_TIME_RANGES,
} from '../../../../utils/constants';
import AlertsService from '../../../../services/AlertsService';
import DetectorService from '../../../../services/DetectorService';
import { AlertFlyout } from '../../components/AlertFlyout/AlertFlyout';
import { CorrelationAlertFlyout } from '../../components/CorrelationAlertFlyout/CorrelationAlertFlyout';
import {
  CorrelationService,
  FindingsService,
  IndexPatternsService,
  OpenSearchService,
} from '../../../../services';
import { parseAlertSeverityToOption } from '../../../CreateDetector/components/ConfigureAlerts/utils/helpers';
import { AlertSeverity, DISABLE_ACKNOWLEDGED_ALERT_HELP_TEXT } from '../../utils/constants';
import {
  ALERTS_PAGE_SIZE_OPTIONS,
  ALERTS_TABLE_SORT_FIELDS,
  AlertsTableQuery,
  DEFAULT_ALERTS_TABLE_QUERY,
  getAlertsPageParams,
  getAlertsSearchString,
  getAlertsTableColumnField,
} from '../../utils/helpers';
import { AlertsMultiSelectFilter } from '../../components/AlertsMultiSelectFilter/AlertsMultiSelectFilter';
import {
  capitalizeFirstLetter,
  createSelectComponent,
  errorNotificationToast,
  getDuration,
  renderTime,
  setBreadcrumbs,
  successNotificationToast,
} from '../../../../utils/helpers';
import { NotificationsStart } from 'opensearch-dashboards/public';
import { match, RouteComponentProps, withRouter } from 'react-router-dom';
import {
  AlertItem,
  CorrelationAlertTableItem,
  DataSourceProps,
  DateTimeFilter,
  Detector,
  SearchDetectorsResponse,
  ServerResponse,
  ThreatIntelAlert,
} from '../../../../../types';
import { DurationRange } from '@elastic/eui/src/components/date_picker/types';
import { DataStore } from '../../../../store/DataStore';
import { AlertsPageResult } from '../../../../store/AlertsStore';
import { ThreatIntelAlertsTable } from '../../components/ThreatIntelAlertsTable/ThreatIntelAlertsTable';
import { PageHeader } from '../../../../components/PageHeader/PageHeader';
// import { createBarChartWrapper } from '../../../../utils/chartUtils';

type FilterAlertParams =
  | { alerts: AlertItem[]; timeField: 'last_notification_time' }
  | { alerts: CorrelationAlertTableItem[]; timeField: 'start_time' }
  | { alerts: ThreatIntelAlert[]; timeField: 'start_time' };

export interface AlertsProps extends RouteComponentProps, DataSourceProps {
  alertService: AlertsService;
  detectorService: DetectorService;
  findingService: FindingsService;
  opensearchService: OpenSearchService;
  correlationService: CorrelationService;
  notifications: NotificationsStart;
  indexPatternService: IndexPatternsService;
  match: match<{ detectorId: string }>;
  dateTimeFilter: DateTimeFilter;
  setDateTimeFilter?: Function;
}

export interface AlertsState {
  groupBy: string;
  recentlyUsedRanges: DurationRange[];
  selectedDetectionRuleAlertItems: AlertItem[];
  selectedCorrelationsAlertItems: CorrelationAlertTableItem[];
  selectedThreatIntelAlertItems: ThreatIntelAlert[];
  alerts: AlertItem[];
  correlationAlerts: CorrelationAlertTableItem[];
  threatIntelAlerts: ThreatIntelAlert[];
  flyoutData?: { alertItem: AlertItem };
  flyoutCorrelationData?: { alertItem: CorrelationAlertTableItem };
  alertsFiltered: boolean;
  filteredCorrelationAlerts: CorrelationAlertTableItem[];
  filteredAlerts: AlertItem[];
  filteredThreatIntelAlerts: ThreatIntelAlert[];
  detectors: { [key: string]: Detector };
  loading: boolean;
  timeUnit: TimeUnit;
  dateFormat: string;
  widgetEmptyMessage?: React.ReactNode;
  widgetEmptyCorrelationMessage?: React.ReactNode;
  widgetEmptyThreatIntelMessage?: React.ReactNode;
  selectedTabId: AlertTabId;
  // Whether the detection rule alerts are paged, sorted and filtered by the backend. Older
  // backends can't get the alerts of all detectors at once, then all alerts are loaded instead.
  // Kept unchanged while it's unknown whether the backend of the data source supports paging.
  alertsServerSide: boolean;
  alertsTableQuery: AlertsTableQuery;
  alertsSearchInput: string;
  // Total number of alerts matching the query (capped at the max result window by the backend)
  alertsTotal?: number;
}

export const alertsGroupByOptions = [
  { text: 'Alert status', value: 'status' },
  { text: 'Alert severity', value: 'severity' },
];

const ALERTS_VIEW_CHART = 'alerts-view';

const ALERTS_SEARCH_DEBOUNCE_MS = 300;

const alertSeverityFilterOptions = Object.values(AlertSeverity).map((severity) => ({
  value: severity,
  label: parseAlertSeverityToOption(severity)?.label || severity,
}));

const alertStatusFilterOptions = Object.values(ALERT_STATE).map((state) => ({
  value: state,
  label: capitalizeFirstLetter(state),
}));

export class Alerts extends Component<AlertsProps, AlertsState> {
  private abortControllers: AbortController[] = [];
  // Id of the latest alerts page request; responses of older requests are ignored.
  private alertsRequestId = 0;
  // Id of the latest detectors request; responses of older requests are ignored.
  private detectorsRequestId = 0;
  private alertsTableRef = React.createRef<EuiBasicTable<AlertItem>>();

  constructor(props: AlertsProps) {
    super(props);

    const {
      dateTimeFilter = {
        startTime: DEFAULT_DATE_RANGE.start,
        endTime: DEFAULT_DATE_RANGE.end,
      },
    } = props;
    const timeUnits = getChartTimeUnit(dateTimeFilter.startTime, dateTimeFilter.endTime);
    const searchParams = new URLSearchParams(props.location.search);
    this.state = {
      loading: true,
      groupBy: 'status',
      recentlyUsedRanges: [DEFAULT_DATE_RANGE],
      selectedDetectionRuleAlertItems: [],
      selectedCorrelationsAlertItems: [],
      selectedThreatIntelAlertItems: [],
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
      selectedTabId: (searchParams.get('detectionType') as AlertTabId) ?? AlertTabId.DetectionRules,
      threatIntelAlerts: [],
      filteredThreatIntelAlerts: [],
      alertsServerSide: DataStore.alerts.getAlertsServerSideSupport() !== 'unsupported',
      alertsTableQuery: DEFAULT_ALERTS_TABLE_QUERY,
      alertsSearchInput: '',
    };
  }

  componentDidUpdate(prevProps: Readonly<AlertsProps>, prevState: Readonly<AlertsState>) {
    const defaultDateTimeFilter = {
      startTime: DEFAULT_DATE_RANGE.start,
      endTime: DEFAULT_DATE_RANGE.end,
    };
    const { dateTimeFilter = defaultDateTimeFilter } = this.props;
    const { dateTimeFilter: prevDateTimeFilter = defaultDateTimeFilter } = prevProps;
    const timeFilterChanged =
      prevDateTimeFilter.startTime !== dateTimeFilter.startTime ||
      prevDateTimeFilter.endTime !== dateTimeFilter.endTime;
    const detectorIdChanged =
      prevProps.match.params?.detectorId !== this.props.match.params?.detectorId;
    const pagedDetectionRuleAlerts =
      this.state.selectedTabId === AlertTabId.DetectionRules && this.state.alertsServerSide;

    if (this.props.dataSource !== prevProps.dataSource) {
      // Start on the first page with the alerts of another data source, and don't keep showing the
      // alerts of the previous one if loading the new ones fails.
      this.setState(
        {
          alertsTableQuery: { ...this.state.alertsTableQuery, pageIndex: 0 },
          alerts: [],
          filteredAlerts: [],
          alertsTotal: undefined,
          detectors: {},
          selectedDetectionRuleAlertItems: [],
        },
        this.onRefresh
      );
    } else if (prevState.selectedTabId !== this.state.selectedTabId) {
      this.onRefresh();
    } else if (pagedDetectionRuleAlerts && (timeFilterChanged || detectorIdChanged)) {
      this.updateAlertsTableQuery({ pageIndex: 0 });
    } else if (timeFilterChanged) {
      this.filterAlertsOnStateChange(prevState);
    } else if (this.state.groupBy !== prevState.groupBy) {
      this.renderVisAsPerTab();
    }
  }

  filterAlertsOnStateChange(prevState: AlertsState) {
    switch (this.state.selectedTabId) {
      case AlertTabId.DetectionRules:
        const alertsChanged =
          prevState.alerts !== this.state.alerts ||
          prevState.alerts.length !== this.state.alerts.length;
        if (alertsChanged) {
          this.filterDeletectionRuleAlerts(this.state.alerts);
        }
        break;

      case AlertTabId.Correlations:
        const correlationAlertsChanged =
          prevState.correlationAlerts !== this.state.correlationAlerts ||
          prevState.correlationAlerts.length !== this.state.correlationAlerts.length;
        if (correlationAlertsChanged) {
          this.filterCorrelationAlerts();
        }
        break;

      case AlertTabId.ThreatIntel:
        const threatIntelAlertsChanged =
          prevState.threatIntelAlerts !== this.state.threatIntelAlerts ||
          prevState.threatIntelAlerts.length !== this.state.threatIntelAlerts.length;
        if (threatIntelAlertsChanged) {
          this.filterThreatIntelAlerts();
        }
        break;
    }
  }

  filterAlerts = ({ alerts, timeField }: FilterAlertParams) => {
    const {
      dateTimeFilter = {
        startTime: DEFAULT_DATE_RANGE.start,
        endTime: DEFAULT_DATE_RANGE.end,
      },
    } = this.props;
    const startMoment = dateMath.parse(dateTimeFilter.startTime);
    const endMoment = dateMath.parse(dateTimeFilter.endTime);
    return alerts.filter((correlationAlert) =>
      moment((correlationAlert as any)[timeField]).isBetween(moment(startMoment), moment(endMoment))
    );
  };

  filterDeletectionRuleAlerts = (alerts: AlertItem[] = []) => {
    const filteredAlerts = this.filterAlerts({ alerts, timeField: 'last_notification_time' });
    this.setState({
      alertsFiltered: true,
      filteredAlerts: filteredAlerts as AlertItem[],
      widgetEmptyMessage: filteredAlerts.length ? undefined : (
        <EuiEmptyPrompt
          body={
            <EuiText size="s">
              <span style={{ display: 'block' }}>No alerts.</span>Adjust the time range to see more
              results.
            </EuiText>
          }
        />
      ),
    });
    // this.getChart(this.getVisData(filteredAlerts));
  };

  filterCorrelationAlerts = () => {
    const { correlationAlerts } = this.state;
    const filteredCorrelationAlerts = this.filterAlerts({
      alerts: correlationAlerts,
      timeField: 'start_time',
    });

    this.setState({
      alertsFiltered: true,
      filteredCorrelationAlerts: filteredCorrelationAlerts as CorrelationAlertTableItem[],
      widgetEmptyCorrelationMessage: filteredCorrelationAlerts.length ? undefined : (
        <EuiEmptyPrompt
          body={
            <EuiText size="s">
              <span style={{ display: 'block' }}>No alerts.</span>Adjust the time range to see more
              results.
            </EuiText>
          }
        />
      ),
    });
    // this.getChart(this.getVisData(filteredCorrelationAlerts));
  };

  filterThreatIntelAlerts = () => {
    const { threatIntelAlerts } = this.state;
    const filteredAlerts = this.filterAlerts({
      alerts: threatIntelAlerts,
      timeField: 'start_time',
    });

    this.setState({
      alertsFiltered: true,
      filteredThreatIntelAlerts: filteredAlerts as ThreatIntelAlert[],
      widgetEmptyThreatIntelMessage: filteredAlerts.length ? undefined : (
        <EuiEmptyPrompt
          body={
            <EuiText size="s">
              <span style={{ display: 'block' }}>No alerts.</span>Adjust the time range to see more
              results.
            </EuiText>
          }
        />
      ),
    });
    // this.getChart(this.getVisData(filteredAlerts));
  };

  private renderVisAsPerTab() {
    switch (this.state.selectedTabId) {
      case AlertTabId.DetectionRules:
        // this.getChart(this.getVisData(this.state.filteredAlerts));
        break;
      case AlertTabId.Correlations:
        // this.getChart(this.getVisData(this.state.filteredCorrelationAlerts));
        break;
      case AlertTabId.ThreatIntel:
        // this.getChart(this.getVisData(this.state.filteredThreatIntelAlerts));
        break;
    }
  }

  private getAlertsAsPerTab() {
    const abortSignal = this.createAbortSignal();

    switch (this.state.selectedTabId) {
      case AlertTabId.DetectionRules:
        this.getDetectionRuleAlerts(abortSignal);
        break;

      case AlertTabId.Correlations:
        this.getCorrelationAlerts();
        break;

      case AlertTabId.ThreatIntel:
        this.getThreatIntelAlerts(abortSignal);
        break;
    }
  }

  private createAbortSignal() {
    this.abortPendingGetAlerts();
    const abortController = new AbortController();
    this.abortControllers.push(abortController);
    return abortController.signal;
  }

  private getDetectionRuleAlerts(abortSignal: AbortSignal) {
    // The data source might have changed, so check again which way the alerts can be loaded.
    if (DataStore.alerts.getAlertsServerSideSupport() === 'unsupported') {
      if (this.state.alertsServerSide) {
        this.setState({ alertsServerSide: false });
      }
      this.getAlerts(abortSignal);
      return;
    }

    // The detectors are only needed for their names and the flyout, so load them in parallel.
    const detectorsRequest = this.loadDetectors();
    this.getAlertsPage(this.state.alertsTableQuery, { detectorsRequest });
  }

  private loadDetectors = async (): Promise<ServerResponse<SearchDetectorsResponse>> => {
    const requestId = ++this.detectorsRequestId;
    const { detectorService, notifications } = this.props;
    let detectorsRes: ServerResponse<SearchDetectorsResponse>;
    try {
      detectorsRes = await detectorService.getDetectors();
    } catch (e: any) {
      detectorsRes = { ok: false, error: e };
    }

    if (requestId !== this.detectorsRequestId) {
      // A newer request was made in the meantime or the page was left.
      return detectorsRes;
    }

    if (detectorsRes.ok) {
      const detectors: AlertsState['detectors'] = {};
      detectorsRes.response.hits.hits.forEach((hit) => {
        detectors[hit._id] = { ...hit._source, id: hit._id };
      });
      this.setState({ detectors });
    } else {
      errorNotificationToast(notifications, 'retrieve', 'detectors', detectorsRes.error);
    }

    return detectorsRes;
  };

  /**
   * Gets one page of detection rule alerts from the backend and shows it in the table. The rows
   * of the previous page stay visible until the response arrives. Falls back to loading all alerts
   * if the backend doesn't support getting pages of the alerts of all detectors.
   */
  private getAlertsPage = async (
    query: AlertsTableQuery,
    {
      detectorsRequest,
      jumpToLastPageIfEmpty = true,
    }: {
      // Pending detectors request to reuse if the alerts need to be loaded the old way
      detectorsRequest?: Promise<ServerResponse<SearchDetectorsResponse>>;
      // Load the last page if this page is past it, e.g. after alerts got acknowledged
      jumpToLastPageIfEmpty?: boolean;
    } = {}
  ) => {
    const requestId = ++this.alertsRequestId;
    const {
      dateTimeFilter = {
        startTime: DEFAULT_DATE_RANGE.start,
        endTime: DEFAULT_DATE_RANGE.end,
      },
      notifications,
    } = this.props;
    const detectorId = this.props.match.params?.detectorId;
    this.setState({ loading: true });

    // Older backends reject the paging, sorting, filter and search params, so only send them once
    // the backend is known to support them.
    const detection = await DataStore.alerts.detectAlertsServerSideSupport();
    if (requestId !== this.alertsRequestId) {
      // A newer request was made in the meantime.
      return;
    }

    if (detection.support === 'unsupported') {
      // Older backend, fall back to loading all alerts of every detector.
      this.setState({ alertsServerSide: false });
      this.getAlerts(this.createAbortSignal(), detectorsRequest);
      return;
    }

    if (detection.support === 'unknown') {
      // Keep the current way of loading the alerts and detect the support again on the next load.
      errorNotificationToast(notifications, 'retrieve', 'alerts', detection.error);
      this.setState({ loading: false });
      return;
    }

    let result: AlertsPageResult;
    try {
      result = await DataStore.alerts.getAlertsPage(
        getAlertsPageParams(query, getDuration(dateTimeFilter), detectorId)
      );
    } catch (e: any) {
      result = { ok: false, error: e };
    }

    if (requestId !== this.alertsRequestId) {
      // A newer request was made in the meantime.
      return;
    }

    if (!result.ok) {
      errorNotificationToast(notifications, 'retrieve', 'alerts', result.error);
      this.setState({ loading: false });
      return;
    }

    let pageQuery = query;
    // The page might be past the last page, e.g. because alerts got acknowledged meanwhile.
    const lastPageIndex = Math.max(
      0,
      Math.ceil(Math.min(result.total, MAX_ALERTS_RESULT_WINDOW) / query.pageSize) - 1
    );
    if (!result.alerts.length && query.pageIndex > lastPageIndex) {
      if (result.total > 0 && jumpToLastPageIfEmpty) {
        // Get the last page, but only once per load in case alerts keep disappearing.
        pageQuery = { ...query, pageIndex: lastPageIndex };
        this.setState({ alertsTableQuery: pageQuery });
        this.getAlertsPage(pageQuery, { jumpToLastPageIfEmpty: false });
        return;
      }

      // Show the empty last page without another request, e.g. the first page if there are no
      // alerts left at all.
      pageQuery = { ...query, pageIndex: lastPageIndex };
    }

    this.setState({
      alertsServerSide: true,
      alerts: result.alerts,
      alertsTotal: result.total,
      alertsTableQuery: pageQuery,
      loading: false,
      widgetEmptyMessage: result.alerts.length ? undefined : (
        <EuiEmptyPrompt
          body={
            <EuiText size="s">
              <span style={{ display: 'block' }}>No alerts.</span>Adjust the time range or filters
              to see more results.
            </EuiText>
          }
        />
      ),
    });
  };

  private updateAlertsTableQuery(changes: Partial<AlertsTableQuery>) {
    const query = { ...this.state.alertsTableQuery, ...changes };
    this.setState({ alertsTableQuery: query });
    this.clearDetectionRuleAlertsSelection();
    this.getAlertsPage(query);
  }

  private clearDetectionRuleAlertsSelection() {
    this.alertsTableRef.current?.setSelection([]);
    this.setState({ selectedDetectionRuleAlertItems: [] });
  }

  onAlertsTableChange = ({ page, sort }: CriteriaWithPagination<AlertItem>) => {
    const query = this.state.alertsTableQuery;
    const changes: Partial<AlertsTableQuery> = {};
    const sortField = sort ? ALERTS_TABLE_SORT_FIELDS[sort.field as string] : undefined;
    const sortDirection = sort?.direction ?? query.sortDirection;

    if (sortField && (sortField !== query.sortField || sortDirection !== query.sortDirection)) {
      changes.sortField = sortField;
      changes.sortDirection = sortDirection;
      changes.pageIndex = 0;
    }

    if (page.size !== query.pageSize) {
      changes.pageSize = page.size;
      changes.pageIndex = 0;
    }

    if (changes.pageIndex === undefined && page.index !== query.pageIndex) {
      changes.pageIndex = page.index;
    }

    if (Object.keys(changes).length) {
      this.updateAlertsTableQuery(changes);
    }
  };

  onAlertsSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ alertsSearchInput: event.target.value });
    this.debouncedApplyAlertsSearch(event.target.value);
  };

  onAlertsSearch = (search: string) => {
    this.debouncedApplyAlertsSearch.cancel();
    this.applyAlertsSearch(search);
  };

  private applyAlertsSearch = (search: string) => {
    if (
      getAlertsSearchString(search) === getAlertsSearchString(this.state.alertsTableQuery.search)
    ) {
      // Nothing to search for changed (e.g. only special characters were added).
      return;
    }

    this.updateAlertsTableQuery({ search, pageIndex: 0 });
  };

  private debouncedApplyAlertsSearch = debounce(this.applyAlertsSearch, ALERTS_SEARCH_DEBOUNCE_MS);

  onAlertSeveritiesChange = (severities: string[]) => {
    this.updateAlertsTableQuery({ severities, pageIndex: 0 });
  };

  onAlertStatusesChange = (statuses: string[]) => {
    this.updateAlertsTableQuery({ statuses, pageIndex: 0 });
  };

  private getDetectorName(alert: AlertItem & { detectorName?: string }) {
    return (
      this.state.detectors[alert.detector_id]?.name ||
      alert.detectorName ||
      alert.detector_id ||
      DEFAULT_EMPTY_DATA
    );
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
        render: (triggerName: string, alertItem: AlertItem) =>
          // The details need the detector, which might be deleted or not loaded yet.
          this.state.detectors[alertItem.detector_id] ? (
            <EuiLink onClick={() => this.setFlyout(alertItem)}>{triggerName}</EuiLink>
          ) : (
            triggerName || DEFAULT_EMPTY_DATA
          ),
      },
      {
        field: 'detectorName',
        name: 'Detector',
        sortable: true,
        dataType: 'string',
        render: (_detectorName: string, alertItem: AlertItem) => this.getDetectorName(alertItem),
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
                  <EuiSmallButtonIcon
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
                <EuiSmallButtonIcon
                  aria-label={'View details'}
                  iconType={'expand'}
                  disabled={!this.state.detectors[alertItem.detector_id]}
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
          <EuiLink onClick={() => this.setCorrelationFlyout(alertItem)}>
            {correlationRulename}
          </EuiLink>
        ),
      },
      {
        field: 'correlation_rule_categories',
        name: 'Log Types',
        sortable: false,
        dataType: 'string',
        render: (correlationRuleCategories: string[]) =>
          correlationRuleCategories.join(', ') || DEFAULT_EMPTY_DATA,
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
                  <EuiSmallButtonIcon
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
                <EuiSmallButtonIcon
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

  // getChart(data: any) {
  //   createBarChartWrapper(data, this.state.groupBy, ALERTS_VIEW_CHART, this.props.dateTimeFilter);
  // }

  getVisData(alerts: (AlertItem | CorrelationAlertTableItem | ThreatIntelAlert)[]) {
    return alerts.map((alert) => {
      const time = new Date(alert.start_time);
      time.setMilliseconds(0);
      time.setSeconds(0);

      return {
        alert: 1,
        time: time.getTime(),
        status: alert.state,
        severity: parseAlertSeverityToOption(alert.severity)?.label || alert.severity,
      };
    });
  }

  createGroupByControl(): React.ReactNode {
    return createSelectComponent(
      alertsGroupByOptions,
      this.state.groupBy,
      'alert-vis-groupBy',
      (event) => {
        this.setState({ groupBy: event.target.value });
      }
    );
  }

  componentDidMount(): void {
    setBreadcrumbs([BREADCRUMBS.ALERTS]);
    this.onRefresh();
  }

  componentWillUnmount(): void {
    this.abortPendingGetAlerts();
    // Ignore the response of a pending detectors request too.
    this.detectorsRequestId++;
    this.debouncedApplyAlertsSearch.cancel();
  }

  async getCorrelationAlerts() {
    this.setState({ loading: true, correlationAlerts: [] });
    const { correlationService, notifications } = this.props;
    try {
      const correlationRes = await correlationService.getCorrelationAlerts();
      if (correlationRes.ok) {
        const alerts = correlationRes.response.correlationAlerts;
        // Fetch correlation queries for each alert
        const enrichedAlerts = await Promise.all(
          alerts.map(async (alert) => {
            const correlation = await DataStore.correlations.getCorrelationRule(
              alert.correlation_rule_id
            );
            const correlationQueries = correlation?.queries || [];
            const correlationRuleCategories = correlationQueries.map((query) => query.logType);
            return {
              ...alert,
              correlation_rule_categories: correlationRuleCategories,
            };
          })
        );
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

  /**
   * Loads all alerts of every detector and filters them on the client. Used with backends that
   * can't page the alerts of all detectors.
   */
  async getAlerts(
    abort: AbortSignal,
    detectorsRequest: Promise<ServerResponse<SearchDetectorsResponse>> = this.loadDetectors()
  ) {
    // Keep the rows of the previous load visible until the new ones arrive.
    this.setState({ loading: true });
    const { dateTimeFilter } = this.props;
    try {
      const detectorsRes = await detectorsRequest;
      const duration = getDuration(dateTimeFilter);
      if (detectorsRes.ok) {
        const detectorId = this.props.match.params['detectorId'];
        let alerts: AlertItem[] = [];

        for (const hit of detectorsRes.response.hits.hits) {
          if (abort.aborted) {
            break;
          }

          if (!detectorId || detectorId === hit._id) {
            const detectorAlerts = await DataStore.alerts.getAlertsByDetector(
              hit._id,
              hit._source.name,
              abort,
              duration
            );
            alerts = alerts.concat(detectorAlerts);
          }
        }

        if (abort.aborted) {
          // A newer request owns the table state now.
          return;
        }

        // Update the table once with the alerts of all detectors to avoid re-rendering (and
        // resetting the pagination of) the table for every partial batch.
        this.setState({ alerts });
        this.filterDeletectionRuleAlerts(alerts);
      }
    } catch (e: any) {
      errorNotificationToast(this.props.notifications, 'retrieve', 'alerts', e);
    }

    if (!abort.aborted) {
      this.setState({ loading: false });
    }
  }

  async getThreatIntelAlerts(abort: AbortSignal) {
    this.setState({ loading: true, threatIntelAlerts: [] });
    const { dateTimeFilter } = this.props;
    const duration = getDuration(dateTimeFilter);
    await DataStore.alerts.getThreatIntelAlerts(abort, duration, (alerts) => {
      this.setState({
        threatIntelAlerts: [...this.state.threatIntelAlerts, ...alerts],
        loading: false,
      });
      this.filterThreatIntelAlerts();
    });
    this.setState({ loading: false });
  }

  createAcknowledgeControl() {
    const { selectedDetectionRuleAlertItems } = this.state;
    return (
      <EuiSmallButton
        disabled={!selectedDetectionRuleAlertItems.length}
        onClick={() => this.onAcknowledge(selectedDetectionRuleAlertItems)}
        data-test-subj={'acknowledge-button'}
      >
        Acknowledge
      </EuiSmallButton>
    );
  }

  createAcknowledgeControlForCorrelations() {
    const { selectedCorrelationsAlertItems } = this.state;
    return (
      <EuiSmallButton
        disabled={!selectedCorrelationsAlertItems.length}
        onClick={() => this.onAcknowledgeCorrelationAlert(selectedCorrelationsAlertItems)}
        data-test-subj={'acknowledge-button'}
      >
        Acknowledge
      </EuiSmallButton>
    );
  }

  createAcknowledgeControlForThreatIntel() {
    const { selectedThreatIntelAlertItems } = this.state;
    const statesOfSelectedAlerts = new Set(selectedThreatIntelAlertItems.map(({ state }) => state));
    const disableAllActions =
      !selectedThreatIntelAlertItems.length || statesOfSelectedAlerts.size > 1;
    const disableAcknowledge =
      disableAllActions || selectedThreatIntelAlertItems[0].state !== 'ACTIVE';
    const disableComplete =
      disableAllActions || selectedThreatIntelAlertItems[0].state !== 'ACKNOWLEDGED';

    return (
      <EuiFlexGroup gutterSize="s">
        <EuiFlexItem grow={false}>
          <EuiSmallButton
            disabled={disableAcknowledge}
            onClick={() =>
              this.onThreatIntelAlertStateChange(selectedThreatIntelAlertItems, 'ACKNOWLEDGED')
            }
            data-test-subj={'acknowledge-button'}
          >
            Acknowledge
          </EuiSmallButton>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiSmallButton
            disabled={disableComplete}
            onClick={() =>
              this.onThreatIntelAlertStateChange(selectedThreatIntelAlertItems, 'COMPLETED')
            }
            data-test-subj={'complete-button'}
          >
            Complete
          </EuiSmallButton>
        </EuiFlexItem>
      </EuiFlexGroup>
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
    this.abortControllers.forEach((controller) => controller.abort());
    this.abortControllers = [];
    // Ignore the response of a pending alerts page request too.
    this.alertsRequestId++;
  }

  onRefresh = async () => {
    if (this.state.alertsServerSide) {
      // The rows get replaced, and with them the selection.
      this.clearDetectionRuleAlertsSelection();
    }
    this.getAlertsAsPerTab();
    this.renderVisAsPerTab();
  };

  onSelectionChange = (selectedItems: AlertItem[]) => {
    this.setState({ selectedDetectionRuleAlertItems: selectedItems });
  };

  onCorrelationSelectionChange = (selectedItems: CorrelationAlertTableItem[]) => {
    this.setState({ selectedCorrelationsAlertItems: selectedItems });
  };

  onThreatIntelAlertSelectionChange = (items: ThreatIntelAlert[]) => {
    this.setState({ selectedThreatIntelAlertItems: items });
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
        // Alerts can only be acknowledged per detector.
        if (!item.detector_id) return;
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

    if (this.state.alertsServerSide) {
      // Reload the current page, or the last page if no alerts are left on it.
      this.updateAlertsTableQuery({});
    } else {
      this.clearDetectionRuleAlertsSelection();
      this.onRefresh();
    }
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
    this.setState({ selectedCorrelationsAlertItems: [] });
    this.onRefresh();
  };

  onThreatIntelAlertStateChange = async (
    selectedItems: ThreatIntelAlert[] = [],
    nextState: 'ACKNOWLEDGED' | 'COMPLETED'
  ): Promise<boolean> => {
    const { alertService, notifications } = this.props;
    let successCount = 0;
    const actionName = nextState === 'ACKNOWLEDGED' ? 'acknowledge' : 'complete';
    try {
      if (selectedItems.length > 0) {
        const response = await alertService.updateThreatIntelAlertsState(
          nextState,
          selectedItems.map(({ id }) => id)
        );
        if (response.ok) {
          successCount = selectedItems.length;
        } else {
          errorNotificationToast(notifications, actionName, 'alert(s)', response.error);
        }
      }
    } catch (e: any) {
      errorNotificationToast(notifications, actionName, 'alert(s)', e);
    }
    if (successCount) {
      successNotificationToast(notifications, nextState.toLowerCase(), `${successCount} alerts`);
      this.onRefresh();
    }

    this.setState({ selectedDetectionRuleAlertItems: [] });

    return successCount > 0 ? true : false;
  };

  getContelPanelActions() {
    switch (this.state.selectedTabId) {
      case AlertTabId.DetectionRules:
        return this.createAcknowledgeControl();

      case AlertTabId.Correlations:
        return this.createAcknowledgeControlForCorrelations();

      case AlertTabId.ThreatIntel:
        return this.createAcknowledgeControlForThreatIntel();

      default:
        return [];
    }
  }

  render() {
    const {
      alerts: detectionRuleAlerts,
      alertsFiltered,
      detectors,
      filteredCorrelationAlerts,
      correlationAlerts,
      flyoutCorrelationData,
      flyoutData,
      loading,
      recentlyUsedRanges,
      widgetEmptyCorrelationMessage,
      threatIntelAlerts,
      filteredThreatIntelAlerts,
      selectedTabId,
      alertsServerSide,
    } = this.state;

    let alerts = [];

    switch (selectedTabId) {
      case AlertTabId.DetectionRules:
        alerts = detectionRuleAlerts;
        break;

      case AlertTabId.Correlations:
        alerts = correlationAlerts;
        break;

      case AlertTabId.ThreatIntel:
        alerts = threatIntelAlerts;
        break;
    }

    const {
      dateTimeFilter = {
        startTime: DEFAULT_DATE_RANGE.start,
        endTime: DEFAULT_DATE_RANGE.end,
      },
    } = this.props;
    const corrSeverities = new Set<string>();
    const corrStatuses = new Set<string>();
    filteredCorrelationAlerts.forEach((alert) => {
      if (alert) {
        corrSeverities.add(alert.severity);
        corrStatuses.add(alert.state);
      }
    });

    const correlationSearch = {
      box: {
        placeholder: 'Search alerts',
        schema: true,
        compressed: true,
      },
      filters: [
        {
          type: 'field_value_selection',
          field: 'severity',
          name: 'Alert severity',
          compressed: true,
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
          compressed: true,
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

    const tabs = [
      {
        id: 'detection-rules',
        name: 'Detection rules',
        content: (
          <>
            <EuiSpacer size="m" />
            {/*{this.getAlertsGraph(alerts, loading)}*/}
            {/*<EuiSpacer size="m" />*/}
            {alertsServerSide
              ? this.renderAlertsPage(selection)
              : this.renderAllAlerts(selection, sorting)}
          </>
        ),
      },
      {
        id: 'threat-intel',
        name: 'Threat intel',
        content: (
          <>
            <EuiSpacer size="m" />
            {/*{this.getAlertsGraph(alerts, loading)}*/}
            {/*<EuiSpacer size="m" />*/}
            <ContentPanel title={'Alerts'} actions={[this.getContelPanelActions()]}>
              <ThreatIntelAlertsTable
                alerts={alertsFiltered ? filteredThreatIntelAlerts : threatIntelAlerts}
                onAlertStateChange={this.onThreatIntelAlertStateChange}
                onSelectionChange={this.onThreatIntelAlertSelectionChange}
              />
            </ContentPanel>
          </>
        ),
      },
      {
        id: 'correlations',
        name: (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ marginRight: '4px' }}>Correlations</span>
          </div>
        ),
        content: (
          <>
            <EuiSpacer size="m" />
            {/*{this.getAlertsGraph(alerts, loading)}*/}
            {/*<EuiSpacer size="m" />*/}
            <ContentPanel title={'Alerts'} actions={[this.getContelPanelActions()]}>
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
            </ContentPanel>
          </>
        ),
      },
    ];

    const datePicker = (
      <EuiCompressedSuperDatePicker
        start={dateTimeFilter.startTime}
        end={dateTimeFilter.endTime}
        recentlyUsedRanges={recentlyUsedRanges}
        isLoading={loading}
        onTimeChange={this.onTimeChange}
        onRefresh={this.onRefresh}
        updateButtonProps={{ fill: false }}
      />
    );

    return (
      <>
        {flyoutData && detectors[flyoutData.alertItem.detector_id] && (
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
          />
        )}
        <EuiFlexGroup direction="column" gutterSize={'m'}>
          <PageHeader
            appRightControls={[
              {
                renderComponent: datePicker,
              },
            ]}
          >
            <EuiFlexItem>
              <EuiFlexGroup gutterSize={'s'} justifyContent={'spaceBetween'}>
                <EuiFlexItem>
                  <EuiText size="s">
                    <h1>Security alerts</h1>
                  </EuiText>
                </EuiFlexItem>
                <EuiFlexItem grow={false}>{datePicker}</EuiFlexItem>
              </EuiFlexGroup>
            </EuiFlexItem>
          </PageHeader>

          <EuiFlexItem>
            <EuiTabbedContent
              tabs={tabs}
              size="s"
              onTabClick={({ id }) => this.setState({ selectedTabId: id as AlertTabId })}
              initialSelectedTab={tabs.find(({ id }) => id === selectedTabId) ?? tabs[0]}
            />
          </EuiFlexItem>
        </EuiFlexGroup>
      </>
    );
  }

  /**
   * All detection rule alerts, filtered, sorted and paged in memory. Used with backends that can't
   * page the alerts of all detectors.
   */
  private renderAllAlerts(selection: EuiTableSelectionType<AlertItem>, sorting: any) {
    const { alerts, alertsFiltered, filteredAlerts, loading, widgetEmptyMessage } = this.state;
    const severities = new Set<string>();
    const statuses = new Set<string>();
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
        compressed: true,
      },
      filters: [
        {
          type: 'field_value_selection',
          field: 'severity',
          name: 'Alert severity',
          compressed: true,
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
          compressed: true,
          options: Array.from(statuses).map((status) => ({
            value: status,
            name: capitalizeFirstLetter(status) || status,
          })),
          multiSelect: 'or',
        } as FieldValueSelectionFilterConfigType,
      ],
    };

    return (
      <ContentPanel title={'Alerts'} actions={[this.getContelPanelActions()]}>
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
      </ContentPanel>
    );
  }

  /**
   * Detection rule alerts paged, sorted and filtered by the backend.
   */
  private renderAlertsPage(selection: EuiTableSelectionType<AlertItem>) {
    const {
      alerts,
      alertsTableQuery,
      alertsSearchInput,
      alertsTotal,
      loading,
      widgetEmptyMessage,
    } = this.state;
    const totalCapped = alertsTotal !== undefined && alertsTotal >= MAX_ALERTS_RESULT_WINDOW;
    const totalLabel = totalCapped
      ? `${MAX_ALERTS_RESULT_WINDOW.toLocaleString('en-US')}+`
      : alertsTotal?.toLocaleString('en-US');
    const sortField = getAlertsTableColumnField(alertsTableQuery.sortField);

    return (
      <ContentPanel
        title={totalLabel === undefined ? 'Alerts' : `Alerts (${totalLabel})`}
        subTitleText={
          totalCapped
            ? 'Showing the first 10,000 matching alerts. Narrow the time range or filters to see more.'
            : undefined
        }
        actions={[this.getContelPanelActions()]}
      >
        <EuiFlexGroup gutterSize="s" alignItems="center">
          <EuiFlexItem>
            <EuiCompressedFieldSearch
              fullWidth
              isClearable
              placeholder="Search by detector or trigger name"
              aria-label="Search alerts by detector or trigger name"
              value={alertsSearchInput}
              onChange={this.onAlertsSearchChange}
              onSearch={this.onAlertsSearch}
              data-test-subj="alertsSearchField"
            />
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiFilterGroup>
              <AlertsMultiSelectFilter
                name="Alert severity"
                options={alertSeverityFilterOptions}
                selected={alertsTableQuery.severities}
                onChange={this.onAlertSeveritiesChange}
                data-test-subj="alertsSeverityFilter"
              />
              <AlertsMultiSelectFilter
                name="Status"
                options={alertStatusFilterOptions}
                selected={alertsTableQuery.statuses}
                onChange={this.onAlertStatusesChange}
                data-test-subj="alertsStatusFilter"
              />
            </EuiFilterGroup>
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiSpacer size="s" />
        <EuiBasicTable<AlertItem>
          ref={this.alertsTableRef}
          columns={this.getColumns()}
          items={alerts}
          itemId="id"
          isSelectable={true}
          selection={selection}
          pagination={{
            pageIndex: alertsTableQuery.pageIndex,
            pageSize: alertsTableQuery.pageSize,
            totalItemCount: Math.min(alertsTotal ?? 0, MAX_ALERTS_RESULT_WINDOW),
            pageSizeOptions: ALERTS_PAGE_SIZE_OPTIONS,
          }}
          sorting={
            sortField
              ? {
                  sort: {
                    field: sortField as keyof AlertItem,
                    direction: alertsTableQuery.sortDirection,
                  },
                }
              : {}
          }
          onChange={this.onAlertsTableChange}
          loading={loading}
          noItemsMessage={loading ? 'Loading alerts...' : widgetEmptyMessage}
          data-test-subj="detectionRuleAlertsTable"
        />
      </ContentPanel>
    );
  }

  private getAlertsGraph(alerts: any[], loading: boolean) {
    return (
      <EuiPanel>
        <EuiFlexGroup direction="column">
          <EuiFlexItem style={{ alignSelf: 'flex-end' }}>{this.createGroupByControl()}</EuiFlexItem>
          <EuiFlexItem>
            {!alerts || alerts.length === 0 ? (
              <EuiEmptyPrompt
                title={
                  <EuiText size="s">
                    <h2>No alerts</h2>
                  </EuiText>
                }
                body={
                  <p>
                    <EuiText size="s">
                      Adjust the time range to see more results or create alert triggers in your{' '}
                      <EuiLink href={`${location.pathname}#/detectors`}>detectors</EuiLink> to
                      generate alerts.
                    </EuiText>
                  </p>
                }
              />
            ) : (
              <div id="chart-container">
                <canvas id={ALERTS_VIEW_CHART}></canvas>
              </div>
            )}
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiPanel>
    );
  }
}

export default withRouter<AlertsProps, React.ComponentType<AlertsProps>>(Alerts);
