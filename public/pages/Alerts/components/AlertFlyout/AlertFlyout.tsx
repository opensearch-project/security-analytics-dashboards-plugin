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
import { ALERT_STATE, DEFAULT_EMPTY_DATA, ROUTES } from '../../../../utils/constants';
import {
  capitalizeFirstLetter,
  createTextDetailsGroup,
  errorNotificationToast,
  formatRuleType,
  renderTime,
} from '../../../../utils/helpers';
import { IndexPatternsService, OpenSearchService } from '../../../../services';
import { parseAlertSeverityToOption } from '../../../CreateDetector/components/ConfigureAlerts/utils/helpers';
import { Finding } from '../../../Findings/models/interfaces';
import { NotificationsStart } from 'opensearch-dashboards/public';
import { DataStore } from '../../../../store/DataStore';
import { Detector } from '../../../../../types';

export interface AlertFlyoutProps {
  alertItem: AlertItem;
  detector: Detector;
  notifications: NotificationsStart;
  opensearchService: OpenSearchService;
  indexPatternService: IndexPatternsService;
  onClose: () => void;
  onAcknowledge: (selectedItems: AlertItem[]) => void;
}

export interface AlertFlyoutState {
  acknowledged: boolean;
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

  getFindings = async () => {
    this.setState({ loading: true });
    const { notifications } = this.props;
    try {
      const relatedFindings = await DataStore.findings.getFindingsByIds(
        this.props.alertItem.finding_ids
      );
      this.setState({ findingItems: relatedFindings });
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

    const backButton = (
      <EuiButtonIcon
        iconType="arrowLeft"
        aria-label="back"
        onClick={() => DataStore.findings.closeFlyout()}
        display="base"
        size="s"
        data-test-subj={'finding-details-flyout-back-button'}
      />
    );

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
        render: (id, finding: any) =>
          (
            <EuiLink
              onClick={() => {
                const customRules = detector.inputs[0].detector_input.custom_rules[0];
                const prePackagedRules = detector.inputs[0].detector_input.pre_packaged_rules[0];
                const rule = rules[customRules?.id] || rules[prePackagedRules?.id] || {};
                DataStore.findings.openFlyout(
                  {
                    ...finding,
                    detector: { _id: detector.id as string, _index: '', _source: detector },
                    ruleName: rule.title,
                    ruleSeverity:
                      rule.level === 'critical'
                        ? rule.level
                        : finding['ruleSeverity'] || rule.level,
                  },
                  [...this.state.findingItems, finding],
                  true,
                  backButton
                );
              }}
              data-test-subj={'finding-details-flyout-button'}
            >
              {`${(id as string).slice(0, 7)}...`}
            </EuiLink>
          ) || DEFAULT_EMPTY_DATA,
      },
      {
        field: 'detectionType',
        name: 'Detection type',
        render: (detectionType: string) => detectionType || DEFAULT_EMPTY_DATA,
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
    const { acknowledged, findingItems, loading } = this.state;

    return (
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
            {
              label: 'Detector',
              content: detector.name,
              url: `#${ROUTES.DETECTOR_DETAILS}/${detector.id}`,
              target: '_blank',
            },
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
