/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import { CorrelationFinding, CorrelationGraphData, DateTimeFilter } from '../../../../types';
import React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import {
  defaultLogTypeFilterItemOptions,
  defaultSeverityFilterItemOptions,
  emptyGraphData,
  getAbbrFromLogType,
  getSeverityColor,
  graphRenderOptions,
} from '../utils/constants';
import {
  EuiIcon,
  EuiFlexGroup,
  EuiFlexItem,
  EuiTitle,
  EuiPanel,
  EuiSuperDatePicker,
  EuiSpacer,
  EuiButtonEmpty,
  EuiFlyout,
  EuiFlyoutHeader,
  EuiFlyoutBody,
  EuiButtonIcon,
  EuiText,
  EuiEmptyPrompt,
  EuiButton,
} from '@elastic/eui';
import { CorrelationsExperimentalBanner } from '../components/ExperimentalBanner';
import { FilterItem, FilterGroup } from '../components/FilterGroup';
import { CoreServicesContext } from '../../../components/core_services';
import {
  BREADCRUMBS,
  DEFAULT_DATE_RANGE,
  MAX_RECENTLY_USED_TIME_RANGES,
  ROUTES,
} from '../../../utils/constants';
import { CorrelationGraph } from '../components/CorrelationGraph';
import { FindingCard } from '../components/FindingCard';
import { DataStore } from '../../../store/DataStore';
import { FindingItemType } from '../../Findings/containers/Findings/Findings';
import datemath from '@elastic/datemath';
import { ruleSeverity } from '../../Rules/utils/constants';

interface CorrelationsProps
  extends RouteComponentProps<
    any,
    any,
    { finding: FindingItemType; correlatedFindings: CorrelationFinding[] }
  > {
  setDateTimeFilter?: Function;
  dateTimeFilter?: DateTimeFilter;
  onMount: () => void;
}

interface SpecificFindingCorrelations {
  finding: CorrelationFinding;
  correlatedFindings: CorrelationFinding[];
}

interface CorrelationsState {
  recentlyUsedRanges: any[];
  graphData: CorrelationGraphData;
  specificFindingInfo?: SpecificFindingCorrelations;
  logTypeFilterOptions: FilterItem[];
  severityFilterOptions: FilterItem[];
}

export class Correlations extends React.Component<CorrelationsProps, CorrelationsState> {
  static contextType = CoreServicesContext;
  constructor(props: CorrelationsProps) {
    super(props);
    this.state = {
      recentlyUsedRanges: [DEFAULT_DATE_RANGE],
      graphData: { ...emptyGraphData },
      logTypeFilterOptions: [...defaultLogTypeFilterItemOptions],
      severityFilterOptions: [...defaultSeverityFilterItemOptions],
      specificFindingInfo: undefined,
    };
  }

  private get startTime() {
    return this.props.dateTimeFilter?.startTime || DEFAULT_DATE_RANGE.start;
  }

  private get endTime() {
    return this.props.dateTimeFilter?.endTime || DEFAULT_DATE_RANGE.end;
  }

  private shouldShowFinding(finding: CorrelationFinding) {
    return (
      this.state.logTypeFilterOptions.find((option) => option.id === finding.logType)?.checked ===
        'on' &&
      this.state.severityFilterOptions.find(
        (option) => option.id === finding.detectionRule.severity
      )?.checked === 'on'
    );
  }

  async componentDidMount(): Promise<void> {
    this.context.chrome.setBreadcrumbs([BREADCRUMBS.SECURITY_ANALYTICS, BREADCRUMBS.CORRELATIONS]);
    this.updateState();
    this.props.onMount();
  }

  componentDidUpdate(
    prevProps: Readonly<CorrelationsProps>,
    prevState: Readonly<CorrelationsState>,
    snapshot?: any
  ): void {
    if (
      prevState.logTypeFilterOptions !== this.state.logTypeFilterOptions ||
      prevState.severityFilterOptions !== this.state.severityFilterOptions ||
      prevProps.dateTimeFilter !== this.props.dateTimeFilter
    ) {
      this.updateState();
    }
  }

