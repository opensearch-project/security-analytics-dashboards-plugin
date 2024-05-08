/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import {
  CorrelationFinding,
  CorrelationGraphData,
  DataSourceProps,
  DateTimeFilter,
} from '../../../../types';
import React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import {
  getDefaultLogTypeFilterItemOptions,
  defaultSeverityFilterItemOptions,
  emptyGraphData,
  getLabelFromLogType,
  getSeverityColor,
  getSeverityLabel,
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
  EuiBadge,
  EuiFilterGroup,
  EuiHorizontalRule,
} from '@elastic/eui';
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
import { renderToStaticMarkup } from 'react-dom/server';
import { Network } from 'react-graph-vis';
import { getLogTypeLabel } from '../../LogTypes/utils/helpers';

interface CorrelationsProps
  extends RouteComponentProps<
      any,
      any,
      { finding: FindingItemType; correlatedFindings: CorrelationFinding[] }
    >,
    DataSourceProps {
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
  loadingGraphData: boolean;
}

export class Correlations extends React.Component<CorrelationsProps, CorrelationsState> {
  static contextType = CoreServicesContext;
  private correlationGraphNetwork?: Network;

  constructor(props: CorrelationsProps) {
    super(props);
    this.state = {
      recentlyUsedRanges: [DEFAULT_DATE_RANGE],
      graphData: { ...emptyGraphData },
      logTypeFilterOptions: [...getDefaultLogTypeFilterItemOptions()],
      severityFilterOptions: [...defaultSeverityFilterItemOptions],
      specificFindingInfo: undefined,
      loadingGraphData: false,
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
    this.updateState(true /* onMount */);
    this.props.onMount();
  }

  componentDidUpdate(
    prevProps: Readonly<CorrelationsProps>,
    prevState: Readonly<CorrelationsState>,
    snapshot?: any
  ): void {
    if (prevProps.dataSource !== this.props.dataSource) {
      this.onRefresh();
    } else if (
      prevState.logTypeFilterOptions !== this.state.logTypeFilterOptions ||
      prevState.severityFilterOptions !== this.state.severityFilterOptions ||
      prevProps.dateTimeFilter !== this.props.dateTimeFilter
    ) {
      this.updateState();
    }
  }

  private async updateState(onMount: boolean = false) {
    if (onMount && this.props.location.state) {
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
            tags: (state.finding as any).tags,
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
      this.setState({ loadingGraphData: true });
      let allCorrelations = await DataStore.correlations.getAllCorrelationsInWindow(
        startTime.toString(),
        endTime.toString()
      );
      this.setState({ loadingGraphData: false });
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
        createdEdges.add(possibleCombination1);
      });

      this.setState({ graphData, specificFindingInfo: undefined });
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

    this.setState({ loadingGraphData: true });

    let detectorType: string;
    const node = this.state.graphData.graph.nodes.find((node) => node.id === findingId)!;

    if (node) {
      detectorType = node.saLogType;
    } else {
      const allFindings = await DataStore.correlations.fetchAllFindings();
      detectorType = allFindings[findingId].logType;
    }

    const correlatedFindingsInfo = await DataStore.correlations.getCorrelatedFindings(
      findingId,
      detectorType
    );
    const correlationRules = await DataStore.correlations.getCorrelationRules();
    correlatedFindingsInfo.correlatedFindings = correlatedFindingsInfo.correlatedFindings.map(
      (finding) => {
        return {
          ...finding,
          correlationRule: correlationRules.find((rule) => finding.rules?.indexOf(rule.id) !== -1),
        };
      }
    );
    this.setState({ specificFindingInfo: correlatedFindingsInfo, loadingGraphData: false });
    this.updateGraphDataState(correlatedFindingsInfo);
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
    const addedEdges = new Set();
    const nodeIds = new Set();
    specificFindingInfo.correlatedFindings.forEach((finding) => {
      if (!nodeIds.has(finding.id)) {
        this.addNode(graphData.graph.nodes, finding);
        nodeIds.add(finding.id);
      }

      const possibleCombination1 = `${specificFindingInfo.finding.id}:${finding.id}`;
      const possibleCombination2 = `${finding.id}:${specificFindingInfo.finding.id}`;
      if (addedEdges.has(possibleCombination1) || addedEdges.has(possibleCombination2)) {
        return;
      }
      this.addEdge(graphData.graph.edges, specificFindingInfo.finding, finding);
      addedEdges.add(possibleCombination1);
    });

    this.setState({ graphData });
  }

  private addNode(nodes: any[], finding: CorrelationFinding) {
    const borderColor = getSeverityColor(finding.detectionRule.severity).background;

    nodes.push({
      id: finding.id,
      label: getLogTypeLabel(finding.logType),
      title: this.createNodeTooltip(finding),
      color: {
        background: borderColor,
        border: borderColor,
        highlight: {
          background: '#e7f5ff',
          border: borderColor,
        },
        hover: {
          background: '#e7f5ff',
          border: borderColor,
        },
      },
      size: 17,
      borderWidth: 2,
      font: {
        multi: 'html',
        size: 12,
      },
      chosen: true,
      saLogType: finding.logType,
    });
  }

