/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import moment from 'moment';
import { EuiButton, EuiEmptyPrompt, EuiInMemoryTable, EuiLink, EuiText } from '@elastic/eui';
import dateMath from '@elastic/datemath';
import { renderTime } from '../../../../utils/helpers';
import { DEFAULT_EMPTY_DATA, ROUTES } from '../../../../utils/constants';
import { parseAlertSeverityToOption } from '../../../CreateDetector/components/ConfigureAlerts/utils/helpers';
import { OpenSearchService } from '../../../../services';
import FindingDetailsFlyout from '../FindingDetailsFlyout';

interface FindingsTableProps extends RouteComponentProps {
  opensearchService: OpenSearchService;
  findings: Finding[];
  loading: boolean;
  searchQuery: string;
  startTime: string;
  endTime: string;
}

interface FindingsTableState {
  findingsFiltered: boolean;
  filteredFindings: Finding[];
  flyoutOpen: boolean;
  selectedFinding?: Finding;
}

export default class FindingsTable extends Component<FindingsTableProps, FindingsTableState> {
  constructor(props: FindingsTableProps) {
    super(props);
    this.state = {
      findingsFiltered: false,
      filteredFindings: [],
      flyoutOpen: false,
      selectedFinding: undefined,
    };
  }

  componentDidMount = async () => {
    await this.filterFindings();
  };

  componentDidUpdate(prevProps: Readonly<FindingsTableProps>) {
    if (
      prevProps.searchQuery !== this.props.searchQuery ||
      prevProps.startTime !== this.props.startTime ||
      prevProps.endTime !== this.props.endTime ||
      prevProps.findings.length !== this.props.findings.length
    )
      this.filterFindings();
  }

  filterFindings = () => {
    const { findings, searchQuery, startTime, endTime } = this.props;
    const startMoment = dateMath.parse(startTime);
    const endMoment = dateMath.parse(endTime);
    const filteredFindings = findings.filter((finding) => {
      const withinTimeRange = moment(finding.timestamp).isBetween(
        moment(startMoment),
        moment(endMoment)
      );
      if (withinTimeRange) {
        const rule = finding.queries[0];
        const timestamp = renderTime(finding.timestamp);
        const hasMatchingFieldValue =
          timestamp.includes(searchQuery) ||
          finding.id.includes(searchQuery) ||
          rule.name.includes(searchQuery) ||
          finding.detector_name.includes(searchQuery) ||
          rule.category.includes(searchQuery) ||
          rule.severity.includes(searchQuery);
        return hasMatchingFieldValue;
      } else return false;
    });
    this.setState({ findingsFiltered: true, filteredFindings: filteredFindings });
  };

  closeFlyout = () => {
    this.setState({ flyoutOpen: false, selectedFinding: undefined });
  };

  openFlyout = (finding: Finding) => {
    if (this.state.flyoutOpen) this.closeFlyout();
    else this.setState({ flyoutOpen: true, selectedFinding: finding });
  };

  renderFlyout = (finding: Finding) => {
    return (
      <FindingDetailsFlyout
        finding={finding}
        opensearchService={this.props.opensearchService}
        closeFlyout={this.closeFlyout}
      />
    );
  };

  render() {
    const { findings, loading } = this.props;
    const { findingsFiltered, filteredFindings, flyoutOpen, selectedFinding } = this.state;

    const columns = [
      {
        field: 'timestamp',
        name: 'Time',
        sortable: true,
        dataType: 'date',
        render: renderTime,
      },
      {
        field: 'id',
        name: 'Finding ID',
        sortable: true,
        dataType: 'string',
        render: (id, finding) =>
          <EuiLink onClick={() => this.openFlyout(finding)}>{id}</EuiLink> || DEFAULT_EMPTY_DATA,
      },
      {
        field: 'queries',
        name: 'Rule name',
        sortable: true,
        dataType: 'string',
        render: (queries) => queries[0].name || DEFAULT_EMPTY_DATA,
      },
      {
        field: 'detector_name',
        name: 'Threat detector',
        sortable: true,
        dataType: 'string',
        render: (name) => name || DEFAULT_EMPTY_DATA,
      },
      {
        field: 'queries',
        name: 'Log type',
        sortable: true,
        dataType: 'string',
        render: (queries) => queries[0].category || DEFAULT_EMPTY_DATA,
      },
      {
        field: 'queries',
        name: 'Rule severity',
        sortable: true,
        dataType: 'string',
        render: (queries) =>
          parseAlertSeverityToOption(queries[0].severity)?.label || DEFAULT_EMPTY_DATA,
      },
      {
        name: 'Actions',
        sortable: false,
        align: 'center',
        actions: [
          {
            render: (finding) => (
              <EuiButton onClick={() => this.openFlyout(finding)}>View details</EuiButton>
            ),
          },
          {
            render: () => (
              <EuiButton
                onClick={() => {
                  if (this.state.flyoutOpen) this.closeFlyout();

                  //TODO: Integrate with edit detector flow when available
                  this.props.history.push(ROUTES.DETECTORS_CREATE);
                }}
              >
                Create alert
              </EuiButton>
            ),
          },
        ],
      },
    ];

    const sorting = {
      sort: {
        field: 'name',
        direction: 'asc',
      },
    };

    return (
      <div>
        <EuiInMemoryTable
          items={findingsFiltered ? filteredFindings : findings}
          columns={columns}
          itemId={(item) => item.id}
          pagination={true}
          sorting={sorting}
          isSelectable={false}
          loading={loading}
          noItemsMessage={
            <EuiEmptyPrompt
              style={{ maxWidth: '45em' }}
              body={
                <EuiText>
                  <p>There are no existing findings.</p>
                </EuiText>
              }
            />
          }
        />
        {flyoutOpen && this.renderFlyout(selectedFinding as Finding)}
      </div>
    );
  }
}
