/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  EuiButton,
  EuiEmptyPrompt,
  EuiFlexGroup,
  EuiFlexItem,
  EuiInMemoryTable,
  EuiLink,
  EuiSuperDatePicker,
  EuiTab,
  EuiTabs,
  EuiTitle,
  EuiCommentList,
  EuiCommentProps,
  EuiCard,
  EuiIcon,
  EuiSpacer,
  EuiText,
  EuiFlexGrid,
  EuiHorizontalRule,
  EuiBadge,
  EuiBasicTableColumn,
} from '@elastic/eui';
import {
  CorrelationFinding,
  CorrelationGraphData,
  CorrelationRule,
  CorrelationRuleQuery,
  CorrelationsLevel,
  DateTimeFilter,
  DurationRange,
  ICorrelationsStore,
} from '../../../../types';
import {
  BREADCRUMBS,
  DEFAULT_DATE_RANGE,
  MAX_RECENTLY_USED_TIME_RANGES,
  PLUGIN_NAME,
  ROUTES,
} from '../../../utils/constants';
import { ContentPanel } from '../../../components/ContentPanel';
import {
  colorBySeverity,
  defaultLogTypeFilterItemOptions,
  graphRenderOptions,
  iconByLogType,
  TabIds,
  tabs,
} from '../utils/constants';
import { DataStore } from '../../../store/DataStore';
import { CoreServicesContext } from '../../../components/core_services';
import { RouteComponentProps } from 'react-router-dom';
import { CorrelationGraph } from '../components/CorrelationGraph';
import { FilterItem, LogTypeFilterGroup } from '../components/LogTypeFilterGroup';

export interface CorrelationsProps extends RouteComponentProps {
  setDateTimeFilter?: Function;
  dateTimeFilter?: DateTimeFilter;
}

export interface CorrelationsState {
  recentlyUsedRanges: DurationRange[];
  tabId: string;
  tabContent: React.ReactNode | null;
  graphData: CorrelationGraphData;
  prevGraphData: CorrelationGraphData[];
  filterdLogTypes: FilterItem[];
  findingsList: CorrelationFinding[];
  showCorrelationDetails: boolean;
}

export class Correlations extends React.Component<CorrelationsProps, CorrelationsState> {
  static contextType = CoreServicesContext;
  private dateTimeFilter: DateTimeFilter;
  private correlationsStore: ICorrelationsStore;

  constructor(props: CorrelationsProps) {
    super(props);
    this.correlationsStore = DataStore.correlationsStore;
    this.correlationsStore.resetCorrelationsLevel();
    this.correlationsStore.registerGraphUpdateHandler(this.onNextLevelUpdate);
    this.correlationsStore.registerGraphEventHandler('click', this.onNodeClick);
    const initialFilteredLogTypes = [...defaultLogTypeFilterItemOptions];
    this.state = {
      recentlyUsedRanges: [DEFAULT_DATE_RANGE],
      tabId: tabs[0].id,
      tabContent: null,
      graphData: this.correlationsStore.getCorrelationsGraphData({
        level: CorrelationsLevel.AllFindings,
        logTypeFilterItems: initialFilteredLogTypes,
      }),
      prevGraphData: [],
      filterdLogTypes: initialFilteredLogTypes,
      findingsList: [],
      showCorrelationDetails: false,
    };
    this.dateTimeFilter = this.props.dateTimeFilter || {
      startTime: DEFAULT_DATE_RANGE.start,
      endTime: DEFAULT_DATE_RANGE.end,
    };
  }

  componentDidMount(): void {
    let id = this.props.location.pathname.replace(`${ROUTES.CORRELATIONS}`, '');
    if (id) {
      id = Object.keys(this.correlationsStore.correlations)[0];
      const finding = this.correlationsStore.findings[id];
      const logTypeFilterItemOptions = [...defaultLogTypeFilterItemOptions];
      const idx = logTypeFilterItemOptions.findIndex((option) => option.id === finding.logType);
      logTypeFilterItemOptions[idx] = {
        ...logTypeFilterItemOptions[idx],
        checked: 'on',
      };
      this.setState({
        filterdLogTypes: logTypeFilterItemOptions,
        graphData: this.correlationsStore.getCorrelationsGraphData({
          level: CorrelationsLevel.AllFindings,
          logTypeFilterItems: logTypeFilterItemOptions,
        }),
      });
      this.onNodeClick({ nodes: [id] });
    }
    this.context.chrome.setBreadcrumbs([BREADCRUMBS.SECURITY_ANALYTICS, BREADCRUMBS.CORRELATIONS]);
    this.setState({ tabContent: this.createCorrelationsGraph() });
  }