  private addEdge(edges: any[], f1: CorrelationFinding, f2: CorrelationFinding) {
    edges.push({
      from: f1.id,
      to: f2.id,
      id: `${f1.id}:${f2.id}`,
      chosen: false,
      color: '#98A2B3', //ouiColorMediumShade,
      label: f1.correlationScore || f2.correlationScore || '',
      width: 2,
    });
  }

  private createNodeTooltip = ({ detectionRule, timestamp, logType }: CorrelationFinding) => {
    const { text, background } = getSeverityColor(detectionRule.severity);
    const tooltipContent = (
      <div style={{ backgroundColor: '#535353', color: '#ffffff', padding: '15px' }}>
        <EuiFlexGroup alignItems="center" justifyContent="flexStart" gutterSize="s">
          <EuiFlexItem grow={false}>
            <EuiBadge style={{ color: text }} color={background}>
              {getSeverityLabel(detectionRule.severity)}
            </EuiBadge>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiBadge>{getLabelFromLogType(logType)}</EuiBadge>
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiSpacer size="s" />
        <EuiText>{timestamp}</EuiText>
        <EuiHorizontalRule margin="xs" />
        <strong>Detection rule</strong>
        <EuiSpacer size="s" />
        <p>{detectionRule.name}</p>
      </div>
    );

    const tooltipContentHTML = renderToStaticMarkup(tooltipContent);

    const tooltip = document.createElement('div');
    tooltip.innerHTML = tooltipContentHTML;

    return tooltip.firstElementChild;
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
    this.correlationGraphNetwork?.selectNodes([id], false);
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
      specificFindingInfo: undefined,
    });
  };

  setNetwork = (network: Network) => {
    this.correlationGraphNetwork = network;
    network.on('hoverNode', function (params) {
      network.canvas.body.container.style.cursor = 'pointer';
    });
    network.on('blurNode', function (params) {
      network.canvas.body.container.style.cursor = 'default';
    });
  };

  renderCorrelationsGraph(loadingData: boolean) {
    return this.state.graphData.graph.nodes.length > 0 || loadingData ? (
      <CorrelationGraph
        loadingData={loadingData}
        graph={this.state.graphData.graph}
        options={{ ...graphRenderOptions }}
        events={this.state.graphData.events}
        getNetwork={this.setNetwork}
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
          <EuiButton fill={true} color="primary" href={`#${ROUTES.CORRELATION_RULE_CREATE}`}>
            Create correlation rule
          </EuiButton>,
        ]}
      />
    );
  }

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
            maxWidth="400px"
            key={findingCardsData.finding.id}
          >
            <EuiFlyoutHeader>
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
              <EuiHorizontalRule margin="xs" />
              <EuiSpacer size="xs" />
              <FindingCard
                id={findingCardsData.finding.id}
                logType={findingCardsData.finding.logType}
                timestamp={findingCardsData.finding.timestamp}
                detectionRule={findingCardsData.finding.detectionRule}
                finding={findingCardsData.finding}
                findings={findingCardsData.correlatedFindings}
              />
            </EuiFlyoutHeader>
            <EuiFlyoutBody>
              <EuiTitle size="xs">
                <p>Correlated Findings ({findingCardsData.correlatedFindings.length})</p>
              </EuiTitle>
              <EuiText color="subdued" size="xs">
                Higher correlation score indicated stronger correlation.
              </EuiText>
              <EuiSpacer />
              {findingCardsData.correlatedFindings.map((finding, index) => {
                return (
                  <>
                    <FindingCard
                      key={index}
                      id={finding.id}
                      logType={finding.logType}
                      timestamp={finding.timestamp}
                      detectionRule={finding.detectionRule}
                      correlationData={{
                        score: finding.correlationScore || 'N/A',
                        onInspect: this.onFindingInspect,
                      }}
                      finding={finding}
                      findings={[...findingCardsData.correlatedFindings, findingCardsData.finding]}
                    />
                    <EuiSpacer size="m" />
                  </>
                );
              })}
            </EuiFlyoutBody>
          </EuiFlyout>
        ) : null}
        <EuiFlexGroup direction="column">
          <EuiFlexItem>
            <EuiFlexGroup>
              <EuiFlexItem>
                <EuiTitle size="m">
                  <h1>Correlations</h1>
                </EuiTitle>
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
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiPanel>
              <EuiFlexGroup gutterSize="xs" wrap={false} justifyContent="flexEnd">
                <EuiFlexItem grow={false}>
                  <EuiFilterGroup>
                    <FilterGroup
                      groupName="Log types"
                      items={this.state.logTypeFilterOptions}
                      hasGroupOptions={true}
                      hasFooter={true}
                      setItems={this.onLogTypeFilterChange}
                    />
                    <FilterGroup
                      groupName="Severity"
                      items={this.state.severityFilterOptions}
                      setItems={this.onSeverityFilterChange}
                    />
                  </EuiFilterGroup>
                </EuiFlexItem>
                <EuiFlexItem grow={false}>
                  <EuiButtonEmpty onClick={this.resetFilters}>Reset filters</EuiButtonEmpty>
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
                      <EuiIcon type="dot" color={sev.color.background} /> {sev.value}
                    </EuiText>
                  </EuiFlexItem>
                ))}
              </EuiFlexGroup>

              <EuiSpacer />
              {this.renderCorrelationsGraph(this.state.loadingGraphData)}
            </EuiPanel>
          </EuiFlexItem>
        </EuiFlexGroup>
      </>
    );
  }
}
