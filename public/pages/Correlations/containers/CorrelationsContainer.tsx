/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import { CorrelationGraphData, DateTimeFilter } from '../../../../types';
import React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import {
  defaultLogTypeFilterItemOptions,
  defaultSeverityFilterItemOptions,
  emptyGraphData,
  graphRenderOptions,
} from '../utils/constants';
import {
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
} from '@elastic/eui';
import { CorrelationsExperimentalBanner } from '../components/ExperimentalBanner';
import { FilterItem, FilterGroup } from '../components/FilterGroup';
import { CoreServicesContext } from '../../../components/core_services';
import { DEFAULT_DATE_RANGE, MAX_RECENTLY_USED_TIME_RANGES } from '../../../utils/constants';
import { CorrelationGraph } from '../components/CorrelationGraph';
import { FindingCard } from '../components/FindingCard';
import { DataStore } from '../../../store/DataStore';

interface CorrelationsProps extends RouteComponentProps {
  setDateTimeFilter?: Function;
  dateTimeFilter?: DateTimeFilter;
}

interface CorrelationsState {
  recentlyUsedRanges: any[];
  graphData: CorrelationGraphData;
  selectedFindingId?: string;
  logTypeFilterOptions: FilterItem[];
  severityFilterOptions: FilterItem[];
}

export class Correlations extends React.Component<CorrelationsProps, CorrelationsState> {
  static contextType = CoreServicesContext;
  private dateTimeFilter: DateTimeFilter;
  constructor(props: CorrelationsProps) {
    super(props);
    this.state = {
      recentlyUsedRanges: [DEFAULT_DATE_RANGE],
      graphData: { ...emptyGraphData },
      logTypeFilterOptions: [...defaultLogTypeFilterItemOptions],
      severityFilterOptions: [...defaultSeverityFilterItemOptions],
      selectedFindingId: 'hello',
    };
    this.dateTimeFilter = this.props.dateTimeFilter || {
      startTime: DEFAULT_DATE_RANGE.start,
      endTime: DEFAULT_DATE_RANGE.end,
    };
  }

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

  private onRefresh = () => {};

  onLogTypeFilterChange = (items: FilterItem[]) => {
    this.setState({ logTypeFilterOptions: items });
  };

  onSeverityFilterChange = (items: FilterItem[]) => {
    this.setState({ severityFilterOptions: items });
  };

  closeFlyout = () => {
    this.setState({ selectedFindingId: undefined });
  };

  getFindingCardData(findingId: string) {
    const allFindings = DataStore.correlationsStore.allFindings;
    const mainFinding = allFindings[findingId] || {
      id: 'dummy id',
      logType: 'dns',
      timestamp: 'April 24 2023',
      detectionRule: {
        name: 'Sample rule name',
        severity: 'Critical',
      },
    };
    // const correlatedFindings = DataStore.correlationsStore.getCorrelatedFindings(findingId);
    const correlatedFindings = [];
    console.log('Correlations history state', this.props.history.location.state);
    return {
      finding: mainFinding,
      correlatedFindings,
    };
  }

  onFindingInspect = (id: string) => {
    this.setState({ selectedFindingId: id });
  };

  render() {
    const findingCardsData = this.state.selectedFindingId
      ? this.getFindingCardData(this.state.selectedFindingId)
      : undefined;

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
                      <EuiButtonEmpty>Reset filters</EuiButtonEmpty>
                    </EuiFlexItem>
                  </EuiFlexGroup>
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
              <EuiSpacer />
              <CorrelationGraph
                graph={this.state.graphData.graph}
                options={{ ...graphRenderOptions }}
                events={this.state.graphData.events}
              />
            </EuiPanel>
          </EuiFlexItem>
        </EuiFlexGroup>
      </>
    );
  }
}
