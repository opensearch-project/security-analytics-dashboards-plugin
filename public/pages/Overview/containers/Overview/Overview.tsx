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
  EuiLink,
  EuiSelect,
  EuiSelectOption,
  EuiText,
} from '@elastic/eui';
import React, { Component } from 'react';
import { ContentPanel } from '../../../../components/ContentPanel';
import { View, parse } from 'vega/build-es5/vega.js';
import { compile } from 'vega-lite';
import { BREADCRUMBS, ROUTES } from '../../../../utils/constants';
import { FindingItem, OverviewProps, OverviewState } from '../../types/interfaces';
import { dummyWidgetItems, getVisualizationSpec } from '../../utils/dummyData';
import { groupByOptions, widgetHeaderData } from '../../utils/constants';
import { CoreServicesContext } from '../../../../../public/components/core_services';
// import { expressionInterpreter as vegaExpressionInterpreter } from 'vega-interpreter/build/vega-interpreter.module';

export default class Overview extends Component<OverviewProps, OverviewState> {
  static contextType = CoreServicesContext;

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

  generateVisualizationSpec() {
    return getVisualizationSpec();
  }

  renderVis() {
    let view;
    const spec = this.generateVisualizationSpec();

    try {
      renderVegaSpec(
        compile({ ...spec, width: 'container', height: 400 }).spec
      ).catch((err: Error) => console.error(err));
    } catch (error) {
      console.log(error);
    }

    function renderVegaSpec(spec: {}) {
      view = new View(parse(spec), {
        // view = new View(parse(spec, null, { expr: vegaExpressionInterpreter }), {
        renderer: 'canvas', // renderer (canvas or svg)
        container: '#view', // parent DOM container
        hover: true, // enable hover processing
      });
      return view.runAsync();
    }
  }

  componentDidMount(): void {
    this.context.chrome.setBreadcrumbs([BREADCRUMBS.SECURITY_ANALYTICS, BREADCRUMBS.OVERVIEW]);
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
              <EuiHorizontalRule margin="xs" className="widget-hr" />
              <EuiFlexItem>
                <EuiFlexGroup gutterSize="xl">
                  <EuiFlexItem grow={false}>
                    <EuiText size="s">
                      <p>Total active alerts</p>
                    </EuiText>
                    <EuiLink href={`#${ROUTES.RULES}`} className="page-link">
                      43
                    </EuiLink>
                  </EuiFlexItem>
                  <EuiFlexItem grow={false}>
                    <EuiText size="s">
                      <p>Total findings</p>
                    </EuiText>
                    <EuiLink href={`#${ROUTES.FINDINGS}`} className="page-link">
                      323
                    </EuiLink>
                  </EuiFlexItem>
                </EuiFlexGroup>
              </EuiFlexItem>
              <EuiFlexItem>
                {/* The visualization container */}
                <div id="view" style={{ width: '100%' }}></div>
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiFlexGrid columns={2} gutterSize="m">
              {widgetHeaderData.map((data, idx) => {
                return (
                  <EuiFlexItem className="grid-item" key={idx}>
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
                      <EuiBasicTable
                        columns={columns}
                        items={dummyWidgetItems}
                        itemId={(item: FindingItem) => `${item.id}`}
                      />
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
