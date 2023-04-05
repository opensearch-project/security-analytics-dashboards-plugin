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
import { DetectorCreationStep } from '../../../models/types';
import { CreateDetectorRulesOptions } from '../../../../../models/types';
import { NotificationChannelTypeOptions } from '../models/interfaces';
import {
  getEmptyAlertCondition,
  getNotificationChannels,
  parseNotificationChannelsToOptions,
} from '../utils/helpers';
import { NotificationsService } from '../../../../../services';
import { validateName } from '../../../../../utils/validation';
import { CoreServicesContext } from '../../../../../components/core_services';
import { BREADCRUMBS } from '../../../../../utils/constants';
import { Detector } from '../../../../../../types';

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
  static contextType = CoreServicesContext;

  constructor(props: ConfigureAlertsProps) {
    super(props);
    this.state = {
      loading: false,
      notificationChannels: [],
    };
  }

  updateBreadcrumbs = () => {
    const {
      isEdit,
      detector: { id = '', name },
    } = this.props;

    isEdit &&
      this.context.chrome.setBreadcrumbs([
        BREADCRUMBS.SECURITY_ANALYTICS,
        BREADCRUMBS.DETECTORS,
        BREADCRUMBS.DETECTORS_DETAILS(name, id),
        {
          text: 'Edit alert triggers',
        },
      ]);
  };

  componentDidMount = async () => {
    this.updateBreadcrumbs();
    const {
      isEdit,
      detector,
      detector: { triggers },
    } = this.props;
    this.getNotificationChannels();

    if (triggers.length === 0) {
      this.addCondition();
    }
  };

  componentDidUpdate(
    prevProps: Readonly<ConfigureAlertsProps>,
    prevState: Readonly<ConfigureAlertsState>,
    snapshot?: any
  ) {
    this.updateBreadcrumbs();
  }

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
      return !!trigger.name && validateName(trigger.name) && trigger.severity;
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
      isEdit,
      detector: { triggers },
    } = this.props;
    const { loading, notificationChannels } = this.state;
    return (
      <div>
        <EuiTitle size={'m'}>
          <h3>
            {isEdit
              ? `Alert triggers (${triggers.length})`
              : createDetectorSteps[DetectorCreationStep.CONFIGURE_ALERTS].title}
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
                    <h4>{isEdit ? alertCondition.name : 'Alert trigger'}</h4>
                  </EuiTitle>
                }
                paddingSize={'none'}
                initialIsOpen={true}
                extraAction={
                  <EuiButton color="danger" onClick={() => this.onDelete(index)}>
                    Remove
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
          {triggers.length > 0 ? 'Add another alert trigger' : 'Add alert triggers'}
        </EuiButton>
      </div>
    );
  }
}