  componentDidUpdate(
    prevProps: Readonly<CorrelationsProps>,
    prevState: Readonly<CorrelationsState>,
    snapshot?: any
  ): void {
    if (
      prevState.graphData !== this.state.graphData ||
      prevState.findingsList !== this.state.findingsList
    ) {
      this.setState({ tabContent: this.createCorrelationsGraph() });
    }

    if (prevState.filterdLogTypes !== this.state.filterdLogTypes) {
      this.setState({
        graphData: this.correlationsStore.getCorrelationsGraphData({
          level: CorrelationsLevel.AllFindings,
          logTypeFilterItems: this.state.filterdLogTypes,
        }),
      });
    }
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
    this.setState({
      recentlyUsedRanges: recentlyUsedRanges,
    });

    this.props.setDateTimeFilter &&
      this.props.setDateTimeFilter({
        startTime: start,
        endTime: endTime,
      });
  };

  onNextLevelUpdate = (nextLevelGraphData: CorrelationGraphData) => {
    this.setState({
      prevGraphData: [...this.state.prevGraphData, this.state.graphData],
      graphData: nextLevelGraphData,
    });
  };

  onNodeClick = (params: any) => {
    console.log(params);
    if (params.nodes.length === 1) {
      const allFindings = this.correlationsStore.findings;
      const nodeId = params.nodes[0];
      const correlatedFindings = this.correlationsStore.correlations[nodeId];
      const findings: CorrelationFinding[] = [];
      correlatedFindings.forEach((finding) => {
        findings.push(allFindings[finding]);
      });
      findings.sort((a, b) => a.timestamp - b.timestamp);
      findings.unshift(allFindings[nodeId]);
      this.setState({ findingsList: findings, showCorrelationDetails: false });
    } else if (params.nodes.length === 0 && params.edges.length === 1) {
      const [node1, node2] = params.edges[0].split(':');
      const allFindings = this.correlationsStore.findings;
      const findings: CorrelationFinding[] = [allFindings[node1], allFindings[node2]];
      this.setState({ findingsList: findings, showCorrelationDetails: true });
    }
  };

  onRefresh = () => {
    this.correlationsStore.resetCorrelationsLevel();
    this.setState({
      graphData: this.correlationsStore.getCorrelationsGraphData({
        level: CorrelationsLevel.AllFindings,
        logTypeFilterItems: this.state.filterdLogTypes,
      }),
      prevGraphData: [],
    });
  };

  getColumns = (): EuiBasicTableColumn<CorrelationRule>[] => {
    return [
      {
        field: 'name',
        name: 'Rule name',
        sortable: true,
        width: '20%',
        render: (name: string) => <EuiLink>{name}</EuiLink>,
      },
      {
        name: 'Rule queries',
        field: 'fields',
        render: (queries: CorrelationRuleQuery[]) => {
          return (
            <div>
              {queries.map(({ logType, conditions: fieldConditions }) => (
                <EuiBadge style={{ fontSize: 14, padding: 10 }}>
                  <p>Logtype: {logType}</p>
                  {fieldConditions.length ? (
                    <p style={{ marginTop: 10 }}>
                      Conditions:{' '}
                      {fieldConditions
                        .map(
                          (cond, idx) =>
                            `${idx > 0 ? `${cond.condition} ` : ''}${cond.name}=${cond.value}`
                        )
                        .join(' ')}
                    </p>
                  ) : null}
                </EuiBadge>
              ))}
            </div>
          );
        },
      },
      {
        name: 'Status',
        render: (_record: CorrelationRule) => <p>Enabled</p>,
        width: '10%',
      },
    ];
  };

  getCorrelationRuleItems() {
    return this.correlationsStore.getCorrelationRules();
  }

  createCorrelationRuleAction() {
    return (
      <EuiButton
        href={`${PLUGIN_NAME}#${ROUTES.CORRELATIONS_CREATE_RULE}`}
        fill={true}
        data-test-subject={'correlationRuleCreateButton'}
      >
        Create correlation rule
      </EuiButton>
    );
  }

