/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiBasicTable,
  EuiBasicTableColumn,
  EuiButton,
  EuiButtonIcon,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFlyout,
  EuiFlyoutBody,
  EuiFlyoutHeader,
  EuiLink,
  EuiSpacer,
  EuiTitle,
} from '@elastic/eui';
import { AlertItem, RuleSource } from '../../../../../server/models/interfaces';
import React from 'react';
import { ContentPanel } from '../../../../components/ContentPanel';
import { ALERT_STATE, DEFAULT_EMPTY_DATA } from '../../../../utils/constants';
import {
  capitalizeFirstLetter,
  createTextDetailsGroup,
  errorNotificationToast,
  formatRuleType,
  renderTime,
} from '../../../../utils/helpers';
import { FindingsService, OpenSearchService } from '../../../../services';
import FindingDetailsFlyout from '../../../Findings/components/FindingDetailsFlyout';
import { Detector } from '../../../../../models/interfaces';
import { parseAlertSeverityToOption } from '../../../CreateDetector/components/ConfigureAlerts/utils/helpers';
import { Finding } from '../../../Findings/models/interfaces';
import { NotificationsStart } from 'opensearch-dashboards/public';
import { DataStore } from '../../../../store/DataStore';

export interface AlertFlyoutProps {
  alertItem: AlertItem;
  detector: Detector;
  findingsService: FindingsService;
  notifications: NotificationsStart;
  opensearchService: OpenSearchService;
  onClose: () => void;
  onAcknowledge: (selectedItems: AlertItem[]) => void;
}

export interface AlertFlyoutState {
  acknowledged: boolean;
  findingFlyoutData?: Finding;
  findingItems: Finding[];
  loading: boolean;
  rules: { [key: string]: RuleSource };
}

export class AlertFlyout extends React.Component<AlertFlyoutProps, AlertFlyoutState> {
  constructor(props: AlertFlyoutProps) {
    super(props);

    this.state = {
      acknowledged: props.alertItem.state === ALERT_STATE.ACKNOWLEDGED,
      findingItems: [],
      loading: false,
      rules: {},
    };
  }

  async componentDidMount() {
    this.getFindings();
  }

  setFindingFlyoutData(finding?: Finding) {
    this.setState({ findingFlyoutData: finding });
  }

  getFindings = async () => {
    this.setState({ loading: true });
    const {
      alertItem: { detector_id },
      findingsService,
      notifications,
    } = this.props;
    try {
      const findingRes = await findingsService.getFindings({ detectorId: detector_id });
      if (findingRes.ok) {
        const relatedFindings = findingRes.response.findings.filter((finding) =>
          this.props.alertItem.finding_ids.includes(finding.id)
        );
        this.setState({ findingItems: relatedFindings });
      } else {
        errorNotificationToast(notifications, 'retrieve', 'findings', findingRes.error);
      }
    } catch (e: any) {
      errorNotificationToast(notifications, 'retrieve', 'findings', e);
    }
    await this.getRules();
    this.setState({ loading: false });
  };

  getRules = async () => {
    const { notifications } = this.props;
    try {
      const { findingItems } = this.state;
      const ruleIds: string[] = [];
      findingItems.forEach((finding) => {
        finding.queries.forEach((query) => ruleIds.push(query.id));
      });

      if (ruleIds.length > 0) {
        const rules = await DataStore.rules.getAllRules({
          _id: ruleIds,
        });

        const allRules: { [id: string]: RuleSource } = {};
        rules.forEach((hit) => (allRules[hit._id] = hit._source));

        this.setState({ rules: allRules });
      }
    } catch (e: any) {
      errorNotificationToast(notifications, 'retrieve', 'rules', e);
    }
  };