  private async updateState() {
    if (this.props.location.state) {
      const state = this.props.location.state;

      const specificFindingInfo: SpecificFindingCorrelations = {
        finding: {
          ...state.finding,
          id: state.finding.id,
          logType: state.finding.detector._source.detector_type,
          timestamp: new Date(state.finding.timestamp).toLocaleString(),
          detectionRule: {
            name: (state.finding as any).ruleName,
            severity: (state.finding as any).ruleSeverity,
          },
        },
        correlatedFindings: state.correlatedFindings.filter((finding) =>
          this.shouldShowFinding(finding)
        ),
      };

      if (!this.shouldShowFinding(specificFindingInfo.finding)) {
        return;
      }

      this.setState({ specificFindingInfo });

      // create graph data here
      this.updateGraphDataState(specificFindingInfo);
    } else {
      // get all correlations and display them in the graph
      const start = datemath.parse(this.startTime);
      const end = datemath.parse(this.endTime);
      const startTime = start?.valueOf() || Date.now();
      const endTime = end?.valueOf() || Date.now();
      let allCorrelations = await DataStore.correlations.getAllCorrelationsInWindow(
        startTime.toString(),
        endTime.toString()
      );
      allCorrelations = allCorrelations.filter((corr) => {
        return this.shouldShowFinding(corr.finding1) && this.shouldShowFinding(corr.finding2);
      });
      const createdEdges = new Set<string>();
      const createdNodes = new Set<string>();
      const graphData: CorrelationGraphData = {
        graph: {
          nodes: [],
          edges: [],
        },
        events: {
          click: this.onNodeClick,
        },
      };
      allCorrelations.forEach((correlation) => {
        const possibleCombination1 = `${correlation.finding1.id}:${correlation.finding2.id}`;
        const possibleCombination2 = `${correlation.finding2.id}:${correlation.finding1.id}`;

        if (createdEdges.has(possibleCombination1) || createdEdges.has(possibleCombination2)) {
          return;
        }

        if (!createdNodes.has(correlation.finding1.id)) {
          this.addNode(graphData.graph.nodes, correlation.finding1);
          createdNodes.add(correlation.finding1.id);
        }
        if (!createdNodes.has(correlation.finding2.id)) {
          this.addNode(graphData.graph.nodes, correlation.finding2);
          createdNodes.add(correlation.finding2.id);
        }
        this.addEdge(graphData.graph.edges, correlation.finding1, correlation.finding2);

        createdEdges.add(`${correlation.finding1.id}:${correlation.finding2.id}`);
      });

      this.setState({ graphData });
    }
  }

  private onNodeClick = async (params: any) => {
    if (params.nodes.length !== 1) {
      return;
    }

    const findingId = params.nodes[0];

    if (this.state.specificFindingInfo?.finding.id === findingId) {
      return;
    }

    const allFindings = await DataStore.correlations.fetchAllFindings();
    const detectorType = allFindings[findingId].logType;
    const correlations = await DataStore.correlations.getCorrelatedFindings(
      findingId,
      detectorType
    );
    this.setState({ specificFindingInfo: correlations });
    this.updateGraphDataState(correlations);
  };

  private updateGraphDataState(specificFindingInfo: SpecificFindingCorrelations) {
    const graphData: CorrelationGraphData = {
      graph: {
        nodes: [],
        edges: [],
      },
      events: {
        click: this.onNodeClick,
      },
    };

    this.addNode(graphData.graph.nodes, specificFindingInfo.finding);
    specificFindingInfo.correlatedFindings.forEach((finding) => {
      this.addNode(graphData.graph.nodes, finding);
      this.addEdge(graphData.graph.edges, specificFindingInfo.finding, finding);
    });

    this.setState({ graphData });
  }

  private addNode(nodes: any[], finding: CorrelationFinding) {
    nodes.push({
      id: finding.id,
      label: `<b>${getAbbrFromLogType(
        finding.logType
      )}</b>\n<code>${finding.detectionRule.severity.slice(0, 4)}</code>`,
      title: this.createNodeTooltip(finding),
      color: {
        background: 'white',
        border: getSeverityColor(finding.detectionRule.severity),
      },
      widthConstraint: {
        minimum: 50,
      },
      borderWidth: 2,
      font: {
        multi: 'html',
        size: 12,
      },
    });
  }

  private addEdge(edges: any[], f1: CorrelationFinding, f2: CorrelationFinding) {
    edges.push({
      from: f1.id,
      to: f2.id,
      id: `${f1.id}:${f2.id}`,
    });
  }

  private createNodeTooltip = (finding: CorrelationFinding) => {
    const tooltip = document.createElement('div');

    function createRow(text: string) {
      const row = document.createElement('p');
      row.innerText = text;
      row.style.padding = '5px';
      return row;
    }

    tooltip.appendChild(createRow(`Log type: ${finding.logType}`));
    tooltip.appendChild(createRow(finding.timestamp));

    return tooltip;
  };

