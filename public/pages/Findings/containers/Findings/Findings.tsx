/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import moment from 'moment';
import { ContentPanel } from '../../../../components/ContentPanel';
import {
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
import { BREADCRUMBS, DATE_MATH_FORMAT } from '../../../../utils/constants';
import { getFindingsVisualizationSpec } from '../../../Overview/utils/helpers';
import { CoreServicesContext } from '../../../../components/core_services';
import { Finding } from '../../models/interfaces';
import { Detector } from '../../../../../models/interfaces';
import { FeatureChannelList } from '../../../../../server/models/interfaces/Notifications';
import {
  getNotificationChannels,
  parseNotificationChannelsToOptions,
} from '../../../CreateDetector/components/ConfigureAlerts/utils/helpers';
import { createSelectComponent, renderVisualization } from '../../../../utils/helpers';
import { DetectorHit, RuleSource } from '../../../../../server/models/interfaces';

interface FindingsProps extends RouteComponentProps {
  detectorService: DetectorsService;
  findingsService: FindingsService;
  notificationsService: NotificationsService;
  opensearchService: OpenSearchService;
  ruleService: RuleService;
}

interface FindingsState {
  loading: boolean;
  detectors: Detector[];
  findings: FindingItemType[];
  notificationChannels: FeatureChannelList[];
  rules: { [id: string]: RuleSource };
  startTime: string;
  endTime: string;
  groupBy: FindingsGroupByType;
  filteredFindings: FindingItemType[];
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

export default class Findings extends Component<FindingsProps, FindingsState> {
  static contextType = CoreServicesContext;

  constructor(props: FindingsProps) {
    super(props);
    const now = moment.now();
    const startTime = moment(now).subtract(15, 'minutes').format(DATE_MATH_FORMAT);
    this.state = {
      loading: false,
      detectors: [],
      findings: [],
      notificationChannels: [],
      rules: {},
      startTime: startTime,
      endTime: moment(now).format(DATE_MATH_FORMAT),
      groupBy: 'logType',
      filteredFindings: [],
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
    renderVisualization(this.generateVisualizationSpec(), 'findings-view');
  };

  getFindings = async () => {
    this.setState({ loading: true });

    try {
      const { findingsService, detectorService } = this.props;

      const detectorsRes = await detectorService.getDetectors();
      if (detectorsRes.ok) {
        const detectors = detectorsRes.response.hits.hits;
        const ruleIds = new Set<string>();
        let findings: FindingItemType[] = [];

        for (let detector of detectors) {
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
          }
        }

        await this.getRules(Array.from(ruleIds));

        this.setState({ findings, detectors: detectors.map((detector) => detector._source) });
      } else {
        console.error('Failed to retrieve findings:', detectorsRes.error);
        // TODO: Display toast with error details
      }
    } catch (e) {
      console.error('Failed to retrieve findings:', e);
      // TODO: Display toast with error details
    }
    this.setState({ loading: false });
  };

  getRules = async (ruleIds: string[]) => {
    try {
      const { ruleService } = this.props;
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
        console.error('Failed to retrieve pre-packaged rules:', prePackagedResponse.error);
      }
      if (customResponse.ok) {
        customResponse.response.hits.hits.forEach((hit) => (allRules[hit._id] = hit._source));
      } else {
        console.error('Failed to retrieve custom rules:', customResponse.error);
        // TODO: Display toast with error details
      }
      this.setState({ rules: allRules });
    } catch (e) {
      console.error('Failed to retrieve rules:', e);
      // TODO: Display toast with error details
    }
  };

  getNotificationChannels = async () => {
    const channels = await getNotificationChannels(this.props.notificationsService);
    this.setState({ notificationChannels: channels });
  };

  onTimeChange = ({ start, end }: { start: string; end: string }) => {
    this.setState({ startTime: start, endTime: end });
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

    return getFindingsVisualizationSpec(visData, this.state.groupBy);
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
    const { loading, notificationChannels, rules, startTime, endTime } = this.state;
    let { findings } = this.state;

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
              <EuiTitle size="l">
                <h1>Findings</h1>
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
          <EuiSpacer size={'m'} />
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiPanel>
            <EuiFlexGroup direction="column">
              <EuiFlexItem style={{ alignSelf: 'flex-end' }}>
                {this.createGroupByControl()}
              </EuiFlexItem>
              <EuiFlexItem>
                <div id="findings-view" style={{ width: '100%' }}></div>
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
              startTime={startTime}
              endTime={endTime}
              onRefresh={this.onRefresh}
              notificationChannels={parseNotificationChannelsToOptions(notificationChannels)}
              refreshNotificationChannels={this.getNotificationChannels}
              onFindingsFiltered={this.onFindingsFiltered}
            />
          </ContentPanel>
        </EuiFlexItem>
      </EuiFlexGroup>
    );
  }
}
