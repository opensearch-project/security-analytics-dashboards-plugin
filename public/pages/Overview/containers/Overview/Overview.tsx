/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import './Overview.scss';
import {
  EuiBasicTable,
  EuiBasicTableColumn,
  EuiButton,
  EuiFlexGrid,
  EuiFlexGroup,
  EuiFlexItem,
  EuiHorizontalRule,
  EuiSelect,
  EuiSelectOption,
  EuiText,
} from '@elastic/eui';
import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { ContentPanel } from '../../../../components/ContentPanel';
import { View, parse } from 'vega';

interface OverviewProps extends RouteComponentProps {}

interface OverviewState {
  groupBy: string;
}

interface FindingItem {
  id: number;
  time: string;
  findingName: string;
  detector: string;
}

const items: FindingItem[] = Array(5)
  .fill(undefined)
  .map((_, idx) => {
    return {
      id: idx,
      time: new Date().toDateString(),
      findingName: `Finding ${idx}`,
      detector: `policy_${idx % 3}`,
    };
  });

const groupByOptions = [
  { text: 'All findings', value: 'all_findings' },
  { text: 'Log type', value: 'log_type' },
];

const widgetHeaderData = [
  { widgetTitle: 'Recent alerts', btnName: 'View alerts' },
  { widgetTitle: 'Recent findings', btnName: 'View findings' },
  { widgetTitle: 'Top rules count from findings' },
  { widgetTitle: 'Security dashboards', btnName: 'View security dashboards' },
];

export default class Overview extends Component<OverviewProps, OverviewState> {
  constructor(props: OverviewProps) {
    super(props);
    this.state = {
      groupBy: 'all_findings',
    };
  }

  createWidgetHeader(title: string, widgetActions: JSX.Element | null) {
    return (
      <EuiFlexItem>
        <EuiFlexGroup justifyContent="spaceBetween" alignItems="center">
          <EuiFlexItem>
            <EuiText size="m">
              <h4>{title}</h4>
            </EuiText>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>{widgetActions}</EuiFlexItem>
        </EuiFlexGroup>
      </EuiFlexItem>
    );
  }

  createActionBtn(name: string, onClick: () => void) {
    return (
      <EuiButton size="s" onClick={onClick}>
        {name}
      </EuiButton>
    );
  }

  createSelectComponent(
    options: EuiSelectOption[],
    value: string,
    onChange: React.ChangeEventHandler<HTMLSelectElement>
  ) {
    return (
      <EuiFlexGroup justifyContent="flexEnd" alignItems="center">
        <EuiFlexItem grow={false}>
          <h5>Group by</h5>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiSelect
            id="overview-vis-options"
            options={options}
            value={value}
            onChange={onChange}
          />
        </EuiFlexItem>
      </EuiFlexGroup>
    );
  }

  renderVis() {
    let view;

    try {
      fetch('https://vega.github.io/vega/examples/bar-chart.vg.json')
        .then((res) => res.json())
        .then((spec) => renderVegaSpec(spec))
        .catch((err) => console.error(err));
    } catch (error) {
      console.log(error);
    }

    function renderVegaSpec(spec: {}) {
      view = new View(parse(spec), {
        renderer: 'canvas', // renderer (canvas or svg)
        container: '#view', // parent DOM container
        hover: true, // enable hover processing
      });
      return view.runAsync();
    }
  }

  componentDidMount(): void {
    this.renderVis();
  }

  render() {
    const columns: EuiBasicTableColumn<FindingItem>[] = [
      {
        field: 'time',
        name: 'Time',
        sortable: true,
        align: 'left',
      },
      {
        field: 'findingName',
        name: 'Finding Name',
        sortable: false,
        align: 'left',
      },
      {
        field: 'detector',
        name: 'Detector',
        sortable: true,
        align: 'left',
      },
    ];

    return (
      <ContentPanel title={'Overview'}>
        <EuiFlexGroup direction="column">
          <EuiFlexItem className="grid-item">
            <EuiFlexGroup direction="column" className="grid-item-content">
              {this.createWidgetHeader(
                'Findings and alert count',
                this.createSelectComponent(groupByOptions, this.state.groupBy, (event) => {
                  console.log(event.target.value);
                  this.setState({ groupBy: event.target.value });
                })
              )}
              <EuiFlexItem>
                <EuiHorizontalRule margin="xs" className="widget-hr" />
              </EuiFlexItem>
              <EuiFlexItem>
                <div id="view"></div>
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiFlexGrid columns={2} gutterSize="m">
              {widgetHeaderData.map((data) => {
                return (
                  <EuiFlexItem className="grid-item">
                    <EuiFlexGroup direction="column" className="grid-item-content">
                      {this.createWidgetHeader(
                        data.widgetTitle,
                        data.btnName
                          ? this.createActionBtn(data.btnName, () =>
                              alert(`Showing ${data.btnName}`)
                            )
                          : null
                      )}
                      <EuiHorizontalRule margin="xs" className="widget-hr" />
                      <EuiBasicTable columns={columns} items={items} />
                    </EuiFlexGroup>
                  </EuiFlexItem>
                );
              })}
            </EuiFlexGrid>
          </EuiFlexItem>
        </EuiFlexGroup>
      </ContentPanel>
    );
  }
}
