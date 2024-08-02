/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import moment from 'moment';
import {
  EuiBasicTableColumn,
  EuiSmallButtonIcon,
  EuiInMemoryTable,
  EuiLink,
  EuiToolTip,
  EuiEmptyPrompt,
  EuiBadge,
} from '@elastic/eui';
import { FieldValueSelectionFilterConfigType } from '@elastic/eui/src/components/search_bar/filters/field_value_selection_filter';
import dateMath from '@elastic/datemath';
import {
  capitalizeFirstLetter,
  formatRuleType,
  isThreatIntelQuery,
  renderTime,
} from '../../../../utils/helpers';
import { DEFAULT_EMPTY_DATA } from '../../../../utils/constants';
import {
  DetectorsService,
  OpenSearchService,
  IndexPatternsService,
  CorrelationService,
} from '../../../../services';
import CreateAlertFlyout from '../CreateAlertFlyout';
import { parseAlertSeverityToOption } from '../../../CreateDetector/components/ConfigureAlerts/utils/helpers';
import { RuleSource } from '../../../../../server/models/interfaces';
import { DataStore } from '../../../../store/DataStore';
import { getSeverityColor } from '../../../Correlations/utils/constants';
import { Finding, FindingItemType, NotificationChannelTypeOptions } from '../../../../../types';

interface FindingsTableProps extends RouteComponentProps {
  detectorService: DetectorsService;
  opensearchService: OpenSearchService;
  findings: FindingItemType[];
  notificationChannels: NotificationChannelTypeOptions[];
  refreshNotificationChannels: () => void;
  loading: boolean;
  rules: { [id: string]: RuleSource };
  startTime: string;
  endTime: string;
  onRefresh: () => void;
  onFindingsFiltered: (findings: FindingItemType[]) => void;
  hasNotificationsPlugin: boolean;
  indexPatternsService: IndexPatternsService;
  correlationService: CorrelationService;
}

interface FindingsTableState {
  findingsFiltered: boolean;
  filteredFindings: FindingItemType[];
  flyout: object | undefined;
  flyoutOpen: boolean;
  selectedFinding?: Finding;
  widgetEmptyMessage: React.ReactNode | undefined;
}

export default class FindingsTable extends Component<FindingsTableProps, FindingsTableState> {
  constructor(props: FindingsTableProps) {
    super(props);
    this.state = {
      findingsFiltered: false,
      filteredFindings: [],
      flyout: undefined,
      flyoutOpen: false,
      selectedFinding: undefined,
      widgetEmptyMessage: undefined,
    };
  }

  componentDidMount = () => {
    this.filterFindings();
  };

  componentDidUpdate(prevProps: Readonly<FindingsTableProps>) {
    if (
      prevProps.startTime !== this.props.startTime ||
      prevProps.endTime !== this.props.endTime ||
      prevProps.findings.length !== this.props.findings.length
    )
      this.filterFindings();
  }

  filterFindings = () => {
    const { findings, startTime, endTime } = this.props;
    const startMoment = dateMath.parse(startTime);
    const endMoment = dateMath.parse(endTime);
    const filteredFindings = findings.filter((finding) =>
      moment(finding.timestamp).isBetween(moment(startMoment), moment(endMoment))
    );
    this.setState({
      findingsFiltered: true,
      filteredFindings: filteredFindings,
      widgetEmptyMessage:
        filteredFindings.length || findings.length ? undefined : (
          <EuiEmptyPrompt
            body={
              <p>
                <span style={{ display: 'block' }}>No findings.</span>Adjust the time range to see
                more results.
              </p>
            }
          />
        ),
    });
    this.props.onFindingsFiltered(filteredFindings);
  };

  closeFlyout = (refreshPage: boolean = false) => {
    this.setState({ flyout: undefined, flyoutOpen: false, selectedFinding: undefined });
    if (refreshPage) this.props.onRefresh();
  };

  renderCreateAlertFlyout = (finding: FindingItemType) => {
    if (this.state.flyoutOpen) this.closeFlyout();
    else {
      const ruleOptions = finding.queries
        .filter(({ id }) => !isThreatIntelQuery(id))
        .map((query) => {
          const rule = this.props.rules[query.id];
          return {
            name: rule.title,
            id: query.id,
            severity: rule.level,
            tags: rule.tags.map((tag: any) => tag.value),
          };
        });
      this.setState({
        flyout: (
          <CreateAlertFlyout
            {...this.props}
            finding={finding}
            closeFlyout={this.closeFlyout}
            notificationChannels={this.props.notificationChannels}
            allRules={this.props.rules}
            refreshNotificationChannels={this.props.refreshNotificationChannels}
            rulesOptions={ruleOptions}
            hasNotificationPlugin={this.props.hasNotificationsPlugin}
          />
        ),
        flyoutOpen: true,
        selectedFinding: finding,
      });
    }
  };

