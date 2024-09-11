/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
import { RouteComponentProps, withRouter, match } from 'react-router-dom';
import { ContentPanel } from '../../../../components/ContentPanel';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiPanel,
  EuiSpacer,
  EuiCompressedSuperDatePicker,
  EuiText,
  EuiEmptyPrompt,
  EuiLink,
  EuiTabbedContent,
} from '@elastic/eui';
import FindingsTable from '../../components/FindingsTable';
import {
  DetectorsService,
  NotificationsService,
  OpenSearchService,
  IndexPatternsService,
  CorrelationService,
} from '../../../../services';
import {
  BREADCRUMBS,
  DEFAULT_DATE_RANGE,
  DEFAULT_EMPTY_DATA,
  FindingTabId,
  MAX_RECENTLY_USED_TIME_RANGES,
} from '../../../../utils/constants';
import {
  getChartTimeUnit,
  getDomainRange,
  getFindingsVisualizationSpec,
  getThreatIntelFindingsVisualizationSpec,
  TimeUnit,
} from '../../../Overview/utils/helpers';
import {
  getNotificationChannels,
  parseNotificationChannelsToOptions,
} from '../../../CreateDetector/components/ConfigureAlerts/utils/helpers';
import {
  createSelectComponent,
  errorNotificationToast,
  renderVisualization,
  getDuration,
  getIsNotificationPluginInstalled,
  setBreadcrumbs,
  isThreatIntelQuery,
} from '../../../../utils/helpers';
import { RuleSource } from '../../../../../server/models/interfaces';
import { NotificationsStart } from 'opensearch-dashboards/public';
import { ChartContainer } from '../../../../components/Charts/ChartContainer';
import { DataStore } from '../../../../store/DataStore';
import { DurationRange } from '@elastic/eui/src/components/date_picker/types';
import {
  DataSourceProps,
  FeatureChannelList,
  DateTimeFilter,
  FindingItemType,
  DetectorHit,
  ThreatIntelFinding,
  ThreatIntelFindingsGroupByType,
} from '../../../../../types';
import { ThreatIntelFindingsTable } from '../../components/FindingsTable/ThreatIntelFindingsTable';
import { PageHeader } from '../../../../components/PageHeader/PageHeader';
import { RuleSeverityValue, RuleSeverityPriority } from '../../../Rules/utils/constants';

interface FindingsProps extends RouteComponentProps, DataSourceProps {
  detectorService: DetectorsService;
  correlationService: CorrelationService;
  notificationsService: NotificationsService;
  indexPatternsService: IndexPatternsService;
  opensearchService: OpenSearchService;
  notifications: NotificationsStart;
  match: match<{ detectorId?: string }>;
  dateTimeFilter?: DateTimeFilter;
  setDateTimeFilter?: Function;
}

interface DetectionRulesFindingsState {
  findings: FindingItemType[];
  rules: { [id: string]: RuleSource };
  groupBy: FindingsGroupByType;
  filteredFindings: FindingItemType[];
  emptyPromptBody: React.ReactNode;
}

interface ThreatIntelFindingsState {
  findings: ThreatIntelFinding[];
  groupBy: ThreatIntelFindingsGroupByType;
  filteredFindings: ThreatIntelFinding[];
  emptyPromptBody: React.ReactNode;
}

interface FindingsState {
  loading: boolean;
  selectedTabId: FindingTabId;
  findingStateByTabId: {
    [FindingTabId.DetectionRules]: DetectionRulesFindingsState;
    [FindingTabId.ThreatIntel]: ThreatIntelFindingsState;
  };
  notificationChannels: FeatureChannelList[];
  recentlyUsedRanges: DurationRange[];
  timeUnit: TimeUnit;
  dateFormat: string;
}

interface FindingVisualizationData {
  time: number;
  finding: number;
  logType: string;
  ruleSeverity: string;
}

interface ThreatIntelFindingVisualizationData {
  time: number;
  finding: number;
  indicatorType: string;
}

