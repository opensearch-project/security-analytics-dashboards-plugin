/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import {
  CorrelationFinding,
  CorrelationGraphData,
  DataSourceProps,
  DateTimeFilter,
  FindingItemType,
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
  EuiCompressedSuperDatePicker,
  EuiSpacer,
  EuiSmallButtonEmpty,
  EuiFlyout,
  EuiFlyoutHeader,
  EuiFlyoutBody,
  EuiSmallButtonIcon,
  EuiText,
  EuiEmptyPrompt,
  EuiSmallButton,
  EuiBadge,
  EuiFilterGroup,
  EuiHorizontalRule,
  EuiButtonGroup,
  EuiBasicTableColumn,
  EuiToolTip,
  EuiInMemoryTable,
  EuiTextColor,
  EuiLink,
  EuiFieldSearch,
} from '@elastic/eui';
import { FilterItem, FilterGroup } from '../components/FilterGroup';
import {
  BREADCRUMBS,
  DEFAULT_DATE_RANGE,
  MAX_RECENTLY_USED_TIME_RANGES,
  ROUTES,
} from '../../../utils/constants';
import { CorrelationGraph } from '../components/CorrelationGraph';
import { FindingCard } from '../components/FindingCard';
import { DataStore } from '../../../store/DataStore';
import datemath from '@elastic/datemath';
import { ruleSeverity } from '../../Rules/utils/constants';
import { renderToStaticMarkup } from 'react-dom/server';
import { Network } from 'react-graph-vis';
import { getLogTypeLabel } from '../../LogTypes/utils/helpers';
import { NotificationsStart } from 'opensearch-dashboards/public';
import {
  capitalizeFirstLetter,
  errorNotificationToast,
  renderVisualization,
  setBreadcrumbs,
} from '../../../utils/helpers';
import { PageHeader } from '../../../components/PageHeader/PageHeader';
import moment from 'moment';
import { ChartContainer } from '../../../components/Charts/ChartContainer';
import {
  addInteractiveLegends,
  DateOpts,
  defaultDateFormat,
  defaultScaleDomain,
  defaultTimeUnit,
  getChartTimeUnit,
  getDomainRange,
  getTimeTooltip,
  getVisualizationSpec,
  getXAxis,
  getYAxis,
} from '../../Overview/utils/helpers';
import { debounce } from 'lodash';

export const DEFAULT_EMPTY_DATA = '-';

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
  notifications: NotificationsStart | null;
}

interface SpecificFindingCorrelations {
  finding: CorrelationFinding;
  correlatedFindings: CorrelationFinding[];
}

interface CorrelationsTableData {
  id: string;
  startTime: number;
  correlationRule: string;
  alertSeverity: string[];
  logTypes: string[];
  findingsSeverity: string[];
  correlatedFindings: CorrelationFinding[];
  resources: string[];
}

interface FlyoutTableData {
  timestamp: string;
  mitreTactic: string[];
  detectionRule: string;
  severity: string;
}

interface CorrelationsState {
  recentlyUsedRanges: any[];
  graphData: CorrelationGraphData;
  specificFindingInfo?: SpecificFindingCorrelations;
  logTypeFilterOptions: FilterItem[];
  severityFilterOptions: FilterItem[];
  loadingGraphData: boolean;
  isGraphView: Boolean;
  correlationsTableData: CorrelationsTableData[];
  connectedFindings: CorrelationFinding[][];
  isFlyoutOpen: boolean;
  selectedTableRow: CorrelationsTableData | null;
  searchTerm: string;
}

export const renderTime = (time: number | string) => {
  const momentTime = moment(time);
  if (time && momentTime.isValid()) return momentTime.format('MM/DD/YY h:mm a');
  return DEFAULT_EMPTY_DATA;
};

export interface CorrelationsTableProps {
  finding: FindingItemType;
  correlatedFindings: CorrelationFinding[];
  history: RouteComponentProps['history'];
  isLoading: boolean;
  filterOptions: {
    logTypes: Set<string>;
    ruleSeverity: Set<string>;
  };
}

