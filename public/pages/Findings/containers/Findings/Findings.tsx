/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
import { RouteComponentProps, withRouter, match } from 'react-router-dom';
import { ContentPanel } from '../../../../components/ContentPanel';
import {
  DurationRange,
  EuiFlexGroup,
  EuiFlexItem,
  EuiPanel,
  EuiSpacer,
  EuiSuperDatePicker,
  EuiTitle,
  EuiEmptyPrompt,
  EuiLink,
} from '@elastic/eui';
import FindingsTable from '../../components/FindingsTable';
import FindingsService from '../../../../services/FindingsService';
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
  MAX_RECENTLY_USED_TIME_RANGES,
  OS_NOTIFICATION_PLUGIN,
} from '../../../../utils/constants';
import {
  getChartTimeUnit,
  getDomainRange,
  getFindingsVisualizationSpec,
  TimeUnit,
} from '../../../Overview/utils/helpers';
import { CoreServicesContext } from '../../../../components/core_services';
import { Finding } from '../../models/interfaces';
import { FeatureChannelList } from '../../../../../server/models/interfaces';
import {
  getNotificationChannels,
  parseNotificationChannelsToOptions,
} from '../../../CreateDetector/components/ConfigureAlerts/utils/helpers';
import {
  createSelectComponent,
  errorNotificationToast,
  renderVisualization,
  getPlugins,
} from '../../../../utils/helpers';
import { DetectorHit, RuleSource } from '../../../../../server/models/interfaces';
import { NotificationsStart } from 'opensearch-dashboards/public';
import { DateTimeFilter } from '../../../Overview/models/interfaces';
import { ChartContainer } from '../../../../components/Charts/ChartContainer';
import { DataStore } from '../../../../store/DataStore';
import { CorrelationFinding, Detector } from '../../../../../types';

interface FindingsProps extends RouteComponentProps {
  detectorService: DetectorsService;
  findingsService: FindingsService;
  correlationService: CorrelationService;
  notificationsService: NotificationsService;
  indexPatternsService: IndexPatternsService;
  opensearchService: OpenSearchService;
  notifications: NotificationsStart;
  match: match;
  dateTimeFilter?: DateTimeFilter;
  setDateTimeFilter?: Function;
  history: RouteComponentProps['history'];
}

interface FindingsState {
  loading: boolean;
  detectors: Detector[];
  findings: FindingItemType[];
  notificationChannels: FeatureChannelList[];
  rules: { [id: string]: RuleSource };
  recentlyUsedRanges: DurationRange[];
  groupBy: FindingsGroupByType;
  filteredFindings: FindingItemType[];
  plugins: string[];
  timeUnit: TimeUnit;
  dateFormat: string;
}

interface FindingVisualizationData {
  time: number;
  finding: number;
  logType: string;
  ruleSeverity: string;
}

export type FindingItemType = Finding & { detector: DetectorHit } & {
  correlations: CorrelationFinding[];
};

type FindingsGroupByType = 'logType' | 'ruleSeverity';

export const groupByOptions = [
  { text: 'Log type', value: 'logType' },
  { text: 'Rule severity', value: 'ruleSeverity' },
];

class Findings extends Component<FindingsProps, FindingsState> {
  static contextType = CoreServicesContext;

