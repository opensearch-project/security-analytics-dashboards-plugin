/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import {
  EuiSmallButton,
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
import { AlertCondition } from '../../../../models/interfaces';
import { DetectorsService } from '../../../services';
import { RulesSharedState } from '../../../models/interfaces';
import { DEFAULT_EMPTY_DATA } from '../../../utils/constants';
import {} from '../models/interfaces';
import { getEmptyAlertCondition } from '../../CreateDetector/components/ConfigureAlerts/utils/helpers';
import { validateName } from '../../../utils/validation';
import { addDetectionType } from '../../../utils/helpers';
import { Detector, FindingItemType, NotificationChannelTypeOptions } from '../../../../types';

interface CreateAlertFlyoutProps extends RouteComponentProps {
  closeFlyout: (refreshPage?: boolean) => void;
  detectorService: DetectorsService;
  finding: FindingItemType;
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
  isTriggerDataValid: boolean;
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
      isTriggerDataValid: false,
    };
  }

  componentDidMount = async () => {
    this.prepareAlertCondition();
  };

  prepareAlertCondition = async () => {
    const { rulesOptions } = this.props;
    const { alertCondition, detector } = this.state;
    const newAlertCondition = { ...alertCondition };

    if (rulesOptions.length) {
      newAlertCondition.detection_types = addDetectionType(newAlertCondition, 'rules');
    }

    if (detector.threat_intel_enabled) {
      newAlertCondition.detection_types = addDetectionType(newAlertCondition, 'threat_intel');
    }

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
    const isTriggerDataValid = newDetector.triggers.every((trigger) => {
      return !!trigger.name && validateName(trigger.name);
    });
    this.setState({ detector: { ...newDetector }, isTriggerDataValid });
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
    const { alertCondition, loading, detector, submitting, isTriggerDataValid } = this.state;
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
          />
          <EuiSpacer size={'m'} />

          <EuiFlexGroup justifyContent={'flexEnd'}>
            <EuiFlexItem grow={false}>
              <EuiSmallButton disabled={submitting} onClick={() => closeFlyout()}>
                Cancel
              </EuiSmallButton>
            </EuiFlexItem>

            <EuiFlexItem grow={false}>
              <EuiSmallButton
                disabled={submitting || !isTriggerDataValid}
                fill={true}
                isLoading={submitting}
                onClick={this.onCreate}
              >
                Create alert trigger
              </EuiSmallButton>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlyoutBody>
      </EuiFlyout>
    );
  }
}
