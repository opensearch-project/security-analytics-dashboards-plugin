/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import './Overview.scss';
import {
  EuiFieldSearch,
  EuiFlexGrid,
  EuiFlexGroup,
  EuiFlexItem,
  EuiLink,
  EuiSelect,
  EuiSelectOption,
  EuiSpacer,
  EuiSuperDatePicker,
  EuiText,
} from '@elastic/eui';
import React, { Component } from 'react';
import { ContentPanel } from '../../../../components/ContentPanel';
import { View, parse } from 'vega/build-es5/vega.js';
import { compile } from 'vega-lite';
import { BREADCRUMBS, ROUTES } from '../../../../utils/constants';
import { OverviewProps, OverviewState } from '../../models/interfaces';
import {
  dummyAlertItems,
  dummyDetectorItems,
  dummyFindingItems,
  getVisualizationSpec,
} from '../../utils/dummyData';
import { groupByOptions } from '../../utils/constants';
import { CoreServicesContext } from '../../../../../public/components/core_services';
import { RecentAlertsWidget } from '../../components/Widgets/RecentAlertsWidget';
import { RecentFindingsWidget } from '../../components/Widgets/RecentFindingsWidget';
import { WidgetContainer } from '../../components/Widgets/WidgetContainer';
import { DetectorsWidget } from '../../components/Widgets/DetectorsWidget';
// import { expressionInterpreter as vegaExpressionInterpreter } from 'vega-interpreter/build/vega-interpreter.module';

export default class Overview extends Component<OverviewProps, OverviewState> {
  static contextType = CoreServicesContext;

  constructor(props: OverviewProps) {
    super(props);
    this.state = {
      groupBy: 'all_findings',
    };
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

  createVisualizationActions(): React.ReactNode[] {
    return [
      this.createSelectComponent(groupByOptions, this.state.groupBy, (event) => {
        this.setState({ groupBy: event.target.value });
      }),
    ];
  }

  onTimeChange = ({ start, end }: { start: string; end: string }) => {};

  onRefresh = async () => {};

  render() {
    return (
      <ContentPanel title={'Overview'}>
        <EuiFlexGroup direction="column">
          <EuiFlexItem>
            <EuiFlexGroup gutterSize={'s'}>
              <EuiFlexItem grow={9}>
                <EuiFieldSearch
                  fullWidth={true}
                  // onChange={this.onSearchChange}
                  placeholder={'Search findings'}
                />
              </EuiFlexItem>
              <EuiFlexItem grow={1}>
                <EuiSuperDatePicker onTimeChange={this.onTimeChange} onRefresh={this.onRefresh} />
              </EuiFlexItem>
            </EuiFlexGroup>
            <EuiSpacer size={'m'} />
          </EuiFlexItem>
          <EuiFlexItem style={{ padding: 20 }}>
            <WidgetContainer
              title="Findings and alert count"
              actions={this.createVisualizationActions()}
            >
              <EuiFlexGroup gutterSize="s" direction="column">
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
                  <div id="view" style={{ width: '100%' }}></div>
                </EuiFlexItem>
              </EuiFlexGroup>
            </WidgetContainer>
          </EuiFlexItem>

          <EuiFlexItem>
            <EuiFlexGrid columns={2} gutterSize="m">
              <RecentAlertsWidget items={dummyAlertItems} />
              <RecentFindingsWidget items={dummyFindingItems} />
              <WidgetContainer title="Top rules count from findings">
                <div id="#top_rules_vis" />
              </WidgetContainer>
              <DetectorsWidget items={dummyDetectorItems} />
            </EuiFlexGrid>
          </EuiFlexItem>
        </EuiFlexGroup>
      </ContentPanel>
    );
  }
}