  renderCorrelationRules() {
    return (
      <ContentPanel title={'Correlation rules'} actions={[this.createCorrelationRuleAction()]}>
        <EuiInMemoryTable
          columns={this.getColumns()}
          items={this.getCorrelationRuleItems()}
          // itemId={(item) => `${item.id}`}
          isSelectable={true}
          pagination
          // search={search}
          // sorting={sorting}
          // selection={selection}
          // loading={loading}
        />
      </ContentPanel>
    );
  }

  onFilteredLogTypesChange = (filterdLogTypes: FilterItem[]) => {
    this.setState({ filterdLogTypes });
  };

  createCorrelationsGraph() {
    if (this.state.graphData.graph.nodes.length === 0) {
      return (
        <EuiEmptyPrompt
          title={<h2>No correlations found</h2>}
          body={
            <p>
              Adjust the time range to see more results or{' '}
              <EuiLink href={`#${ROUTES.CORRELATIONS_CREATE_RULE}`}>create a rule</EuiLink> to
              generate correlations between findings.{' '}
            </p>
          }
        />
      );
    }

    const createComment = (finding: CorrelationFinding, type: 'update' | 'regular' = 'regular') => {
      const parentFinding = this.state.findingsList[0];

      return {
        username: <span style={{ fontSize: 16 }}>{finding.name}</span>,
        event: 'generated on ',
        timestamp: <strong>{`${new Date(finding.timestamp).toLocaleString()}`}</strong>,
        type,
        timelineIcon: (
          <i
            className="fa fa-2x"
            style={{ color: this.correlationsStore.colorByLogType[finding.logType] }}
          >
            {iconByLogType[finding.logType]}
          </i>
        ),
        children: (
          <>
            <p>
              Severity:{' '}
              <EuiBadge color={colorBySeverity[finding.rule.severity]}>
                {finding.rule.severity}
              </EuiBadge>
            </p>
            <EuiSpacer size="s" />
            <p>Log type: {finding.logType}</p>
            <EuiSpacer size="s" />
            <p>
              Rule: <EuiLink>{'Sample rule one'}</EuiLink>
            </p>
            <EuiSpacer size="s" />
            <p>
              Correlation score: <strong>{Math.round(100 * Math.random()) / 100}</strong>
            </p>
            <EuiSpacer size="s" />
            <p>
              Correlation rule:{' '}
              <EuiLink>{`Correlate ${parentFinding.logType} and ${finding.logType} findings`}</EuiLink>
            </p>
          </>
        ),
        actions: (
          <EuiLink>
            <EuiIcon type={'expand'} />
          </EuiLink>
        ),
        style: {
          margin: '10px auto',
        },
      };
    };

    const { graph, events } = this.state.graphData;
    const comments: EuiCommentProps[] = this.state.findingsList.slice(1).map((finding) => {
      return createComment(finding);
    });

    return (
      <>
        <EuiSpacer />
        <EuiFlexGroup justifyContent="spaceBetween">
          <EuiFlexItem grow={false}>
            <EuiButton
              // style={{ width: 150 }}
              onClick={() => {
                this.setState({
                  graphData: {
                    ...this.state.graphData,
                    graph: {
                      nodes: [...this.state.graphData.graph.nodes],
                      edges: [...this.state.graphData.graph.edges],
                    },
                  },
                  findingsList: [],
                });
              }}
            >
              Reset correlations graph
            </EuiButton>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <LogTypeFilterGroup
              items={this.state.filterdLogTypes}
              setItems={this.onFilteredLogTypesChange}
              colorByLogType={this.correlationsStore.colorByLogType}
            />
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiSpacer />
        <EuiFlexGroup direction="row">
          <EuiFlexItem grow={2} style={{ border: '1px solid' }}>
            <>
              <EuiTitle size="xs">
                <h3 style={{ marginTop: 10, marginLeft: 10 }}>Correlated log types:</h3>
              </EuiTitle>
              <EuiFlexGrid columns={3} style={{ margin: 10 }}>
                {this.state.filterdLogTypes
                  .filter((item) => item.checked === 'on')
                  .map((item) => {
                    return (
                      <EuiFlexItem>
                        <p style={{ color: this.correlationsStore.colorByLogType[item.id] }}>
                          <i className="fa">&nbsp;{iconByLogType[item.id]}</i> {item.id}
                        </p>
                      </EuiFlexItem>
                    );
                  })}
              </EuiFlexGrid>
              <EuiHorizontalRule margin="xs" />
              <CorrelationGraph graph={graph} options={{ ...graphRenderOptions }} events={events} />
            </>
          </EuiFlexItem>
          <EuiFlexItem grow={1} style={{ padding: '10px' }}>
            <div>
              <EuiTitle size="m">
                <h2>Correlation info</h2>
              </EuiTitle>
              <EuiText size="s">
                <em>Select a finding in the graph to view details</em>
              </EuiText>
              <EuiSpacer size="l" />
              {this.state.findingsList.length ? (
                <>
                  <EuiTitle size="s">
                    <h2>Finding</h2>
                  </EuiTitle>
                  <EuiCard
                    title={
                      <span>
                        <i
                          className="fa"
                          style={{
                            color: this.correlationsStore.colorByLogType[
                              this.state.findingsList[0].logType
                            ],
                          }}
                        >
                          {iconByLogType[this.state.findingsList[0].logType]}
                        </i>
                        &nbsp;{this.state.findingsList[0].name}
                      </span>
                    }
                    textAlign="left"
                    description={`Generated on ${new Date(
                      this.state.findingsList[0].timestamp
                    ).toLocaleString()}`}
                  >
                    <>
                      <p>
                        Severity:{' '}
                        <EuiBadge color={colorBySeverity[this.state.findingsList[0].rule.severity]}>
                          {this.state.findingsList[0].rule.severity}
                        </EuiBadge>
                      </p>
                      <EuiSpacer size="s" />
                      <p>Logtype: {this.state.findingsList[0].logType}</p>
                      <EuiSpacer size="s" />
                      <p>
                        Rule: <EuiLink>{this.state.findingsList[0].rule.name}</EuiLink>
                      </p>
                    </>
                  </EuiCard>
                  <EuiSpacer size="xl" />
                  <div>
                    <EuiTitle size="s">
                      <h2>Correlated findings ({comments.length})</h2>
                    </EuiTitle>
                    <EuiText size="s">
                      <i className="fa fa-bolt" /> Higher correlation score indicates stronger
                      correlation
                    </EuiText>
                    <EuiCommentList comments={comments} />
                  </div>
                </>
              ) : null}
              {this.state.showCorrelationDetails ? (
                <EuiCard title={'Correlation details'} textAlign="left" description={``}>
                  <em>Fields correlated:</em>
                  <EuiSpacer size="s" />
                  {this.correlationsStore.getCorrelationRules()[0].fields.map((field) => {
                    return (
                      <div style={{ padding: 5 }}>
                        <EuiBadge>{field.logType}</EuiBadge> -{' '}
                        {field.conditions.map((cond) => cond.name).join(', ')}
                      </div>
                    );
                  })}
                  <EuiSpacer />
                </EuiCard>
              ) : null}
            </div>
          </EuiFlexItem>
        </EuiFlexGroup>
      </>
    );
  }

