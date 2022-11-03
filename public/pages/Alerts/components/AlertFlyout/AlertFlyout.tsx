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
import { createTextDetailsGroup, renderTime } from '../../../../utils/helpers';
import { FindingsService, RuleService } from '../../../../services';
import FindingDetailsFlyout from '../../../Findings/components/FindingDetailsFlyout';
import { Detector, Rule } from '../../../../../models/interfaces';
import { parseAlertSeverityToOption } from '../../../CreateDetector/components/ConfigureAlerts/utils/helpers';
import { Finding } from '../../../Findings/models/interfaces';

export interface AlertFlyoutProps {
  alertItem: AlertItem;
  detector: Detector;
  findingsService: FindingsService;
  ruleService: RuleService;
  onClose: () => void;
  onAcknowledge: (selectedItems: AlertItem[]) => void;
}

export interface AlertFlyoutState {
  acknowledged: boolean;
  findingFlyoutData?: Finding;
  findingItems: Finding[];
  loading: boolean;
  rules: { [key: string]: Rule };
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
    const findingRes = await this.props.findingsService.getFindings({
      detectorId: this.props.alertItem.detector_id,
    });

    if (findingRes.ok) {
      this.setState({ findingItems: findingRes.response.findings });
    }
    await this.getRules();
    this.setState({ loading: false });
  };

  getRules = async () => {
    try {
      const { ruleService } = this.props;
      const { findingItems } = this.state;
      const ruleIds: string[] = [];
      findingItems.forEach((finding) => {
        finding.queries.forEach((query) => ruleIds.push(query.id));
      });
      const body = {
        from: 0,
        size: 5000,
        query: {
          nested: {
            path: 'rule',
            query: {
              terms: {
                _id: ruleIds,
              },
            },
          },
        },
      };

      if (ruleIds.length > 0) {
        const prePackagedResponse = await ruleService.getRules(true, body);
        const customResponse = await ruleService.getRules(false, body);

        const allRules: { [id: string]: RuleSource } = {};
        if (prePackagedResponse.ok) {
          prePackagedResponse.response.hits.hits.forEach(
            (hit) => (allRules[hit._id] = hit._source)
          );
        } else {
          console.error('Failed to retrieve pre-packaged rules:', prePackagedResponse.error);
        }
        if (customResponse.ok) {
          customResponse.response.hits.hits.forEach((hit) => (allRules[hit._id] = hit._source));
        } else {
          console.error('Failed to retrieve custom rules:', customResponse.error);
          // TODO: Display toast with error details
        }

        this.setState({ rules: allRules });
      }
    } catch (e) {
      console.error('Failed to retrieve rules:', e);
      // TODO: Display toast with error details
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
            <EuiLink onClick={() => this.setFindingFlyoutData(finding)}>
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
        render: () => detector.detector_type || DEFAULT_EMPTY_DATA,
      },
    ];
  }

  render() {
    const { onClose, alertItem, detector, onAcknowledge } = this.props;
    const {
      trigger_name,
      state,
      severity,
      start_time,
      last_notification_time,
      finding_ids,
    } = alertItem;
    const { acknowledged, findingFlyoutData, loading, rules } = this.state;

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
            aria-lable="back"
            onClick={() => this.setFindingFlyoutData()}
            display="base"
            size="s"
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
                  >
                    Acknowledge
                  </EuiButton>
                </EuiFlexItem>
                <EuiFlexItem grow={false}>
                  <EuiButtonIcon iconType="cross" iconSize="m" display="empty" onClick={onClose} />
                </EuiFlexItem>
              </EuiFlexGroup>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlyoutHeader>
        <EuiFlyoutBody>
          {createTextDetailsGroup([
            { label: 'Alert trigger name', content: trigger_name },
            { label: 'Alert status', content: state },
            {
              label: 'Alert severity',
              content: parseAlertSeverityToOption(severity)?.label || DEFAULT_EMPTY_DATA,
            },
          ])}
          {createTextDetailsGroup([
            { label: 'Start time', content: start_time },
            { label: 'Last updated time', content: last_notification_time },
            { label: '', content: '' },
          ])}
          {createTextDetailsGroup([
            { label: 'Detector', content: detector.name },
            { label: '', content: '' },
            { label: '', content: '' },
          ])}

          <EuiSpacer size={'xxl'} />

          <ContentPanel title={`Findings (${finding_ids.length})`}>
            <EuiBasicTable<Finding>
              columns={this.createFindingTableColumns()}
              items={this.state.findingItems}
              loading={loading}
            />
          </ContentPanel>
        </EuiFlyoutBody>
      </EuiFlyout>
    );
  }
}
