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
} from '@elastic/eui';
import FindingsTable from '../../components/FindingsTable';
import FindingsService from '../../../../services/FindingsService';
import {
  DetectorsService,
  NotificationsService,
  OpenSearchService,
  RuleService,
} from '../../../../services';
import {
  BREADCRUMBS,
  DEFAULT_DATE_RANGE,
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
import { Detector } from '../../../../../models/interfaces';
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

interface FindingsProps extends RouteComponentProps {
  detectorService: DetectorsService;
  findingsService: FindingsService;
  notificationsService: NotificationsService;
  opensearchService: OpenSearchService;
  ruleService: RuleService;
  notifications: NotificationsStart;
  match: match;
  dateTimeFilter?: DateTimeFilter;
  setDateTimeFilter?: Function;
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

export type FindingItemType = Finding & { detector: DetectorHit };

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
      const detectorsRes = await detectorService.getDetectors();
      if (detectorsRes.ok) {
        const detectors = detectorsRes.response.hits.hits;
        const ruleIds = new Set<string>();
        let findings: FindingItemType[] = [];

        const detectorId = this.props.match.params['detectorId'];
        for (let detector of detectors) {
          if (!detectorId || detector._id === detectorId) {
            const findingRes = await findingsService.getFindings({ detectorId: detector._id });

            if (findingRes.ok) {
              const detectorFindings: FindingItemType[] = findingRes.response.findings.map(
                (finding) => {
                  finding.queries.forEach((rule) => ruleIds.add(rule.id));
                  return {
                    ...finding,
                    detectorName: detector._source.name,
                    logType: detector._source.detector_type,
                    detector: detector,
                  };
                }
              );
              findings = findings.concat(detectorFindings);
            } else {
              errorNotificationToast(notifications, 'retrieve', 'findings', findingRes.error);
            }
          }
        }

        await this.getRules(Array.from(ruleIds));

        this.setState({ findings, detectors: detectors.map((detector) => detector._source) });
      } else {
        errorNotificationToast(notifications, 'retrieve', 'findings', detectorsRes.error);
      }
    } catch (e) {
      errorNotificationToast(notifications, 'retrieve', 'findings', e);
    }
    this.setState({ loading: false });
  };

  getRules = async (ruleIds: string[]) => {
    const { notifications, ruleService } = this.props;
    try {
      const body = {
        from: 0,
        size: 5000,
        query: {
          nested: {
            path: 'rule',
            query: {
              terms: {
                _id: ruleIds,
              },
            },
          },
        },
      };

      const prePackagedResponse = await ruleService.getRules(true, body);
      const customResponse = await ruleService.getRules(false, body);

      const allRules: { [id: string]: any } = {};
      if (prePackagedResponse.ok) {
        prePackagedResponse.response.hits.hits.forEach((hit) => (allRules[hit._id] = hit._source));
      } else {
        errorNotificationToast(
          notifications,
          'retrieve',
          'pre-packaged rules',
          prePackagedResponse.error
        );
      }
      if (customResponse.ok) {
        customResponse.response.hits.hits.forEach((hit) => (allRules[hit._id] = hit._source));
      } else {
        errorNotificationToast(notifications, 'retrieve', 'custom rules', customResponse.error);
      }
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
      visData.push({
        finding: 1,
        time: findingTime.getTime(),
        logType: finding.detector._source.detector_type,
        ruleSeverity: this.state.rules[finding.queries[0].id].level,
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
      findings = findings.map((finding) => {
        const rule = rules[finding.queries[0].id];
        if (rule) {
          finding['ruleName'] = rule.title;
          finding['ruleSeverity'] = rule.level;
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
                <ChartContainer chartViewId={'findings-view'} loading={loading} />
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiPanel>

          <EuiSpacer size={'xxl'} />
        </EuiFlexItem>

        <EuiFlexItem>
          <ContentPanel title={'Findings'}>
            <FindingsTable
              {...this.props}
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
            />
          </ContentPanel>
        </EuiFlexItem>
      </EuiFlexGroup>
    );
  }
}

export default withRouter(Findings);
