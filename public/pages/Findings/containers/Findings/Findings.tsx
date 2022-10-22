/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { ChangeEvent, Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import moment from 'moment';
import { ContentPanel } from '../../../../components/ContentPanel';
import {
  EuiFieldSearch,
  EuiFlexGroup,
  EuiFlexItem,
  EuiPanel,
  EuiSelect,
  EuiSelectOption,
  EuiSpacer,
  EuiSuperDatePicker,
} from '@elastic/eui';
import FindingsTable from '../../components/FindingsTable';
import FindingsService from '../../../../services/FindingsService';
import { DetectorsService, OpenSearchService } from '../../../../services';
import { BREADCRUMBS, DATE_MATH_FORMAT } from '../../../../utils/constants';
import { getVisualizationSpec } from '../../../Overview/utils/dummyData';
import { View, parse } from 'vega/build-es5/vega.js';
import { compile } from 'vega-lite';
import { CoreServicesContext } from '../../../../components/core_services';

interface FindingsProps extends RouteComponentProps {
  findingsService: FindingsService;
  opensearchService: OpenSearchService;
  detectorService: DetectorsService;
}

interface FindingsState {
  loading: boolean;
  findings: Finding[];
  searchQuery: string;
  startTime: string;
  endTime: string;
  groupBy: string;
}

export const groupByOptions = [
  { text: 'Log type', value: 'log_type' },
  { text: 'Rule severity', value: 'rule_severity' },
];

export default class Findings extends Component<FindingsProps, FindingsState> {
  static contextType = CoreServicesContext;

  constructor(props: FindingsProps) {
    super(props);
    const now = moment.now();
    const startTime = moment(now).subtract(15, 'hours').format(DATE_MATH_FORMAT);
    this.state = {
      loading: false,
      findings: [],
      searchQuery: '',
      startTime: startTime,
      endTime: moment(now).format(DATE_MATH_FORMAT),
      groupBy: 'log_type',
    };
  }

  componentDidMount = async () => {
    this.context.chrome.setBreadcrumbs([BREADCRUMBS.SECURITY_ANALYTICS, BREADCRUMBS.FINDINGS]);
    this.getFindings();
    this.renderVis();
  };

  getFindings = async () => {
    this.setState({ loading: true });

    try {
      const { findingsService, detectorService } = this.props;

      const detectorsRes = await detectorService.getDetectors();
      if (detectorsRes.ok) {
        const detectorIds = detectorsRes.response.hits.hits.map((hit) => hit._id);
        let findings: Finding[] = [];

        for (let id of detectorIds) {
          const findingRes = await findingsService.getFindings({ detectorId: id });

          if (findingRes.ok) {
            findings = findings.concat(findingRes.response.findings);
          }
        }

        this.setState({ findings });
      }

      // this.setState({ findings: findings });
    } catch (e) {
      console.error('Failed to retrieve findings:', e);
      // TODO error logging
    }
    this.setState({ loading: false });
  };

  onSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    this.setState({ searchQuery: e.target.value });
  };

  onTimeChange = ({ start, end }) => {
    this.setState({ startTime: start, endTime: end });
  };

  onRefresh = async () => {
    this.getFindings();
  };

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

  createSelectComponent(
    options: EuiSelectOption[],
    value: string,
    onChange: React.ChangeEventHandler<HTMLSelectElement>
  ) {
    return (
      <EuiFlexGroup justifyContent="flexStart" alignItems="flexStart" direction="column">
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

  createGroupByControl(): React.ReactNode {
    return this.createSelectComponent(groupByOptions, this.state.groupBy, (event) => {
      this.setState({ groupBy: event.target.value });
    });
  }

  render() {
    const { findings, loading, searchQuery, startTime, endTime } = this.state;
    return (
      <ContentPanel title={'Findings'}>
        <EuiFlexGroup gutterSize={'s'}>
          <EuiFlexItem grow={9}>
            <EuiFieldSearch
              fullWidth={true}
              onChange={this.onSearchChange}
              placeholder={'Search findings'}
            />
          </EuiFlexItem>
          <EuiFlexItem grow={1}>
            <EuiSuperDatePicker onTimeChange={this.onTimeChange} onRefresh={this.onRefresh} />
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiSpacer size={'m'} />

        <EuiPanel>
          <EuiFlexGroup>
            <EuiFlexItem grow={9}>
              <div id="view"></div>
            </EuiFlexItem>
            <EuiFlexItem grow={1}>{this.createGroupByControl()}</EuiFlexItem>
          </EuiFlexGroup>
        </EuiPanel>

        <EuiSpacer size={'xxl'} />

        <ContentPanel title={'Findings'}>
          <FindingsTable
            {...this.props}
            findings={findings}
            loading={loading}
            searchQuery={searchQuery}
            startTime={startTime}
            endTime={endTime}
          />
        </ContentPanel>
      </ContentPanel>
    );
  }
}
