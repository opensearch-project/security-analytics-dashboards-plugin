/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import {
  EuiButton,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFlyout,
  EuiFlyoutBody,
  EuiFlyoutHeader,
  EuiFormRow,
  EuiSpacer,
  EuiText,
  EuiTitle,
} from '@elastic/eui';
import AlertConditionPanel from '../../CreateDetector/components/ConfigureAlerts/components/AlertCondition';
import { AlertCondition, Detector } from '../../../../models/interfaces';
import { DetectorsService } from '../../../services';
import { RulesSharedState } from '../../../models/interfaces';
import { DEFAULT_EMPTY_DATA } from '../../../utils/constants';
import { NotificationChannelTypeOptions } from '../../CreateDetector/components/ConfigureAlerts/models/interfaces';
import { Finding } from '../models/interfaces';
import { getEmptyAlertCondition } from '../../CreateDetector/components/ConfigureAlerts/utils/helpers';

interface CreateAlertFlyoutProps extends RouteComponentProps {
  closeFlyout: (refreshPage?: boolean) => void;
  detectorService: DetectorsService;
  finding: Finding;
  notificationChannels: NotificationChannelTypeOptions[];
  refreshNotificationChannels: () => void;
  allRules: object;
  rulesOptions: Pick<RulesSharedState, 'rulesOptions'>['rulesOptions'];
  hasNotificationPlugin: boolean;
}

interface CreateAlertFlyoutState {
  alertCondition: AlertCondition;
  loading: boolean;
  detector: Detector;
  submitting: boolean;
}

export default class CreateAlertFlyout extends Component<
  CreateAlertFlyoutProps,
  CreateAlertFlyoutState
> {
  constructor(props: CreateAlertFlyoutProps) {
    super(props);
    this.state = {
      alertCondition: getEmptyAlertCondition(),
      loading: false,
      detector: this.props.finding.detector._source,
      submitting: false,
    };
  }

  componentDidMount = async () => {
    this.prepareAlertCondition();
  };

  prepareAlertCondition = async () => {
    const { rulesOptions } = this.props;
    const { alertCondition } = this.state;
    const newAlertCondition = { ...alertCondition };

    const selectedRuleNames = new Set<string>();
    const selectedRuleSeverities = new Set<string>();
    const selectedTags = new Set<string>();

    rulesOptions.forEach((rule) => {
      selectedRuleNames.add(rule.id);
      selectedRuleSeverities.add(rule.severity);
      rule.tags.forEach((tag) => selectedTags.add(tag));
    });

    newAlertCondition.ids = Array.from(selectedRuleNames);
    newAlertCondition.sev_levels = Array.from(selectedRuleSeverities);
    newAlertCondition.tags = Array.from(selectedTags);

    this.setState({ alertCondition: newAlertCondition });
  };

  onAlertConditionChange = (newDetector: Detector): void => {
    this.setState({ detector: { ...newDetector } });
  };

  onCreate = async () => {
    this.setState({ submitting: true });
    const {
      detectorService,
      finding: {
        detector: { _id },
      },
    } = this.props;
    const { detector } = this.state;

    try {
      const response = await detectorService.updateDetector(_id, detector);
      if (!response.ok) {
        console.error('Failed to update detector: ', response.error);
      }
    } catch (e) {
      console.error('Failed to update detector: ', e);
    }
    this.setState({ submitting: false });
    this.props.closeFlyout(true);
  };

  render() {
    const {
      finding: {
        detector: {
          _source: { name, triggers },
        },
      },
      closeFlyout,
      notificationChannels,
    } = this.props;
    const { alertCondition, loading, detector, submitting } = this.state;
    const indexNum = triggers.length;
    return (
      <EuiFlyout onClose={closeFlyout} ownFocus={true} size={'m'}>
        <EuiFlyoutHeader hasBorder={true}>
          <EuiTitle size={'m'}>
            <h3>Create detector alert trigger</h3>
          </EuiTitle>
        </EuiFlyoutHeader>

        <EuiFlyoutBody>
          <EuiFormRow label={'Detector'}>
            {/*//TODO: Refactor EuiText to EuiLink once detector edit page is available, and hyperlink to that page.*/}
            <EuiText>{name || DEFAULT_EMPTY_DATA}</EuiText>
          </EuiFormRow>

          <EuiSpacer size={'m'} />
          <AlertConditionPanel
            {...this.props}
            alertCondition={detector.triggers[indexNum] || alertCondition}
            allNotificationChannels={notificationChannels}
            detector={detector}
            indexNum={indexNum}
            isEdit={false}
            loadingNotifications={loading}
            onAlertTriggerChanged={this.onAlertConditionChange}
            hasNotificationPlugin={this.props.hasNotificationPlugin}
          />
          <EuiSpacer size={'m'} />

          <EuiFlexGroup justifyContent={'flexEnd'}>
            <EuiFlexItem grow={false}>
              <EuiButton disabled={submitting} onClick={closeFlyout}>
                Cancel
              </EuiButton>
            </EuiFlexItem>

            <EuiFlexItem grow={false}>
              <EuiButton
                disabled={submitting}
                fill={true}
                isLoading={submitting}
                onClick={this.onCreate}
              >
                Create alert trigger
              </EuiButton>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlyoutBody>
      </EuiFlyout>
    );
  }
}
