/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiBadge,
    EuiBasicTable,
    EuiBasicTableColumn,
    EuiSmallButton,
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
  import { RuleSource } from '../../../../../server/models/interfaces';
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
  import { parseAlertSeverityToOption } from '../../../CreateDetector/components/ConfigureAlerts/utils/helpers';
  import { NotificationsStart } from 'opensearch-dashboards/public';
  import { DataStore } from '../../../../store/DataStore';
  import { CorrelationAlertTableItem, Finding, Query } from '../../../../../types';

  export interface CorrelationAlertFlyoutProps {
    alertItem: CorrelationAlertTableItem;
    notifications: NotificationsStart;
    onClose: () => void;
    onAcknowledge: (selectedItems: CorrelationAlertTableItem[]) => void;
  }

  export interface CorrelationAlertFlyoutState {
    acknowledged: boolean;
    findingItems: Finding[];
    loading: boolean;
    rules: { [key: string]: RuleSource };
  }

  export class CorrelationAlertFlyout extends React.Component<CorrelationAlertFlyoutProps, CorrelationAlertFlyoutState> {
    constructor(props: CorrelationAlertFlyoutProps) {
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
        const findingIds = this.props.alertItem.correlated_finding_ids;
        const relatedFindings = await DataStore.findings.getFindingsByIds(
          findingIds
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

        // Extract ruleIds in order from findingItems
        findingItems.forEach((finding) => {
          finding.queries.forEach((query) => {
            ruleIds.push(query.id);
          });
        });

        if (ruleIds.length > 0) {
          // Fetch rules based on ruleIds
          const rules = await DataStore.rules.getAllRules({ _id: ruleIds });

          // Prepare allRules object with rules mapped by _id
          const allRules: { [id: string]: RuleSource } = {};
          rules.forEach((hit) => {
            allRules[hit._id] = hit._source;
          });

          // Update state with allRules
          this.setState({ rules: allRules });
        }
      } catch (e: any) {
        // Handle errors if any
        errorNotificationToast(notifications, 'retrieve', 'rules', e);
      }
    };

    createFindingTableColumns(): EuiBasicTableColumn<Finding>[] {
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
          render: (id: string, finding: any) => (
            <EuiLink
              onClick={() => {
                const ruleId = finding.queries[0]?.id; // Assuming you retrieve rule ID from finding
                const rule: RuleSource | undefined = rules[ruleId];

                DataStore.findings.openFlyout(
                  {
                    ...finding,
                    detector: { _id: finding.detector_id as string, _index: '' },
                    ruleName: rule?.title || '',
                    ruleSeverity: rule?.level === 'critical' ? rule.level : finding['ruleSeverity'] || rule?.level,
                  },
                  [...this.state.findingItems, finding],
                  true,
                  backButton
                );
              }}
              data-test-subj={'finding-details-flyout-button'}
            >
              {id.length > 7 ? `${id.slice(0, 7)}...` : id}
            </EuiLink>
          ),
        },
        {
          field: 'detectionType',
          name: 'Detection type',
          render: (detectionType: string) => detectionType || DEFAULT_EMPTY_DATA,
        },
        {
          field: 'queries',
          name: 'Log type',
          sortable: true,
          dataType: 'string',
          render: (queries: Query[], item: any) => {
            const key = item.id;
            const tag = queries[0]?.tags[1];
            return (
              <EuiBadge key={key}>
                {tag ? formatRuleType(tag) : ''}
              </EuiBadge>
            );
          },
        },
      ];
    }


    render() {
      const { onClose, alertItem, onAcknowledge } = this.props;
      const { trigger_name, state, severity, start_time, end_time } = alertItem;
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
                    <EuiSmallButton
                      disabled={acknowledged || alertItem.state !== ALERT_STATE.ACTIVE}
                      onClick={() => {
                        this.setState({ acknowledged: true });
                        onAcknowledge([alertItem]);
                      }}
                      data-test-subj={'alert-details-flyout-acknowledge-button'}
                    >
                      Acknowledge
                    </EuiSmallButton>
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
              { label: 'Last updated time', content: renderTime(end_time) },
              {
                label: 'Correlation rule',
                content: alertItem.correlation_rule_name,
                url: `#${ROUTES.CORRELATION_RULE_EDIT}/${alertItem.correlation_rule_id}`,
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