  private onTimeChange = ({ start, end }: { start: string; end: string }) => {
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

  private onRefresh = () => {
    this.updateState();
  };

  onLogTypeFilterChange = (items: FilterItem[]) => {
    this.setState({ logTypeFilterOptions: items });
  };

  onSeverityFilterChange = (items: FilterItem[]) => {
    this.setState({ severityFilterOptions: items });
  };

  closeFlyout = () => {
    this.setState({ specificFindingInfo: undefined });
  };

  onFindingInspect = async (id: string, logType: string) => {
    // get finding data and set the specificFindingInfo
    const specificFindingInfo = await DataStore.correlations.getCorrelatedFindings(id, logType);
    this.setState({ specificFindingInfo });
    this.updateGraphDataState(specificFindingInfo);
  };

  resetFilters = () => {
    this.setState({
      logTypeFilterOptions: this.state.logTypeFilterOptions.map((option) => ({
        ...option,
        checked: 'on',
      })),
      severityFilterOptions: this.state.severityFilterOptions.map((option) => ({
        ...option,
        checked: 'on',
      })),
    });
  };

  render() {
    const findingCardsData = this.state.specificFindingInfo;

    return (
      <>
        {findingCardsData ? (
          <EuiFlyout
            hideCloseButton
            onClose={this.closeFlyout}
            ownFocus={true}
            type="push"
            maxWidth="300px"
          >
            <EuiFlyoutHeader hasBorder>
              <EuiFlexGroup>
                <EuiFlexItem>
                  <EuiTitle size="m">
                    <h1>Correlation</h1>
                  </EuiTitle>
                </EuiFlexItem>
                <EuiFlexItem grow={false}>
                  <EuiButtonIcon
                    aria-label="close"
                    iconType="cross"
                    display="empty"
                    iconSize="m"
                    onClick={this.closeFlyout}
                    data-test-subj={`close-correlation-details-flyout`}
                  />
                </EuiFlexItem>
              </EuiFlexGroup>
            </EuiFlyoutHeader>
            <EuiFlyoutBody>
              <EuiTitle size="xs">
                <p>Finding</p>
              </EuiTitle>
              <FindingCard
                id={findingCardsData.finding.id}
                logType={findingCardsData.finding.logType}
                timestamp={findingCardsData.finding.timestamp}
                detectionRule={findingCardsData.finding.detectionRule}
                finding={findingCardsData.finding}
                findings={findingCardsData.correlatedFindings}
              />
              <EuiSpacer />
              <EuiTitle size="xs">
                <p>Correlated Findings()</p>
              </EuiTitle>
              <EuiText color="subdued" size="xs">
                Higher correlation score indicated stronger correlation.
              </EuiText>
              <EuiSpacer />
              {findingCardsData.correlatedFindings.map((finding, index) => {
                return (
                  <FindingCard
                    key={index}
                    id={finding.id}
                    logType={finding.logType}
                    timestamp={finding.timestamp}
                    detectionRule={finding.detectionRule}
                    correlationData={{
                      score: finding.correlationScore || 0,
                      onInspect: this.onFindingInspect,
                    }}
                    finding={finding}
                    findings={findingCardsData.correlatedFindings}
                  />
                );
              })}
            </EuiFlyoutBody>
          </EuiFlyout>
        ) : null}
        <EuiFlexGroup direction="column">
          <EuiFlexItem>
            <EuiTitle size="m">
              <h1>Correlations</h1>
            </EuiTitle>
          </EuiFlexItem>
          <EuiFlexItem>
            <CorrelationsExperimentalBanner />
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiPanel>
              <EuiFlexGroup wrap={true} justifyContent="spaceBetween">
                <EuiFlexItem>
                  <EuiFlexGroup wrap={true} gutterSize="xs">
                    <EuiFlexItem grow={false}>
                      <FilterGroup
                        groupName="Severity"
                        items={this.state.severityFilterOptions}
                        setItems={this.onSeverityFilterChange}
                      />
                    </EuiFlexItem>
                    <EuiFlexItem grow={false}>
                      <FilterGroup
                        groupName="Log types"
                        items={this.state.logTypeFilterOptions}
                        setItems={this.onLogTypeFilterChange}
                      />
                    </EuiFlexItem>
                    <EuiFlexItem grow={false}>
                      <EuiButtonEmpty onClick={this.resetFilters}>Reset filters</EuiButtonEmpty>
                    </EuiFlexItem>
                  </EuiFlexGroup>
                </EuiFlexItem>
                <EuiFlexItem grow={false}>
                  <EuiSuperDatePicker
                    start={this.startTime}
                    end={this.endTime}
                    recentlyUsedRanges={this.state.recentlyUsedRanges}
                    onTimeChange={this.onTimeChange}
                    onRefresh={this.onRefresh}
                    updateButtonProps={{ fill: false }}
                  />
                </EuiFlexItem>
              </EuiFlexGroup>
              <EuiSpacer />
              <EuiFlexGroup
                wrap={true}
                gutterSize="m"
                justifyContent="flexStart"
                alignItems="center"
              >
                <EuiFlexItem grow={false}>
                  <EuiText>
                    <strong>Severity:</strong>
                  </EuiText>
                </EuiFlexItem>
                {ruleSeverity.map((sev, idx) => (
                  <EuiFlexItem grow={false} key={idx}>
                    <EuiText>
                      <EuiIcon type="dot" color={sev.color} /> {sev.value}
                    </EuiText>
                  </EuiFlexItem>
                ))}
              </EuiFlexGroup>

              <EuiSpacer />
              {this.state.graphData.graph.nodes.length > 0 ? (
                <CorrelationGraph
                  graph={this.state.graphData.graph}
                  options={{ ...graphRenderOptions }}
                  events={this.state.graphData.events}
                />
              ) : (
                <EuiEmptyPrompt
                  title={
                    <EuiTitle>
                      <h1>No correlations found</h1>
                    </EuiTitle>
                  }
                  body={<p>There are no correlated findings in the system.</p>}
                  actions={[
                    <EuiButton
                      fill={true}
                      color="primary"
                      href={`#${ROUTES.CORRELATION_RULE_CREATE}`}
                    >
                      Create correlation rule
                    </EuiButton>,
                  ]}
                />
              )}
            </EuiPanel>
          </EuiFlexItem>
        </EuiFlexGroup>
      </>
    );
  }
}