  getTabContent(tabId: string) {
    switch (tabId) {
      case TabIds.CORRELATIONS:
        return this.createCorrelationsGraph();
      case TabIds.CORRELATION_RULES:
        return this.renderCorrelationRules();
      default:
        return this.createCorrelationsGraph();
    }
  }

  render() {
    this.dateTimeFilter = this.props.dateTimeFilter || this.dateTimeFilter;

    return (
      <EuiFlexGroup direction="column">
        <EuiFlexItem grow={false}>
          <EuiFlexGroup justifyContent="spaceBetween">
            <EuiFlexItem grow={false}>
              <EuiTitle size="m">
                <h1>Correlations</h1>
              </EuiTitle>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiSuperDatePicker
                start={this.dateTimeFilter.startTime}
                end={this.dateTimeFilter.endTime}
                recentlyUsedRanges={this.state.recentlyUsedRanges}
                onTimeChange={this.onTimeChange}
                onRefresh={this.onRefresh}
                updateButtonProps={{ fill: false }}
              />
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlexItem>
        <EuiFlexItem grow={true}>
          <EuiTabs>
            {tabs.map((tab) => {
              return (
                <EuiTab
                  key={tab.id}
                  isSelected={tab.id === this.state.tabId}
                  onClick={() => {
                    this.setState({ tabId: tab.id, tabContent: this.getTabContent(tab.id) });
                  }}
                >
                  {tab.name}
                </EuiTab>
              );
            })}
          </EuiTabs>
          {this.state.tabContent}
        </EuiFlexItem>
      </EuiFlexGroup>
    );
  }
}