type FindingsGroupByType = 'logType' | 'ruleSeverity';

export const groupByOptionsByTabId = {
  [FindingTabId.DetectionRules]: [
    { text: 'Log type', value: 'logType' },
    { text: 'Rule severity', value: 'ruleSeverity' },
  ],
  [FindingTabId.ThreatIntel]: [{ text: 'Indicator type', value: 'indicatorType' }],
};

class Findings extends Component<FindingsProps, FindingsState> {
  private abortGetFindingsControllers: AbortController[] = [];

  constructor(props: FindingsProps) {
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
      notificationChannels: [],
      selectedTabId:
        (searchParams.get('detectionType') as FindingTabId) ?? FindingTabId.DetectionRules,
      findingStateByTabId: {
        [FindingTabId.DetectionRules]: {
          findings: [],
          rules: {},
          filteredFindings: [],
          groupBy: 'logType',
          emptyPromptBody: (
            <p>
              Adjust the time range to see more results or{' '}
              <EuiLink href={`${location.pathname}#/create-detector`}>create a detector</EuiLink> to
              generate findings.
            </p>
          ),
        },
        [FindingTabId.ThreatIntel]: {
          findings: [],
          filteredFindings: [],
          groupBy: 'indicatorType',
          emptyPromptBody: (
            <p>
              Adjust the time range to see more results or{' '}
              <EuiLink href={`${location.pathname}#/threat-intel`}>setup threat intel</EuiLink> to
              generate findings.
            </p>
          ),
        },
      },
      recentlyUsedRanges: [DEFAULT_DATE_RANGE],
      timeUnit: timeUnits.timeUnit,
      dateFormat: timeUnits.dateFormat,
    };
  }

  shouldUpdateVisualization(prevState: FindingsState) {
    const { selectedTabId, findingStateByTabId } = this.state;
    const { findingStateByTabId: prevFindingStateByTabId } = prevState;
    let currentFindingsState, prevFindingsState;

    switch (selectedTabId) {
      case FindingTabId.DetectionRules:
        currentFindingsState = findingStateByTabId[FindingTabId.DetectionRules];
        prevFindingsState = prevFindingStateByTabId[FindingTabId.DetectionRules];
        return (
          currentFindingsState.filteredFindings !== prevFindingsState.filteredFindings ||
          currentFindingsState.groupBy !== prevFindingsState.groupBy
        );

      case FindingTabId.ThreatIntel:
        currentFindingsState = findingStateByTabId[FindingTabId.ThreatIntel];
        prevFindingsState = prevFindingStateByTabId[FindingTabId.ThreatIntel];
        return (
          currentFindingsState.filteredFindings !== prevFindingsState.filteredFindings ||
          currentFindingsState.groupBy !== prevFindingsState.groupBy
        );

      default:
        return false;
    }
  }

  componentDidUpdate(prevProps: Readonly<FindingsProps>, prevState: Readonly<FindingsState>): void {
    if (
      this.props.dataSource !== prevProps.dataSource ||
      this.state.selectedTabId !== prevState.selectedTabId
    ) {
      this.onRefresh();
    } else if (this.shouldUpdateVisualization(prevState)) {
      renderVisualization(this.generateVisualizationSpec(), 'findings-view');
    }
  }

  componentDidMount = async () => {
    setBreadcrumbs([BREADCRUMBS.FINDINGS]);
    this.onRefresh();
  };

  componentWillUnmount(): void {
    this.abortGetFindings();
  }

  onRefresh = async () => {
    await this.getNotificationChannels();
    if (this.state.selectedTabId === FindingTabId.DetectionRules) {
      await this.getDetectionRulesFindings();
    } else if (this.state.selectedTabId === FindingTabId.ThreatIntel) {
      await this.getThreatIntelFindings();
    }
    renderVisualization(this.generateVisualizationSpec(), 'findings-view');
  };

  setStateForTab<T extends FindingTabId, F extends keyof FindingsState['findingStateByTabId'][T]>(
    {
      tabId,
      field,
      value,
    }: { tabId: T; field: F; value: FindingsState['findingStateByTabId'][T][F] },
    otherState?: Partial<Pick<FindingsState, keyof Omit<FindingsState, 'findingStateByTabId'>>>
  ) {
    this.setState({
      ...(otherState as any),
      findingStateByTabId: {
        ...this.state.findingStateByTabId,
        [tabId]: {
          ...this.state.findingStateByTabId[tabId],
          [field]: value,
        },
      },
    });
  }

  onStreamingFindings = async (findings: FindingItemType[]) => {
    const ruleIds = new Set<string>();
    findings.forEach((finding) => {
      finding.queries.forEach((rule) => ruleIds.add(rule.id));
    });

    await this.getRules(Array.from(ruleIds));
    this.setStateForTab({
      tabId: FindingTabId.DetectionRules,
      field: 'findings',
      value: [...this.state.findingStateByTabId[FindingTabId.DetectionRules].findings, ...findings],
    });
  };

  onStreamingThreatIntelFindings = async (findings: ThreatIntelFinding[]) => {
    this.setStateForTab({
      tabId: FindingTabId.ThreatIntel,
      field: 'findings',
      value: [...this.state.findingStateByTabId[FindingTabId.ThreatIntel].findings, ...findings],
    });
  };

  abortGetFindings = () => {
    this.abortGetFindingsControllers.forEach((controller) => {
      controller.abort();
    });
  };

  getDetectionRulesFindings = async () => {
    this.abortGetFindings();
    this.setStateForTab(
      {
        tabId: FindingTabId.DetectionRules,
        field: 'findings',
        value: [],
      },
      {
        loading: true,
      }
    );
    const { detectorService, notifications, dateTimeFilter } = this.props;
    const abortController = new AbortController();
    this.abortGetFindingsControllers.push(abortController);
    try {
      const detectorId = this.props.match.params['detectorId'];
      const duration = dateTimeFilter ? getDuration(dateTimeFilter) : undefined;

      // Not looking for findings from specific detector
      if (!detectorId) {
        await DataStore.findings.getAllFindings(
          abortController.signal,
          duration,
          this.onStreamingFindings
        );
      } else {
        // get findings for a detector
        const getDetectorResponse = await detectorService.getDetectorWithId(detectorId);

        if (getDetectorResponse.ok) {
          const detectorHit: DetectorHit = {
            _id: getDetectorResponse.response._id,
            _index: '',
            _source: getDetectorResponse.response.detector,
          };
          await DataStore.findings.getFindingsPerDetector(
            detectorId,
            detectorHit,
            abortController.signal,
            duration,
            this.onStreamingFindings
          );
        } else {
          errorNotificationToast(notifications, 'retrieve', 'findings', getDetectorResponse.error);
        }
      }
    } catch (e) {
      errorNotificationToast(notifications, 'retrieve', 'findings', e);
    }
    this.setState({ loading: false });
  };

  getThreatIntelFindings = async () => {
    try {
      this.abortGetFindings();
      this.setStateForTab(
        {
          tabId: FindingTabId.ThreatIntel,
          field: 'findings',
          value: [],
        },
        {
          loading: true,
        }
      );
      const duration = this.props.dateTimeFilter
        ? getDuration(this.props.dateTimeFilter)
        : undefined;
      const abortController = new AbortController();
      this.abortGetFindingsControllers.push(abortController);
      await DataStore.threatIntel.getAllThreatIntelFindings(
        abortController.signal,
        duration,
        this.onStreamingThreatIntelFindings
      );
    } catch (e: any) {}
    this.setState({ loading: false });
  };

  getRules = async (ruleIds: string[]) => {
    const { notifications } = this.props;
    try {
      const rules = await DataStore.rules.getAllRules({
        _id: ruleIds,
      });

      const allRules: { [id: string]: RuleSource } = {
        ...this.state.findingStateByTabId[FindingTabId.DetectionRules].rules,
      };
      rules.forEach((hit) => (allRules[hit._id] = hit._source));

      this.setStateForTab({
        tabId: FindingTabId.DetectionRules,
        field: 'rules',
        value: allRules,
      });
    } catch (e) {
      errorNotificationToast(notifications, 'retrieve', 'rules', e);
    }
  };

  getNotificationChannels = async () => {
    const channels = await getNotificationChannels(this.props.notificationsService);
    this.setState({ notificationChannels: channels });
  };

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

  generateVisualizationSpec() {
    const visData: (FindingVisualizationData | ThreatIntelFindingVisualizationData)[] = [];
    const { selectedTabId, findingStateByTabId } = this.state;

    const findingsState =
      selectedTabId === FindingTabId.DetectionRules
        ? findingStateByTabId[FindingTabId.DetectionRules]
        : findingStateByTabId[FindingTabId.ThreatIntel];
    const groupBy = findingsState.groupBy;
    let specGetter;

    if (selectedTabId === FindingTabId.DetectionRules) {
      (findingsState.filteredFindings as FindingItemType[]).forEach((finding: FindingItemType) => {
        const findingTime = new Date(finding.timestamp);
        findingTime.setMilliseconds(0);
        findingTime.setSeconds(0);
        finding.detectionType === 'Threat intelligence';
        const ruleLevel =
          finding.detectionType === 'Threat intelligence'
            ? 'high'
            : (findingsState as DetectionRulesFindingsState).rules[finding.queries[0].id]?.level ||
              DEFAULT_EMPTY_DATA;
        visData.push({
          finding: 1,
          time: findingTime.getTime(),
          logType: finding.detector._source.detector_type,
          ruleSeverity:
            ruleLevel === 'critical' ? ruleLevel : (finding as any)['ruleSeverity'] || ruleLevel,
        });
      });
      specGetter = getFindingsVisualizationSpec;
    } else {
      (findingsState.findings as ThreatIntelFinding[]).forEach((finding) => {
        const findingTime = new Date(finding.timestamp);
        findingTime.setMilliseconds(0);
        findingTime.setSeconds(0);

        visData.push({
          finding: 1,
          time: findingTime.getTime(),
          indicatorType: finding.ioc_type,
        });
      });
      specGetter = getThreatIntelFindingsVisualizationSpec;
    }
    const {
      dateTimeFilter = {
        startTime: DEFAULT_DATE_RANGE.start,
        endTime: DEFAULT_DATE_RANGE.end,
      },
    } = this.props;
    const chartTimeUnits = getChartTimeUnit(dateTimeFilter.startTime, dateTimeFilter.endTime);

    return specGetter(visData, groupBy, {
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
      groupByOptionsByTabId[this.state.selectedTabId],
      this.state.findingStateByTabId[this.state.selectedTabId].groupBy,
      'findings-vis-groupBy',
      (event: React.ChangeEvent<HTMLSelectElement>) => {
        const groupBy = event.target.value as FindingsGroupByType;
        this.setStateForTab({
          tabId: this.state.selectedTabId,
          field: 'groupBy',
          value: groupBy,
        });
      }
    );
  }

  onFindingsFiltered = (findings: FindingItemType[]) => {
    this.setStateForTab({
      tabId: FindingTabId.DetectionRules,
      field: 'filteredFindings',
      value: findings,
    });
  };

  render() {
    const {
      loading,
      notificationChannels,
      recentlyUsedRanges,
      selectedTabId,
      findingStateByTabId,
    } = this.state;
    let findings = findingStateByTabId[selectedTabId].findings;
    const rules = findingStateByTabId[FindingTabId.DetectionRules].rules;

    const {
      dateTimeFilter = {
        startTime: DEFAULT_DATE_RANGE.start,
        endTime: DEFAULT_DATE_RANGE.end,
      },
    } = this.props;
    if (selectedTabId === FindingTabId.DetectionRules && Object.keys(rules).length > 0) {
      findings = findings.map((finding: any) => {
        const matchedRules: RuleSource[] = [];
        finding.queries.forEach((query: any) => {
          if (rules[query.id]) {
            matchedRules.push(rules[query.id]);
          }
        });

        matchedRules.sort((a, b) => {
          return RuleSeverityPriority[a.level as RuleSeverityValue] <
            RuleSeverityPriority[b.level as RuleSeverityValue]
            ? -1
            : 1;
        });

        finding['ruleName'] =
          matchedRules[0]?.title ||
          (finding.queries.find(({ id }) => isThreatIntelQuery(id))
            ? 'Threat intel'
            : DEFAULT_EMPTY_DATA);
        finding['ruleSeverity'] =
          matchedRules[0]?.level === 'critical'
            ? 'critical'
            : finding['ruleSeverity'] || matchedRules[0]?.level || DEFAULT_EMPTY_DATA;
        finding['tags'] = matchedRules[0]?.tags || [];
        return finding;
      });
    }

    const tabs = [
      {
        id: FindingTabId.DetectionRules,
        name: (
          <span>
            Detection rules (
            {findingStateByTabId[FindingTabId.DetectionRules].filteredFindings.length})
          </span>
        ),
        content: (
          <>
            <EuiSpacer />
            <FindingsTable
              {...this.props}
              history={this.props.history}
              findings={findings as FindingItemType[]}
              loading={loading}
              rules={rules}
              startTime={dateTimeFilter.startTime}
              endTime={dateTimeFilter.endTime}
              onRefresh={this.onRefresh}
              notificationChannels={parseNotificationChannelsToOptions(notificationChannels)}
              refreshNotificationChannels={this.getNotificationChannels}
              onFindingsFiltered={this.onFindingsFiltered}
              hasNotificationsPlugin={getIsNotificationPluginInstalled()}
              correlationService={this.props.correlationService}
            />
          </>
        ),
      },
      {
        id: FindingTabId.ThreatIntel,
        name: (
          <span>
            Threat intel{' '}
            {this.state.selectedTabId === FindingTabId.ThreatIntel
              ? `(${findingStateByTabId[FindingTabId.ThreatIntel].findings.length})`
              : null}
          </span>
        ),
        content: (
          <>
            <EuiSpacer />
            <ThreatIntelFindingsTable
              findingItems={findingStateByTabId[FindingTabId.ThreatIntel].findings}
            />
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
      <EuiFlexGroup direction="column">
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
                  <h1>Findings</h1>
                </EuiText>
              </EuiFlexItem>
              <EuiFlexItem grow={false}>{datePicker}</EuiFlexItem>
            </EuiFlexGroup>
            <EuiSpacer size={'m'} />
          </EuiFlexItem>
        </PageHeader>
        <EuiFlexItem>
          <EuiPanel>
            <EuiFlexGroup direction="column">
              <EuiFlexItem style={{ alignSelf: 'flex-end' }}>
                {this.createGroupByControl()}
              </EuiFlexItem>
              <EuiFlexItem>
                {!findings || findings.length === 0 ? (
                  <EuiEmptyPrompt
                    title={
                      <EuiText size="s">
                        <h2>No findings</h2>
                      </EuiText>
                    }
                    body={
                      <EuiText size="s">
                        {this.state.findingStateByTabId[this.state.selectedTabId].emptyPromptBody}
                      </EuiText>
                    }
                  />
                ) : (
                  <ChartContainer chartViewId={'findings-view'} loading={loading} />
                )}
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiPanel>

          <EuiSpacer size={'xxl'} />
        </EuiFlexItem>

        <EuiFlexItem>
          <ContentPanel title={'Findings'}>
            <EuiTabbedContent
              tabs={tabs}
              size="s"
              initialSelectedTab={tabs.find(({ id }) => id === selectedTabId) ?? tabs[0]}
              onTabClick={(tab) => {
                this.setState({ selectedTabId: tab.id as FindingTabId });
              }}
            />
          </ContentPanel>
        </EuiFlexItem>
      </EuiFlexGroup>
    );
  }
}

export default withRouter(Findings);
