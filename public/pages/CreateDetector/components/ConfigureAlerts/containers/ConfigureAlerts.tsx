/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { EuiButton, EuiSpacer, EuiTitle } from '@elastic/eui';
import { CREATE_DETECTOR_STEPS } from '../../../utils/constants';
import {
  EMPTY_DEFAULT_ALERT_CONDITION,
  MAX_ALERT_CONDITIONS,
  MIN_ALERT_CONDITIONS,
} from '../utils/constants';
import AlertConditionPanel from '../components/AlertCondition';
import { Detector } from '../../../../../../models/interfaces';

interface ConfigureAlertsProps extends RouteComponentProps {
  changeDetector: (detector: Detector) => void;
  detector: Detector;
  isEdit: boolean;
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
      detector: { alert_conditions },
    } = this.props;
    this.getNotificationChannels();
    if (alert_conditions.length < MIN_ALERT_CONDITIONS) {
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
      detector: { alert_conditions },
    } = this.props;
    alert_conditions.push(EMPTY_DEFAULT_ALERT_CONDITION);
    changeDetector({ ...detector, alert_conditions: alert_conditions });
  };

  render() {
    const {
      detector: { alert_conditions },
    } = this.props;
    const { loading, notificationChannels, ruleTypes } = this.state;
    return (
      <div>
        <EuiTitle size={'l'}>
          <h3>
            {CREATE_DETECTOR_STEPS.CONFIGURE_ALERTS.title +
              ` (${alert_conditions.length}/${MAX_ALERT_CONDITIONS})`}
          </h3>
        </EuiTitle>

        <EuiSpacer size={'m'} />

        {alert_conditions.map((alertCondition, index) => (
          <div key={index}>
            {index > 0 && <EuiSpacer size={'l'} />}
            <AlertConditionPanel
              {...this.props}
              alertCondition={alertCondition}
              allNotificationChannels={notificationChannels}
              allRuleTypes={ruleTypes}
              indexNum={index}
              loadingNotifications={loading}
            />
          </div>
        ))}

        <EuiSpacer size={'m'} />

        <EuiButton
          disabled={alert_conditions.length >= MAX_ALERT_CONDITIONS}
          onClick={this.addCondition}
        >
          Add another alert condition
        </EuiButton>
      </div>
    );
  }
}
