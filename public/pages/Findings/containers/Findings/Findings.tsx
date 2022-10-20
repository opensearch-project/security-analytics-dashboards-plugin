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
  EuiSpacer,
  EuiSuperDatePicker,
} from '@elastic/eui';
import FindingsTable from '../../components/FindingsTable';
import FindingsService from '../../../../services/FindingsService';
import { DETECTOR_TYPES } from '../../../Detectors/utils/constants';
import { OpenSearchService } from '../../../../services';
import { DATE_MATH_FORMAT } from '../../../../utils/constants';

interface FindingsProps extends RouteComponentProps {
  findingsService: FindingsService;
  opensearchService: OpenSearchService;
}

interface FindingsState {
  loading: boolean;
  findings: Finding[];
  searchQuery: string;
  startTime: string;
  endTime: string;
}

const EXAMPLE_FINDINGS = [
  {
    id: 'finding-id-1',
    detector_id: 'detector-id-1',
    detector_name: 'detector1',
    document_list: [
      {
        id: 'doc1',
        index: 'index1',
        found: true,
        document: 'Document 1 message.',
      },
      {
        id: 'doc2',
        index: 'index1',
        found: true,
        document: 'Document 2 message.',
      },
    ],
    index: 'index1',
    queries: [
      {
        id: 'query1-id',
        name: 'query1',
        query: 'query source',
        tags: ['tag1', 'tag2'],
        category: DETECTOR_TYPES.DNS.id,
        severity: '1',
        description: 'A query description.',
      },
    ],
    related_doc_ids: ['doc1', 'doc2'],
    timestamp: moment.now().valueOf(),
  },
  {
    id: 'finding-id-2',
    detector_id: 'detector-id-2',
    detector_name: 'detector2',
    document_list: [
      {
        id: 'doc1',
        index: 'index2',
        found: true,
        document: 'Document 1 message.',
      },
      {
        id: 'doc2',
        index: 'index2',
        found: true,
        document: 'Document 2 message.',
      },
    ],
    index: 'index2',
    queries: [
      {
        id: 'query1-id',
        name: 'query1',
        query: 'query source',
        tags: ['tag1', 'tag2'],
        category: DETECTOR_TYPES.DNS.id,
        severity: '1',
        description: 'A query description.',
      },
    ],
    related_doc_ids: ['doc1', 'doc2'],
    timestamp: moment.now().valueOf(),
  },
  {
    id: 'finding-id-3',
    detector_id: 'detector-id-3',
    detector_name: 'detector3',
    document_list: [
      {
        id: 'doc1',
        index: 'index3',
        found: true,
        document: 'Document 1 message.',
      },
      {
        id: 'doc2',
        index: 'index3',
        found: true,
        document: 'Document 2 message.',
      },
    ],
    index: 'index3',
    queries: [
      {
        id: 'query1-id',
        name: 'query1',
        query: 'query source',
        tags: ['tag1', 'tag2'],
        category: DETECTOR_TYPES.WINDOWS.id,
        severity: '1',
        description: 'A query description.',
      },
    ],
    related_doc_ids: ['doc1', 'doc2'],
    timestamp: moment(moment.now()).subtract(30, 'minute').valueOf(),
  },
];

export default class Findings extends Component<FindingsProps, FindingsState> {
  constructor(props: FindingsProps) {
    super(props);
    const now = moment.now();
    const startTime = moment(now).subtract(15, 'minutes').format(DATE_MATH_FORMAT);
    this.state = {
      loading: false,
      findings: [],
      searchQuery: '',
      startTime: startTime,
      endTime: moment(now).format(DATE_MATH_FORMAT),
    };
  }

  componentDidMount = async () => {
    this.getFindings();
  };

  getFindings = async () => {
    this.setState({ loading: true });
    this.setState({ findings: EXAMPLE_FINDINGS });
    try {
      const { findingsService } = this.props;
      const findings = [];
      for (let type of Object.keys(DETECTOR_TYPES)) {
        const response = await findingsService.getFindings(DETECTOR_TYPES[type].id);
        console.info(`getFindings response = ${JSON.stringify(response, null, 4)}`);
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

  render() {
    const { findings, loading, searchQuery, startTime, endTime } = this.state;
    return (
      <ContentPanel title={'Findings'}>
        <EuiFlexGroup gutterSize={'s'}>
          <EuiFlexItem>
            <EuiFieldSearch
              fullWidth={true}
              onChange={this.onSearchChange}
              placeholder={'Search findings'}
            />
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiSuperDatePicker onTimeChange={this.onTimeChange} onRefresh={this.onRefresh} />
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiSpacer size={'m'} />

        {/*// TODO: Implement graph*/}
        <div>TODO: GRAPH PLACEHOLDER</div>

        <EuiSpacer size={'m'} />
        <FindingsTable
          {...this.props}
          findings={findings}
          loading={loading}
          searchQuery={searchQuery}
          startTime={startTime}
          endTime={endTime}
        />
      </ContentPanel>
    );
  }
}