  constructor(props: FindingsProps) {
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
      detectors: [],
      findings: [],
      notificationChannels: [],
      rules: {},
      recentlyUsedRanges: [DEFAULT_DATE_RANGE],
      groupBy: 'logType',
      filteredFindings: [],
      plugins: [],
      timeUnit: timeUnits.timeUnit,
      dateFormat: timeUnits.dateFormat,
    };
  }

  componentDidUpdate(prevProps: Readonly<FindingsProps>, prevState: Readonly<FindingsState>): void {
    if (
      this.state.filteredFindings !== prevState.filteredFindings ||
      this.state.groupBy !== prevState.groupBy
    ) {
      renderVisualization(this.generateVisualizationSpec(), 'findings-view');
    }
  }

  componentDidMount = async () => {
    this.context.chrome.setBreadcrumbs([BREADCRUMBS.SECURITY_ANALYTICS, BREADCRUMBS.FINDINGS]);
    this.onRefresh();
  };

  onRefresh = async () => {
    await this.getFindings();
    await this.getNotificationChannels();
    await this.getPlugins();
    renderVisualization(this.generateVisualizationSpec(), 'findings-view');
  };

  getFindings = async () => {
    this.setState({ loading: true });
    const { findingsService, detectorService, notifications } = this.props;
    try {
      // Get all the Findings logic
      const findingRes = await findingsService.getFindings();

      if (findingRes.ok) {
        const ruleIds = new Set<string>();
        let findings: FindingItemType[] = [];

        // Assuming getDetectors returns an array of detectors
        const detectorsRes = await detectorService.getDetectors();
        if (detectorsRes.ok) {
          const detectors = detectorsRes.response.hits.hits;
          const detectorInfoMap = new Map();

          detectors.forEach((detector) => {
            detectorInfoMap.set(detector._id, {
              logType: detector._source.detector_type,
              name: detector._source.name,
              detector: detector,
            });
          });
          const detectorFindingsPromises = findingRes.response.findings.map((finding) => {
            try {
              // Use detectorInfoMap to get detector information
              const detectorInfo = detectorInfoMap.get(finding.detectorId);
              finding.queries.forEach((rule) => ruleIds.add(rule.id));
              return {
                ...finding,
                detectorName: detectorInfo ? detectorInfo.name : DEFAULT_EMPTY_DATA,
                logType: detectorInfo ? detectorInfo.logType : DEFAULT_EMPTY_DATA,
                detector: detectorInfo.detector, // If needed, replace with actual detector information
              };
            } catch (error) {
              console.error('Error while fetching detector information:', error);
              errorNotificationToast(notifications, 'retrieve', 'findings', error);
              return null;
            }
          });

          const detectorFindings = await Promise.all(detectorFindingsPromises);
          findings = findings.concat(detectorFindings.filter(Boolean));
          // Set the state after all asynchronous operations are completed
          await this.getRules(Array.from(ruleIds));
          this.setState({ findings });
        } else {
          errorNotificationToast(notifications, 'retrieve', 'findings', detectorsRes.error);
        }
      } else {
        errorNotificationToast(notifications, 'retrieve', 'findings', findingRes.error);
      }
    } catch (error) {
      errorNotificationToast(notifications, 'retrieve', 'findings', error);
    }
    this.setState({ loading: false });
  };

  getRules = async (ruleIds: string[]) => {
    const { notifications } = this.props;
    try {
      const rules = await DataStore.rules.getAllRules({
        _id: ruleIds,
      });

      const allRules: { [id: string]: RuleSource } = {};
      rules.forEach((hit) => (allRules[hit._id] = hit._source));
      this.setState({ rules: allRules });
    } catch (e) {
      errorNotificationToast(notifications, 'retrieve', 'rules', e);
    }
  };

  getNotificationChannels = async () => {
    const channels = await getNotificationChannels(this.props.notificationsService);
    this.setState({ notificationChannels: channels });
  };

  async getPlugins() {
    const { opensearchService } = this.props;
    const plugins = await getPlugins(opensearchService);

    this.setState({ plugins });
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

  generateVisualizationSpec() {
    const visData: FindingVisualizationData[] = [];

    this.state.filteredFindings.forEach((finding: FindingItemType) => {
      const findingTime = new Date(finding.timestamp);
      findingTime.setMilliseconds(0);
      findingTime.setSeconds(0);
      finding.detectionType === 'Threat intelligence';
      const ruleLevel =
        finding.detectionType === 'Threat intelligence'
          ? 'high'
          : this.state.rules[finding.queries[0].id].level;
      visData.push({
        finding: 1,
        time: findingTime.getTime(),
        logType: finding.logType,
        ruleSeverity:
          ruleLevel === 'critical' ? ruleLevel : (finding as any)['ruleSeverity'] || ruleLevel,
      });
    });
    const {
      dateTimeFilter = {
        startTime: DEFAULT_DATE_RANGE.start,
        endTime: DEFAULT_DATE_RANGE.end,
      },
    } = this.props;
    const chartTimeUnits = getChartTimeUnit(dateTimeFilter.startTime, dateTimeFilter.endTime);
    return getFindingsVisualizationSpec(visData, this.state.groupBy, {
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
      'findings-vis-groupBy',
      (event: React.ChangeEvent<HTMLSelectElement>) => {
        const groupBy = event.target.value as FindingsGroupByType;
        this.setState({ groupBy });
      }
    );
  }

  onFindingsFiltered = (findings: FindingItemType[]) => {
    this.setState({ filteredFindings: findings });
  };

  render() {
    const { loading, notificationChannels, rules, recentlyUsedRanges } = this.state;
    let { findings } = this.state;

    const {
      dateTimeFilter = {
        startTime: DEFAULT_DATE_RANGE.start,
        endTime: DEFAULT_DATE_RANGE.end,
      },
    } = this.props;
    if (Object.keys(rules).length > 0) {
      findings = findings.map((finding: any) => {
        const rule = rules[finding.queries[0].id];
        if (rule) {
          finding['ruleName'] = rule.title;
          finding['ruleSeverity'] =
            rule.level === 'critical' ? rule.level : finding['ruleSeverity'] || rule.level;
        }
        return finding;
      });
    }

    return (
      <EuiFlexGroup direction="column">
        <EuiFlexItem>
          <EuiFlexGroup gutterSize={'s'} justifyContent={'spaceBetween'}>
            <EuiFlexItem>
              <EuiTitle size="m">
                <h1>Findings</h1>
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
                {!findings || findings.length === 0 ? (
                  <EuiEmptyPrompt
                    title={<h2>No findings</h2>}
                    body={
                      <p>
                        Adjust the time range to see more results or{' '}
                        <EuiLink href={`${location.pathname}#/create-detector`}>
                          create a detector
                        </EuiLink>{' '}
                        to generate findings.
                      </p>
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
            <FindingsTable
              {...this.props}
              history={this.props.history}
              findings={findings}
              loading={loading}
              rules={rules}
              startTime={dateTimeFilter.startTime}
              endTime={dateTimeFilter.endTime}
              onRefresh={this.onRefresh}
              notificationChannels={parseNotificationChannelsToOptions(notificationChannels)}
              refreshNotificationChannels={this.getNotificationChannels}
              onFindingsFiltered={this.onFindingsFiltered}
              hasNotificationsPlugin={this.state.plugins.includes(OS_NOTIFICATION_PLUGIN)}
              correlationService={this.props.correlationService}
            />
          </ContentPanel>
        </EuiFlexItem>
      </EuiFlexGroup>
    );
  }
}

export default withRouter(Findings);