  render() {
    const { findings, loading, rules } = this.props;
    const {
      findingsFiltered,
      filteredFindings,
      flyout,
      flyoutOpen,
      widgetEmptyMessage,
    } = this.state;

    const columns: EuiBasicTableColumn<FindingItemType>[] = [
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
        render: (id: string, finding) =>
          (
            <EuiLink
              onClick={() => DataStore.findings.openFlyout(finding, this.state.filteredFindings)}
              data-test-subj={'finding-details-flyout-button'}
            >
              {id.length > 7 ? `${id.slice(0, 7)}...` : id}
            </EuiLink>
          ) || DEFAULT_EMPTY_DATA,
      },
      {
        field: 'detectorName',
        name: 'Detector',
        sortable: true,
        dataType: 'string',
        render: (name: string) => name || DEFAULT_EMPTY_DATA,
      },
      {
        field: 'detectionType',
        name: 'Detection type',
        render: (detectionType: string) => detectionType || DEFAULT_EMPTY_DATA,
      },
      {
        field: 'ruleSeverity',
        name: 'Severity',
        sortable: true,
        dataType: 'string',
        align: 'left',
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
      {
        field: 'logType',
        name: 'Log type',
        sortable: true,
        dataType: 'string',
        render: (logType: string) => formatRuleType(logType),
      },
      {
        name: 'Actions',
        sortable: false,
        actions: [
          {
            render: (finding) => (
              <EuiToolTip content={'View details'}>
                <EuiSmallButtonIcon
                  aria-label={'View details'}
                  data-test-subj={`view-details-icon`}
                  iconType={'inspect'}
                  onClick={() =>
                    DataStore.findings.openFlyout(finding, this.state.filteredFindings)
                  }
                />
              </EuiToolTip>
            ),
          },
          {
            render: (finding) => (
              <EuiToolTip content={'Create alert'}>
                <EuiSmallButtonIcon
                  aria-label={'Create alert'}
                  iconType={'bell'}
                  onClick={() => this.renderCreateAlertFlyout(finding)}
                />
              </EuiToolTip>
            ),
          },
        ],
      },
    ];

    const logTypes = new Set<string>();
    const severities = new Set<string>();
    filteredFindings.forEach((finding) => {
      if (finding) {
        const queryId = finding.queries.find(({ id }) => !isThreatIntelQuery(id))?.id;
        if (queryId && rules[queryId]) {
          logTypes.add(rules[queryId].category);
          severities.add(rules[queryId].level);
        }
      }
    });

    const search = {
      box: {
        placeholder: 'Search findings',
        schema: true,
      },
      filters: [
        {
          type: 'field_value_selection',
          field: 'ruleSeverity',
          name: 'Severity',
          options: Array.from(severities).map((severity) => {
            const name =
              parseAlertSeverityToOption(severity)?.label || capitalizeFirstLetter(severity);
            return { value: severity, name: name || severity };
          }),
          multiSelect: 'or',
        } as FieldValueSelectionFilterConfigType,
        {
          type: 'field_value_selection',
          field: 'logType',
          name: 'Log type',
          options: Array.from(logTypes).map((type) => ({
            value: type,
            name: formatRuleType(type),
          })),
          multiSelect: 'or',
        } as FieldValueSelectionFilterConfigType,
        {
          type: 'field_value_selection',
          field: 'detectionType',
          name: 'Detection type',
          options: [
            {
              value: 'Detection rules',
              name: 'Detection rules',
            },
            {
              value: 'Threat intelligence',
              name: 'Threat intelligence',
            },
          ],
          multiSelect: 'or',
        } as FieldValueSelectionFilterConfigType,
      ],
    };

    const sorting: any = {
      sort: {
        field: 'timestamp',
        direction: 'desc',
      },
    };

    return (
      <div>
        <EuiInMemoryTable
          items={findingsFiltered ? filteredFindings : findings}
          columns={columns}
          itemId={(item) => item.id}
          pagination={true}
          search={search}
          sorting={sorting}
          isSelectable={false}
          loading={loading}
          message={widgetEmptyMessage}
        />
        {flyoutOpen && flyout}
      </div>
    );
  }
}
