/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import {
  EuiAccordion,
  EuiButton,
  EuiHorizontalRule,
  EuiPanel,
  EuiSpacer,
  EuiTitle,
  EuiText,
} from '@elastic/eui';
import { createDetectorSteps } from '../../../utils/constants';
import { MAX_ALERT_CONDITIONS } from '../utils/constants';
import AlertConditionPanel from '../components/AlertCondition';
import { Detector } from '../../../../../../models/interfaces';
import { DetectorCreationStep } from '../../../models/types';
import { CreateDetectorRulesOptions } from '../../../../../models/types';
import { NotificationChannelTypeOptions } from '../models/interfaces';
import {
  getEmptyAlertCondition,
  getNotificationChannels,
  parseNotificationChannelsToOptions,
} from '../utils/helpers';
import { NotificationsService } from '../../../../../services';

interface ConfigureAlertsProps extends RouteComponentProps {
  detector: Detector;
  isEdit: boolean;
  rulesOptions: CreateDetectorRulesOptions;
  changeDetector: (detector: Detector) => void;
  updateDataValidState: (step: DetectorCreationStep, isValid: boolean) => void;
  notificationsService: NotificationsService;
  hasNotificationPlugin: boolean;
}

interface ConfigureAlertsState {
  loading: boolean;
  notificationChannels: NotificationChannelTypeOptions[];
}

export default class ConfigureAlerts extends Component<ConfigureAlertsProps, ConfigureAlertsState> {
  constructor(props: ConfigureAlertsProps) {
    super(props);
    this.state = {
      loading: false,
      notificationChannels: [],
    };
  }

  componentDidMount = async () => {
    const {
      detector: { triggers },
    } = this.props;
    this.getNotificationChannels();
    if (triggers.length === 0) {
      this.addCondition();
    }
  };

  getNotificationChannels = async () => {
    this.setState({ loading: true });
    const channels = await getNotificationChannels(this.props.notificationsService);
    this.setState({ notificationChannels: parseNotificationChannelsToOptions(channels) });
    this.setState({ loading: false });
  };

  addCondition = () => {
    const {
      changeDetector,
      detector,
      detector: { triggers },
    } = this.props;
    triggers.push(getEmptyAlertCondition());
    changeDetector({ ...detector, triggers });
  };

  onAlertTriggerChanged = (newDetector: Detector): void => {
    const isTriggerDataValid = newDetector.triggers.every((trigger) => {
      return !!trigger.name && trigger.severity;
    });
    this.props.changeDetector(newDetector);
    this.props.updateDataValidState(DetectorCreationStep.CONFIGURE_ALERTS, isTriggerDataValid);
  };

  onDelete = (index: number) => {
    const {
      detector,
      detector: { triggers },
    } = this.props;
    triggers.splice(index, 1);
    this.onAlertTriggerChanged({ ...detector, triggers: triggers });
  };

  render() {
    const {
      detector: { triggers },
    } = this.props;
    const { loading, notificationChannels } = this.state;
    return (
      <div>
        <EuiTitle size={'m'}>
          <h3>
            {createDetectorSteps[DetectorCreationStep.CONFIGURE_ALERTS].title +
              ` (${triggers.length})`}
          </h3>
        </EuiTitle>

        <EuiText size="s" color="subdued">
          Get notified when specific rule conditions are found by the detector.
        </EuiText>

        <EuiSpacer size={'m'} />

        {triggers.map((alertCondition, index) => (
          <div key={index}>
            {index > 0 && <EuiSpacer size={'l'} />}
            <EuiPanel>
              <EuiAccordion
                id={`alert-condition-${index}`}
                buttonContent={
                  <EuiTitle>
                    <h4>Alert trigger</h4>
                  </EuiTitle>
                }
                paddingSize={'none'}
                initialIsOpen={true}
                extraAction={
                  <EuiButton color="danger" onClick={() => this.onDelete(index)}>
                    Remove alert trigger
                  </EuiButton>
                }
              >
                <EuiHorizontalRule margin={'xs'} />
                <EuiSpacer size={'m'} />
                <AlertConditionPanel
                  {...this.props}
                  alertCondition={alertCondition}
                  allNotificationChannels={notificationChannels}
                  indexNum={index}
                  loadingNotifications={loading}
                  onAlertTriggerChanged={this.onAlertTriggerChanged}
                  refreshNotificationChannels={this.getNotificationChannels}
                  hasNotificationPlugin={this.props.hasNotificationPlugin}
                />
              </EuiAccordion>
            </EuiPanel>
          </div>
        ))}

        <EuiSpacer size={'m'} />

        <EuiButton disabled={triggers.length >= MAX_ALERT_CONDITIONS} onClick={this.addCondition}>
          {`Add ${triggers.length > 0 ? 'another' : 'an'} alert condition`}
        </EuiButton>
      </div>
    );
  }
}
