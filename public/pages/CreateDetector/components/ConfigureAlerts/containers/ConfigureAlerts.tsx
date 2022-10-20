/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { EuiButton, EuiSpacer, EuiTitle } from '@elastic/eui';
import { createDetectorSteps } from '../../../utils/constants';
import {
  EMPTY_DEFAULT_ALERT_CONDITION,
  MAX_ALERT_CONDITIONS,
  MIN_ALERT_CONDITIONS,
} from '../utils/constants';
import AlertConditionPanel from '../components/AlertCondition';
import { Detector } from '../../../../../../models/interfaces';
import { DetectorCreationStep } from '../../../models/types';

interface ConfigureAlertsProps extends RouteComponentProps {
  detector: Detector;
  isEdit: boolean;
  changeDetector: (detector: Detector) => void;
  updateDataValidState: (step: DetectorCreationStep, isValid: boolean) => void;
}

interface ConfigureAlertsState {
  loading: boolean;
  notificationChannels: string[];
  ruleTypes: string[];
}

export default class ConfigureAlerts extends Component<ConfigureAlertsProps, ConfigureAlertsState> {
  constructor(props: ConfigureAlertsProps) {
    super(props);
    this.state = {
      loading: false,
      notificationChannels: [],
      ruleTypes: [],
    };
  }

  componentDidMount = async () => {
    const {
      detector: { triggers },
    } = this.props;
    this.getNotificationChannels();
    if (triggers.length < MIN_ALERT_CONDITIONS) {
      this.addCondition();
    }
  };

  getNotificationChannels = async () => {
    this.setState({ loading: true });
    // TODO: fetch notification channels from server.
    this.setState({ loading: false });
  };

  addCondition = () => {
    const {
      changeDetector,
      detector,
      detector: { triggers },
    } = this.props;
    triggers.push(EMPTY_DEFAULT_ALERT_CONDITION);
    changeDetector({ ...detector, triggers });
  };

  onAlertTriggerChanged = (newDetector: Detector): void => {
    const isTriggerDataValid = newDetector.triggers.every((trigger) => {
      return !!trigger.name && trigger.sev_levels.length > 0;
    });
    this.props.changeDetector(newDetector);
    this.props.updateDataValidState(DetectorCreationStep.CONFIGURE_ALERTS, isTriggerDataValid);
  };

  render() {
    const {
      detector: { triggers },
    } = this.props;
    const { loading, notificationChannels, ruleTypes } = this.state;
    return (
      <div>
        <EuiTitle size={'l'}>
          <h3>
            {createDetectorSteps[DetectorCreationStep.CONFIGURE_ALERTS].title +
              ` (${triggers.length}/${MAX_ALERT_CONDITIONS})`}
          </h3>
        </EuiTitle>

        <EuiSpacer size={'m'} />

        {triggers.map((alertCondition, index) => (
          <div key={index}>
            {index > 0 && <EuiSpacer size={'l'} />}
            <AlertConditionPanel
              {...this.props}
              alertCondition={alertCondition}
              allNotificationChannels={notificationChannels}
              allRuleTypes={ruleTypes}
              indexNum={index}
              loadingNotifications={loading}
              onAlertTriggerChanged={this.onAlertTriggerChanged}
            />
          </div>
        ))}

        <EuiSpacer size={'m'} />

        <EuiButton disabled={triggers.length >= MAX_ALERT_CONDITIONS} onClick={this.addCondition}>
          Add another alert condition
        </EuiButton>
      </div>
    );
  }
}