  createFindingTableColumns(): EuiBasicTableColumn<Finding>[] {
    const { detector } = this.props;
    const { rules } = this.state;
    return [
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
          (
            <EuiLink
              onClick={() => this.setFindingFlyoutData(finding)}
              data-test-subj={'finding-details-flyout-button'}
            >
              {`${(id as string).slice(0, 7)}...`}
            </EuiLink>
          ) || DEFAULT_EMPTY_DATA,
      },
      {
        field: 'queries',
        name: 'Rule name',
        sortable: true,
        render: (queries: any[]) => rules[queries[0]?.id]?.title || DEFAULT_EMPTY_DATA,
      },
      {
        field: 'detector_id',
        name: 'Threat detector',
        sortable: true,
        dataType: 'string',
        render: () => detector.name || DEFAULT_EMPTY_DATA,
      },
      {
        field: 'queries',
        name: 'Log type',
        sortable: true,
        dataType: 'string',
        render: () => formatRuleType(detector.detector_type),
      },
    ];
  }

  render() {
    const { onClose, alertItem, detector, onAcknowledge } = this.props;
    const { trigger_name, state, severity, start_time, last_notification_time } = alertItem;
    const { acknowledged, findingItems, findingFlyoutData, loading, rules } = this.state;

    return !!this.state.findingFlyoutData ? (
      <FindingDetailsFlyout
        {...this.props}
        finding={{
          ...findingFlyoutData,
          detector: { _id: detector.id, _index: '', _source: detector },
        }}
        closeFlyout={onClose}
        backButton={
          <EuiButtonIcon
            iconType="arrowLeft"
            aria-label="back"
            onClick={() => this.setFindingFlyoutData()}
            display="base"
            size="s"
            data-test-subj={'finding-details-flyout-back-button'}
          />
        }
        allRules={rules}
      />
    ) : (
      <EuiFlyout
        onClose={onClose}
        hideCloseButton
        closeButtonProps={{
          size: 'm',
          display: 'base',
        }}
        data-test-subj={'alert-details-flyout'}
      >
        <EuiFlyoutHeader hasBorder={true}>
          <EuiFlexGroup justifyContent="spaceBetween">
            <EuiFlexItem grow={2}>
              <EuiTitle size={'m'}>
                <h3>Alert details</h3>
              </EuiTitle>
            </EuiFlexItem>
            <EuiFlexItem grow={8}>
              <EuiFlexGroup justifyContent="flexEnd" alignItems="center">
                <EuiFlexItem grow={false}>
                  <EuiButton
                    disabled={acknowledged || alertItem.state !== ALERT_STATE.ACTIVE}
                    onClick={() => {
                      this.setState({ acknowledged: true });
                      onAcknowledge([alertItem]);
                    }}
                    data-test-subj={'alert-details-flyout-acknowledge-button'}
                  >
                    Acknowledge
                  </EuiButton>
                </EuiFlexItem>
                <EuiFlexItem grow={false}>
                  <EuiButtonIcon
                    aria-label="close"
                    iconType="cross"
                    iconSize="m"
                    display="empty"
                    onClick={onClose}
                    data-test-subj={'alert-details-flyout-close-button'}
                  />
                </EuiFlexItem>
              </EuiFlexGroup>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlyoutHeader>
        <EuiFlyoutBody>
          {createTextDetailsGroup([
            { label: 'Alert trigger name', content: trigger_name },
            { label: 'Alert status', content: capitalizeFirstLetter(state) },
            {
              label: 'Alert severity',
              content: parseAlertSeverityToOption(severity)?.label || DEFAULT_EMPTY_DATA,
            },
          ])}
          {createTextDetailsGroup([
            { label: 'Start time', content: renderTime(start_time) },
            { label: 'Last updated time', content: renderTime(last_notification_time) },
            { label: '', content: '' },
          ])}
          {createTextDetailsGroup([
            { label: 'Detector', content: detector.name },
            { label: '', content: '' },
            { label: '', content: '' },
          ])}

          <EuiSpacer size={'xxl'} />

          <ContentPanel title={`Findings (${findingItems.length})`}>
            <EuiBasicTable<Finding>
              columns={this.createFindingTableColumns()}
              items={findingItems}
              loading={loading}
            />
          </ContentPanel>
        </EuiFlyoutBody>
      </EuiFlyout>
    );
  }
}
