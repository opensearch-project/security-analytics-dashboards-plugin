/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { EuiLoadingChart } from '@elastic/eui';
import { DEFAULT_DATE_RANGE, ROUTES } from '../../../utils/constants';
import { getChartTimeUnit, getDomainRange } from '../../Overview/utils/helpers';
import { getCorrelatedFindingsVisualizationSpec } from '../utils/helpers';
import { CorrelationsTableData } from './CorrelationsContainer';
import { CorrelationsTable } from './CorrelationsTable';
import { CorrelationFinding, CorrelationGraphData } from '../../../../types';
import { FilterItem } from '../components/FilterGroup';
import { CorrelationsTableFlyout } from './CorrelationsTableFlyout';
import { Network } from 'react-graph-vis';
import { emptyGraphData } from '../utils/constants';

interface CorrelationsTableViewProps {
  dateTimeFilter?: {
    startTime: string;
    endTime: string;
  };
  correlationsTableData: CorrelationsTableData[];
  connectedFindings: CorrelationFinding[][];
  loadingTableData: boolean;
  logTypeFilterOptions: FilterItem[];
  severityFilterOptions: FilterItem[];
  searchTerm: string;
  addNode: (nodes: any[], finding: CorrelationFinding) => void;
  addEdge: (edges: any[], f1: CorrelationFinding, f2: CorrelationFinding) => void;
  onNodeClick: (params: any) => void;
  setNetwork: (network: Network) => void;
  createNodeTooltip: ({ detectionRule, timestamp, logType }: CorrelationFinding) => Element | null;
}

interface CorrelationsTableViewState {
  isFlyoutOpen: boolean;
  selectedTableRow: CorrelationsTableData | null;
  flyoutGraphData: CorrelationGraphData;
}

export class CorrelationsTableView extends React.Component<
  CorrelationsTableViewProps,
  CorrelationsTableViewState
> {
  static defaultProps = {
    dateTimeFilter: {
      startTime: DEFAULT_DATE_RANGE.start,
      endTime: DEFAULT_DATE_RANGE.end,
    },
  };

  constructor(props: CorrelationsTableViewProps) {
    super(props);
    this.state = {
      isFlyoutOpen: false,
      selectedTableRow: null,
      flyoutGraphData: { ...emptyGraphData },
    };
  }

  private getCorrelationPairs = (correlatedFindings: any[]) => {
    const pairs: [any, any][] = [];
    for (let i = 0; i < correlatedFindings.length; i++) {
      for (let j = i + 1; j < correlatedFindings.length; j++) {
        pairs.push([correlatedFindings[i], correlatedFindings[j]]);
      }
    }
    return pairs;
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
        click: this.props.onNodeClick,
      },
    };

    correlationPairs.forEach((correlation: CorrelationFinding[]) => {
      const possibleCombination1 = `${correlation[0].id}:${correlation[1].id}`;
      const possibleCombination2 = `${correlation[1].id}:${correlation[0].id}`;

      if (createdEdges.has(possibleCombination1) || createdEdges.has(possibleCombination2)) {
        return;
      }

      if (!createdNodes.has(correlation[0].id)) {
        this.props.addNode(graphData.graph.nodes, correlation[0]);
        createdNodes.add(correlation[0].id);
      }
      if (!createdNodes.has(correlation[1].id)) {
        this.props.addNode(graphData.graph.nodes, correlation[1]);
        createdNodes.add(correlation[1].id);
      }
      this.props.addEdge(graphData.graph.edges, correlation[0], correlation[1]);
      createdEdges.add(possibleCombination1);
    });

    return graphData;
  };

  private openTableFlyout = (correlationTableRow: CorrelationsTableData) => {
    let newGraphData: CorrelationGraphData = {
      graph: {
        nodes: [],
        edges: [],
      },
      events: {
        click: this.props.onNodeClick,
      },
    };
    if (correlationTableRow.correlatedFindings) {
      const correlationPairs = this.getCorrelationPairs(correlationTableRow.correlatedFindings);
      newGraphData = this.prepareGraphData(correlationPairs);
    }
    this.setState({
      isFlyoutOpen: true,
      selectedTableRow: correlationTableRow,
      flyoutGraphData: newGraphData,
    });
  };

  private renderCorrelationsTable = (loadingData: boolean) => {
    if (loadingData) {
      return (
        <div style={{ margin: '0px 47%', height: 800, paddingTop: 384 }}>
          <EuiLoadingChart size="xl" className="chart-view-container-loading" />
        </div>
      );
    }
    const filteredTableData = this.getFilteredTableData(this.props.correlationsTableData);
    return (
      <>
        <CorrelationsTable
          correlationsTableData={filteredTableData}
          onViewDetails={this.openTableFlyout}
        />
      </>
    );
  };

  private getFilteredTableData = (tableData: CorrelationsTableData[]): CorrelationsTableData[] => {
    const { logTypeFilterOptions, severityFilterOptions, searchTerm } = this.props;
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

      const searchLower = searchTerm.toLowerCase();
      const searchMatch =
        searchTerm === '' ||
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

  private generateVisualizationSpec = (connectedFindings: CorrelationFinding[][]) => {
    const visData = connectedFindings.map((correlatedFindings) => {
      return {
        title: 'Correlated Findings',
        correlatedFinding: correlatedFindings.length,
        time: correlatedFindings[0].timestamp,
      };
    });

    const { dateTimeFilter } = this.props;
    const chartTimeUnits = getChartTimeUnit(
      dateTimeFilter?.startTime || DEFAULT_DATE_RANGE.start,
      dateTimeFilter?.endTime || DEFAULT_DATE_RANGE.end
    );

    return getCorrelatedFindingsVisualizationSpec(visData, {
      timeUnit: chartTimeUnits.timeUnit,
      dateFormat: chartTimeUnits.dateFormat,
      domain: getDomainRange(
        [
          dateTimeFilter?.startTime || DEFAULT_DATE_RANGE.start,
          dateTimeFilter?.endTime || DEFAULT_DATE_RANGE.end,
        ],
        chartTimeUnits.timeUnit.unit
      ),
    });
  };

  private closeTableFlyout = () => {
    this.setState({
      isFlyoutOpen: false,
      selectedTableRow: null,
      flyoutGraphData: {
        graph: { nodes: [], edges: [] },
        events: { click: this.props.onNodeClick },
      },
    });
  };

  render() {
    return (
      <>
        {/* {this.renderCorrelatedFindingsChart()} */}
        {this.renderCorrelationsTable(this.props.loadingTableData)}
        {this.state.isFlyoutOpen && (
          <CorrelationsTableFlyout
            isFlyoutOpen={this.state.isFlyoutOpen}
            selectedTableRow={this.state.selectedTableRow}
            flyoutGraphData={this.state.flyoutGraphData}
            loadingTableData={this.props.loadingTableData}
            onClose={this.closeTableFlyout}
            setNetwork={this.props.setNetwork}
          />
        )}
      </>
    );
  }
}