export class Correlations extends React.Component<CorrelationsProps, CorrelationsState> {
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
      isGraphView: true,
      correlationsTableData: [],
      connectedFindings: [],
      isFlyoutOpen: false,
      selectedTableRow: null,
      searchTerm: '',
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
    setBreadcrumbs([BREADCRUMBS.CORRELATIONS]);
    this.updateState(true /* onMount */);
    this.props.onMount();
    this.fetchCorrelationsTableData();
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
      const finding = (await DataStore.findings.getFindingsByIds([findingId]))[0];
      detectorType = finding?.detectionType;
    }

    if (!detectorType) {
      errorNotificationToast(this.props.notifications, 'show', 'correlated findings');
      return;
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
    this.setState(
      {
        logTypeFilterOptions: items,
      },
      () => {
        // If there's specific finding info, update the graph
        if (this.state.specificFindingInfo) {
          this.updateGraphDataState(this.state.specificFindingInfo);
        }
        // Force update to refresh the table with new filters
        this.forceUpdate();
      }
    );
  };

  onSeverityFilterChange = (items: FilterItem[]) => {
    this.setState(
      {
        severityFilterOptions: items,
      },
      () => {
        // If there's specific finding info, update the graph
        if (this.state.specificFindingInfo) {
          this.updateGraphDataState(this.state.specificFindingInfo);
        }
        // Force update to refresh the table with new filters
        this.forceUpdate();
      }
    );
  };

  closeFlyout = () => {
    this.setState({ specificFindingInfo: undefined });
  };

  private openTableFlyout = (correlationTableRow: CorrelationsTableData) => {
    let newGraphData: CorrelationGraphData = {
      graph: {
        nodes: [],
        edges: [],
      },
      events: {
        click: this.onNodeClick,
      },
    };

    if (correlationTableRow.correlatedFindings) {
      const correlationPairs = this.getCorrelationPairs(correlationTableRow.correlatedFindings);
      newGraphData = this.prepareGraphData(correlationPairs);
    }

    // Set all required state at once
    this.setState({
      isFlyoutOpen: true,
      selectedTableRow: correlationTableRow,
      graphData: newGraphData,
    });
  };

  private closeTableFlyout = () => {
    this.setState({
      isFlyoutOpen: false,
      selectedTableRow: null,
      graphData: {
        graph: { nodes: [], edges: [] },
        events: { click: this.onNodeClick },
      },
    });
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
      <>
        <EuiFlexGroup wrap={true} gutterSize="m" justifyContent="flexStart" alignItems="center">
          <EuiFlexItem grow={false}>
            <EuiText size="s">
              <strong>Severity:</strong>
            </EuiText>
          </EuiFlexItem>
          {ruleSeverity.map((sev, idx) => (
            <EuiFlexItem grow={false} key={idx}>
              <EuiText size="s">
                <EuiIcon type="dot" color={sev.color.background} /> {sev.value}
              </EuiText>
            </EuiFlexItem>
          ))}
        </EuiFlexGroup>
        <EuiSpacer />
        <CorrelationGraph
          loadingData={loadingData}
          graph={this.state.graphData.graph}
          options={{ ...graphRenderOptions }}
          events={this.state.graphData.events}
          getNetwork={this.setNetwork}
        />
      </>
    ) : (
      <EuiEmptyPrompt
        title={
          <EuiText size="s">
            <h2>No correlations found</h2>
          </EuiText>
        }
        body={
          <EuiText size="s">
            <p>There are no correlated findings in the system.</p>
          </EuiText>
        }
        actions={[
          <EuiSmallButton fill={true} color="primary" href={`#${ROUTES.CORRELATION_RULE_CREATE}`}>
            Create correlation rule
          </EuiSmallButton>,
        ]}
      />
    );
  }

  private mapConnectedCorrelations(
    correlations: {
      finding1: CorrelationFinding;
      finding2: CorrelationFinding;
    }[]
  ) {
    const connectionsMap = new Map<string, Set<string>>();
    const findingsMap = new Map<string, CorrelationFinding>();

    correlations.forEach((correlation) => {
      const { finding1, finding2 } = correlation;

      findingsMap.set(finding1.id, finding1);
      findingsMap.set(finding2.id, finding2);

      if (!connectionsMap.has(finding1.id)) {
        connectionsMap.set(finding1.id, new Set<string>());
      }
      connectionsMap.get(finding1.id)!.add(finding2.id);

      if (!connectionsMap.has(finding2.id)) {
        connectionsMap.set(finding2.id, new Set<string>());
      }
      connectionsMap.get(finding2.id)!.add(finding1.id);
    });

    const visited = new Set<string>();
    const connectedGroups: CorrelationFinding[][] = [];

    function dfs(findingId: string, currentGroup: CorrelationFinding[]) {
      visited.add(findingId);
      const finding = findingsMap.get(findingId);
      if (finding) {
        currentGroup.push(finding);
      }

      const connections = connectionsMap.get(findingId) || new Set<string>();
      connections.forEach((connectedId) => {
        if (!visited.has(connectedId)) {
          dfs(connectedId, currentGroup);
        }
      });
    }

    connectionsMap.forEach((_, findingId) => {
      if (!visited.has(findingId)) {
        const currentGroup: CorrelationFinding[] = [];
        dfs(findingId, currentGroup);
        if (currentGroup.length > 0) {
          connectedGroups.push(currentGroup);
        }
      }
    });

    return connectedGroups;
  }

  private fetchCorrelationsTableData = async () => {
    try {
      const start = datemath.parse(this.startTime);
      const end = datemath.parse(this.endTime);
      const startTime = start?.valueOf() || Date.now();
      const endTime = end?.valueOf() || Date.now();

      let allCorrelations = await DataStore.correlations.getAllCorrelationsInWindow(
        startTime.toString(),
        endTime.toString()
      );

      const connectedFindings = this.mapConnectedCorrelations(allCorrelations);

      this.setState({ connectedFindings: connectedFindings });

      const tableData: CorrelationsTableData[] = [];

      const allCorrelationRules = await DataStore.correlations.getCorrelationRules();
      const allCorrelatedAlerts = await DataStore.correlations.getAllCorrelationAlerts();

      const correlationRuleMapsAlerts: { [id: string]: string[] } = {};

      allCorrelationRules.forEach((correlationRule) => {
        const correlationRuleId = correlationRule.id;
        correlationRuleMapsAlerts[correlationRuleId] = [];

        allCorrelatedAlerts.correlationAlerts.forEach((correlatedAlert) => {
          if (correlatedAlert.correlation_rule_id === correlationRuleId) {
            correlationRuleMapsAlerts[correlationRuleId].push(correlatedAlert.severity);
          }
        });
      });

      for (const findingGroup of connectedFindings) {
        let correlationRule = '';
        const logTypes = new Set<string>();
        const findingsSeverity: string[] = [];
        let alertsSeverity: string[] = [];
        const resources: string[] = [];

        for (const finding of findingGroup) {
          findingsSeverity.push(finding.detectionRule.severity);
          logTypes.add(finding.logType);
        }

        // Call the APIs only if correlationRule has not been found yet to avoid repeated API calls.
        if (correlationRule === '') {
          if (findingGroup[0] && findingGroup[0].detector && findingGroup[0].detector._source) {
            const correlatedFindingsResponse = await DataStore.correlations.getCorrelatedFindings(
              findingGroup[0].id,
              findingGroup[0]?.detector._source?.detector_type
            );
            if (
              correlatedFindingsResponse.correlatedFindings &&
              correlatedFindingsResponse.correlatedFindings[0] &&
              correlatedFindingsResponse.correlatedFindings[0].rules
            ) {
              const correlationRuleId = correlatedFindingsResponse.correlatedFindings[0].rules[0];
              const correlationRuleObj =
                (await DataStore.correlations.getCorrelationRule(correlationRuleId)) || '';
              alertsSeverity = correlationRuleMapsAlerts[correlationRuleId];
              if (correlationRuleObj) {
                correlationRule = correlationRuleObj.name;
                correlationRuleObj.queries.map((query) => {
                  query.conditions.map((condition) => {
                    resources.push(condition.name + ': ' + condition.value);
                  });
                });
              }
            }
          }
        }

        tableData.push({
          id: `${startTime}_${findingGroup[0]?.id}`,
          startTime: startTime,
          correlationRule: correlationRule,
          logTypes: Array.from(logTypes),
          alertSeverity: alertsSeverity,
          findingsSeverity: findingsSeverity,
          correlatedFindings: findingGroup,
          resources: resources,
        });
      }

      this.setState({
        correlationsTableData: tableData,
      });
    } catch (error) {
      console.error('Failed to fetch correlation rules:', error);
    }
  };

  private getCorrelatedFindingsVisualizationSpec = (
    visualizationData: any[],
    dateOpts: DateOpts = {
      timeUnit: defaultTimeUnit,
      dateFormat: defaultDateFormat,
      domain: defaultScaleDomain,
    }
  ) => {
    return getVisualizationSpec('Correlated Findings data overview', visualizationData, [
      addInteractiveLegends({
        mark: {
          type: 'bar',
          clip: true,
        },
        encoding: {
          tooltip: [getYAxis('correlatedFinding', 'Correlated Findings'), getTimeTooltip(dateOpts)],
          x: getXAxis(dateOpts),
          y: getYAxis('correlatedFinding', 'Count'),
          color: {
            field: 'title',
            legend: {
              title: 'Legend',
            },
          },
        },
      }),
    ]);
  };

  private generateVisualizationSpec = (connectedFindings: CorrelationFinding[][]) => {
    const visData = connectedFindings.map((correlatedFindings) => {
      return {
        title: 'Correlated Findings',
        correlatedFinding: correlatedFindings.length,
        time: correlatedFindings[0].timestamp,
      };
    });

    const {
      dateTimeFilter = {
        startTime: DEFAULT_DATE_RANGE.start,
        endTime: DEFAULT_DATE_RANGE.end,
      },
    } = this.props;

    const chartTimeUnits = getChartTimeUnit(dateTimeFilter.startTime, dateTimeFilter.endTime);

    return this.getCorrelatedFindingsVisualizationSpec(visData, {
      timeUnit: chartTimeUnits.timeUnit,
      dateFormat: chartTimeUnits.dateFormat,
      domain: getDomainRange(
        [dateTimeFilter.startTime, dateTimeFilter.endTime],
        chartTimeUnits.timeUnit.unit
      ),
    });
  };

  private renderCorrelatedFindingsChart = () => {
    renderVisualization(
      this.generateVisualizationSpec(this.state.connectedFindings),
      'correlated-findings-view'
    );

    return (
      <>
        <EuiPanel>
          <EuiFlexGroup direction="column" gutterSize="m">
            <EuiFlexItem>
              <EuiFlexGroup justifyContent="spaceBetween">
                <EuiFlexItem grow={false}>
                  <EuiTitle size="s">
                    <h3>Correlated Findings</h3>
                  </EuiTitle>
                </EuiFlexItem>
              </EuiFlexGroup>
            </EuiFlexItem>
            <EuiFlexItem>
              <ChartContainer chartViewId={'correlated-findings-view'} />
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiPanel>
        <EuiSpacer />
      </>
    );
  };

  private getFilteredTableData = (tableData: CorrelationsTableData[]): CorrelationsTableData[] => {
    const { logTypeFilterOptions, severityFilterOptions } = this.state;
    const alertSeverityMap: { [key: string]: string } = {
      '1': 'critical',
      '2': 'high',
      '3': 'medium',
      '4': 'low',
      '5': 'informational',
    };

    const selectedLogTypes = logTypeFilterOptions
      .filter((item) => item.checked === 'on' && item.visible)
      .map((item) => item.id);

    const selectedSeverities = severityFilterOptions
      .filter((item) => item.checked === 'on' && item.visible)
      .map((item) => item.id.toLowerCase());

    return tableData.filter((row) => {
      const logTypeMatch = row.logTypes.some((logType) => selectedLogTypes.includes(logType));

      const severityMatch = row.alertSeverity.some((severity) =>
        selectedSeverities.includes(alertSeverityMap[severity])
      );

      const searchLower = this.state.searchTerm.toLowerCase();
      const searchMatch =
        this.state.searchTerm === '' ||
        row.correlationRule?.toLowerCase().includes(searchLower) ||
        row.logTypes.some((type) => type.toLowerCase().includes(searchLower)) ||
        row.alertSeverity.some((severity) =>
          alertSeverityMap[severity].toLowerCase().includes(searchLower)
        ) ||
        row.findingsSeverity.some((severity) => severity.toLowerCase().includes(searchLower)) ||
        row.resources.some((resource) => resource.toLowerCase().includes(searchLower));
      return logTypeMatch && severityMatch && searchMatch;
    });
  };

  private debouncedSearch = debounce((searchTerm: string) => {
    this.setState({ searchTerm }, () => {
      this.forceUpdate();
    });
  }, 300);

  private renderSearchBar = () => {
    return (
      <EuiFieldSearch
        placeholder="Search"
        value={this.state.searchTerm}
        onChange={(e) => {
          e.persist();
          const searchValue = e.target.value;
          this.setState({ searchTerm: searchValue });
          this.debouncedSearch(searchValue);
        }}
        fullWidth={true}
        isClearable={true}
        compressed={true}
        aria-label="Search correlations"
      />
    );
  };

  private renderCorrelationsTable = () => {
    const alertSeverityMap: { [key: string]: string } = {
      '1': 'critical',
      '2': 'high',
      '3': 'medium',
      '4': 'low',
      '5': 'informational',
    };

    const columns: EuiBasicTableColumn<CorrelationsTableData>[] = [
      {
        field: 'startTime',
        name: 'Start time',
        sortable: true,
        dataType: 'date',
        render: (startTime: number) => {
          return new Date(startTime).toLocaleString();
        },
      },
      {
        field: 'correlationRule',
        name: 'Correlation Rule',
        sortable: true,
        render: (name: string) => name || 'N/A',
      },
      {
        field: 'logTypes',
        name: 'Log Types',
        sortable: true,
        render: (logTypes: string[]) => {
          if (!logTypes || logTypes.length === 0) return DEFAULT_EMPTY_DATA;
          const MAX_DISPLAY = 2;
          const remainingCount = logTypes.length > MAX_DISPLAY ? logTypes.length - MAX_DISPLAY : 0;
          const displayedLogTypes = logTypes.slice(0, MAX_DISPLAY).map((logType) => {
            const label = logType;
            return <EuiBadge>{label}</EuiBadge>;
          });
          const tooltipContent = (
            <>
              {logTypes.slice(MAX_DISPLAY).map((logType) => {
                const label = logType;
                return (
                  <div style={{ display: 'flex', flexDirection: 'column', padding: '4px' }}>
                    <EuiBadge>{label}</EuiBadge>
                  </div>
                );
              })}
            </>
          );
          return (
            <span
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: '4px',
                whiteSpace: 'normal',
                flexWrap: 'wrap',
                width: '100%',
              }}
            >
              {displayedLogTypes}
              {remainingCount > 0 && (
                <EuiToolTip content={tooltipContent} position="top">
                  <EuiBadge>{`+${remainingCount} more`}</EuiBadge>
                </EuiToolTip>
              )}
            </span>
          );
        },
      },
      {
        field: 'alertSeverity',
        name: 'Alert Severity',
        sortable: true,
        render: (alertSeverity: string[]) => {
          if (!alertSeverity || alertSeverity.length === 0) return DEFAULT_EMPTY_DATA;
          const MAX_DISPLAY = 2;
          const remainingCount =
            alertSeverity.length > MAX_DISPLAY ? alertSeverity.length - MAX_DISPLAY : 0;
          const displayedSeverities = alertSeverity.slice(0, MAX_DISPLAY).map((severity) => {
            const label = alertSeverityMap[severity];
            const { background, text } = getSeverityColor(label);
            return (
              <EuiBadge key={severity} style={{ backgroundColor: background, color: text }}>
                {label}
              </EuiBadge>
            );
          });

          const tooltipContent = (
            <>
              {alertSeverity.slice(MAX_DISPLAY).map((severity) => {
                const label = alertSeverityMap[severity];
                const { background, text } = getSeverityColor(label);
                return (
                  <div style={{ display: 'flex', flexDirection: 'column', padding: '4px' }}>
                    <EuiBadge key={severity} style={{ backgroundColor: background, color: text }}>
                      {label}
                    </EuiBadge>
                  </div>
                );
              })}
            </>
          );

          return (
            <span
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: '4px',
                whiteSpace: 'normal',
                flexWrap: 'wrap',
                width: '100%',
              }}
            >
              {displayedSeverities}
              {remainingCount > 0 && (
                <EuiToolTip content={tooltipContent} position="top">
                  <EuiBadge>{`+${remainingCount} more`}</EuiBadge>
                </EuiToolTip>
              )}
            </span>
          );
        },
      },
      {
        field: 'findingsSeverity',
        name: 'Findings Severity',
        sortable: true,
        render: (findingsSeverity: string[]) => {
          if (!findingsSeverity || findingsSeverity.length === 0) return DEFAULT_EMPTY_DATA;
          const MAX_DISPLAY = 2;
          const remainingCount =
            findingsSeverity.length > MAX_DISPLAY ? findingsSeverity.length - MAX_DISPLAY : 0;
          const displayedSeverities = findingsSeverity.slice(0, MAX_DISPLAY).map((severity) => {
            const label = getSeverityLabel(severity);
            const { background, text } = getSeverityColor(label);
            return (
              <EuiBadge key={severity} style={{ backgroundColor: background, color: text }}>
                {label}
              </EuiBadge>
            );
          });

          const tooltipContent = (
            <div
              style={{
                maxWidth: '300px',
                maxHeight: '400px',
                overflow: 'auto',
              }}
            >
              {findingsSeverity.slice(MAX_DISPLAY).map((severity) => {
                const label = getSeverityLabel(severity);
                const { background, text } = getSeverityColor(label);
                return (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      padding: '4px',
                      width: '100%',
                    }}
                  >
                    <EuiBadge key={severity} style={{ backgroundColor: background, color: text }}>
                      {label}
                    </EuiBadge>
                  </div>
                );
              })}
            </div>
          );

          return (
            <span
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: '4px',
                whiteSpace: 'normal',
                flexWrap: 'wrap',
                width: '100%',
              }}
            >
              {displayedSeverities}
              {remainingCount > 0 && (
                <EuiToolTip content={tooltipContent} position="top">
                  <EuiBadge>{`+${remainingCount} more`}</EuiBadge>
                </EuiToolTip>
              )}
            </span>
          );
        },
      },
      {
        field: 'resources',
        name: 'Resources',
        sortable: true,
        render: (resources: string[]) => {
          if (!resources || resources.length === 0) return DEFAULT_EMPTY_DATA;
          const MAX_DISPLAY = 2;
          const remainingCount =
            resources.length > MAX_DISPLAY ? resources.length - MAX_DISPLAY : 0;
          const displayedResources = resources.slice(0, MAX_DISPLAY).map((resource) => {
            return (
              <EuiBadge style={{ backgroundColor: '#fff', border: '1px solid #d3dae6' }}>
                {resource}
              </EuiBadge>
            );
          });

          const tooltipContent = (
            <>
              {resources.slice(MAX_DISPLAY).map((resource) => {
                return (
                  <div style={{ display: 'flex', flexDirection: 'column', padding: '4px' }}>
                    <EuiBadge>{resource}</EuiBadge>
                  </div>
                );
              })}
            </>
          );

          return (
            <span
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: '4px',
                whiteSpace: 'normal',
                flexWrap: 'wrap',
                width: '100%',
              }}
            >
              {displayedResources}
              {remainingCount > 0 && (
                <EuiToolTip content={tooltipContent} position="top">
                  <EuiBadge>{`+${remainingCount} more`}</EuiBadge>
                </EuiToolTip>
              )}
            </span>
          );
        },
      },
      {
        field: 'actions',
        name: 'Actions',
        render: (_, correlationTableRow: CorrelationsTableData) => {
          return (
            <EuiToolTip content={'View details'}>
              <EuiSmallButtonIcon
                aria-label={'View details'}
                data-test-subj={`view-details-icon`}
                iconType={'inspect'}
                onClick={() => {
                  this.openTableFlyout(correlationTableRow);
                }}
              />
            </EuiToolTip>
          );
        },
      },
    ];

    const getRowProps = (item: any) => {
      return {
        'data-test-subj': `row-${item.id}`,
        key: item.id,
        className: 'euiTableRow',
      };
    };

    const filteredTableData = this.getFilteredTableData(this.state.correlationsTableData);

    return (
      <>
        {this.renderCorrelatedFindingsChart()}

        <EuiInMemoryTable
          items={filteredTableData}
          rowProps={getRowProps}
          columns={columns}
          pagination={{
            initialPageSize: 5,
            pageSizeOptions: [5, 10, 20],
          }}
          responsive={true}
          tableLayout="auto"
        />
      </>
    );
  };

  private prepareGraphData = (correlationPairs: CorrelationFinding[][] | [any, any][]) => {
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

    correlationPairs.forEach((correlation: CorrelationFinding[]) => {
      const possibleCombination1 = `${correlation[0].id}:${correlation[1].id}`;
      const possibleCombination2 = `${correlation[1].id}:${correlation[0].id}`;

      if (createdEdges.has(possibleCombination1) || createdEdges.has(possibleCombination2)) {
        return;
      }

      if (!createdNodes.has(correlation[0].id)) {
        this.addNode(graphData.graph.nodes, correlation[0]);
        createdNodes.add(correlation[0].id);
      }
      if (!createdNodes.has(correlation[1].id)) {
        this.addNode(graphData.graph.nodes, correlation[1]);
        createdNodes.add(correlation[1].id);
      }
      this.addEdge(graphData.graph.edges, correlation[0], correlation[1]);
      createdEdges.add(possibleCombination1);
    });

    return graphData;
  };

  private getCorrelationPairs = (correlatedFindings: any[]) => {
    const pairs: [any, any][] = [];
    for (let i = 0; i < correlatedFindings.length; i++) {
      for (let j = i + 1; j < correlatedFindings.length; j++) {
        pairs.push([correlatedFindings[i], correlatedFindings[j]]);
      }
    }
    return pairs;
  };

  private renderTableFlyout = () => {
    const { isFlyoutOpen, selectedTableRow, graphData } = this.state;

    if (!isFlyoutOpen || !selectedTableRow) {
      return null;
    }

    const findingsTableColumns: EuiBasicTableColumn<FlyoutTableData>[] = [
      {
        field: 'timestamp',
        name: 'Time',
        render: (timestamp: string) => new Date(timestamp).toLocaleString(),
        sortable: true,
      },
      {
        field: 'mitreTactic',
        name: 'Mitre Tactic',
        sortable: true,
      },
      {
        field: 'detectionRule',
        name: 'Detection Rule',
        sortable: true,
      },
      {
        field: 'severity',
        name: 'Severity',
        render: (ruleSeverity: string) => {
          const severity = capitalizeFirstLetter(ruleSeverity) || DEFAULT_EMPTY_DATA;
          const { background, text } = getSeverityColor(severity);

          return (
            <EuiBadge color={background} style={{ color: text }}>
              {severity}
            </EuiBadge>
          );
        },
      },
    ];

    const flyoutTableData: FlyoutTableData[] = [];

    selectedTableRow.correlatedFindings.map((correlatedFinding) => {
      flyoutTableData.push({
        timestamp: correlatedFinding.timestamp,
        mitreTactic:
          correlatedFinding.detectionRule.tags?.map((mitreTactic) => mitreTactic.value) || [],
        detectionRule: correlatedFinding.detectionRule.name,
        severity: correlatedFinding.detectionRule.severity,
      });
    });

    return (
      <EuiFlyout ownFocus onClose={this.closeTableFlyout} size="l" aria-labelledby="flyoutTitle">
        <EuiFlyoutHeader hasBorder>
          <EuiTitle size="m">
            <h2 id="flyoutTitle">Correlation Details</h2>
          </EuiTitle>
          <EuiSpacer />
          <EuiFlexGroup>
            <EuiFlexItem>
              <EuiText>
                <p>
                  <EuiTextColor color="subdued">Time</EuiTextColor>
                  <br />
                  {new Date(selectedTableRow.startTime).toLocaleString()}
                </p>
              </EuiText>
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiText>
                <p>
                  <EuiTextColor color="subdued">Correlation Rule</EuiTextColor>
                  <br />
                  {selectedTableRow.correlationRule}
                </p>
              </EuiText>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlyoutHeader>
        <EuiFlyoutBody>
          <div style={{ height: '100%', overflowY: 'auto' }}>
            <EuiPanel>
              <EuiTitle>
                <h3>Correlated Findings</h3>
              </EuiTitle>
              {selectedTableRow.correlatedFindings && (
                <CorrelationGraph
                  loadingData={this.state.loadingGraphData}
                  graph={graphData.graph}
                  options={{
                    ...graphRenderOptions,
                    height: '300px',
                    width: '100%',
                    autoResize: true,
                  }}
                  events={graphData.events}
                  getNetwork={this.setNetwork}
                />
              )}
            </EuiPanel>
            <EuiSpacer />
            <EuiTitle size="xs">
              <h3>Findings</h3>
            </EuiTitle>
            <EuiInMemoryTable
              items={flyoutTableData || []}
              columns={findingsTableColumns}
              pagination={{
                initialPageSize: 5,
                pageSizeOptions: [5, 10, 20],
              }}
              sorting={true}
            />
            <EuiSpacer size="l" />
            <EuiFlexGroup wrap responsive={false} gutterSize="m">
              {Array.from(
                new Set(
                  selectedTableRow.correlatedFindings.flatMap(
                    (finding) => finding.detectionRule.tags?.map((tag) => tag.value) || []
                  )
                )
              ).map((tactic, i) => {
                const link = `https://attack.mitre.org/techniques/${tactic
                  .split('.')
                  .slice(1)
                  .join('/')
                  .toUpperCase()}`;

                return (
                  <EuiFlexItem grow={false} key={i}>
                    <EuiBadge color={'#DDD'}>
                      <EuiLink href={link} target="_blank">
                        {tactic}
                      </EuiLink>
                    </EuiBadge>
                  </EuiFlexItem>
                );
              })}
            </EuiFlexGroup>
          </div>
        </EuiFlyoutBody>
      </EuiFlyout>
    );
  };

  toggleView = () => {
    this.setState((prevState) => ({
      isGraphView: !prevState.isGraphView,
    }));
  };

  render() {
    const findingCardsData = this.state.specificFindingInfo;
    const datePicker = (
      <EuiCompressedSuperDatePicker
        start={this.startTime}
        end={this.endTime}
        recentlyUsedRanges={this.state.recentlyUsedRanges}
        onTimeChange={this.onTimeChange}
        onRefresh={this.onRefresh}
        updateButtonProps={{ fill: false }}
      />
    );

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
                  <EuiText size="s">
                    <h2>Correlation</h2>
                  </EuiText>
                </EuiFlexItem>
                <EuiFlexItem grow={false}>
                  <EuiSmallButtonIcon
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
        <EuiFlexGroup direction="column" gutterSize={'m'}>
          <PageHeader
            appRightControls={[
              {
                renderComponent: datePicker,
              },
            ]}
          >
            <EuiFlexItem>
              <EuiFlexGroup>
                <EuiFlexItem>
                  <EuiText size="s">
                    <h1>Correlations</h1>
                  </EuiText>
                </EuiFlexItem>
                <EuiFlexItem grow={false}>{datePicker}</EuiFlexItem>
              </EuiFlexGroup>
            </EuiFlexItem>
          </PageHeader>
          <EuiFlexItem>
            <EuiPanel>
              <EuiFlexGroup gutterSize="xs" wrap={false} justifyContent="flexEnd">
                <EuiFlexItem grow={true}>{this.renderSearchBar()}</EuiFlexItem>
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
                  <EuiSmallButtonEmpty onClick={this.resetFilters}>
                    Reset filters
                  </EuiSmallButtonEmpty>
                </EuiFlexItem>
                <EuiFlexItem grow={false}>
                  <EuiButtonGroup
                    legend="View type"
                    options={[
                      {
                        id: 'graph',
                        label: 'Graph',
                        iconType: 'visNetwork',
                      },
                      {
                        id: 'table',
                        label: 'Table',
                        iconType: 'tableOfContents',
                      },
                    ]}
                    idSelected={this.state.isGraphView ? 'graph' : 'table'}
                    onChange={(id) => this.setState({ isGraphView: id === 'graph' })}
                    buttonSize="s"
                  />
                </EuiFlexItem>
              </EuiFlexGroup>
              <EuiSpacer />
              {this.state.isGraphView
                ? this.renderCorrelationsGraph(this.state.loadingGraphData)
                : this.renderCorrelationsTable()}
            </EuiPanel>
          </EuiFlexItem>
        </EuiFlexGroup>
        {this.renderTableFlyout()}
      </>
    );
  }
}
