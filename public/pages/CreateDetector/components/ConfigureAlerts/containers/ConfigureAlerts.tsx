/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import {
  EuiAccordion,
  EuiSmallButton,
  EuiCallOut,
  EuiPanel,
  EuiSpacer,
  EuiText,
  EuiTitle,
} from '@elastic/eui';
import { MAX_ALERT_CONDITIONS } from '../utils/constants';
import AlertConditionPanel from '../components/AlertCondition';
import { CreateDetectorRulesOptions } from '../../../../../models/types';
import {
  getEmptyAlertCondition,
  getNotificationChannels,
  parseNotificationChannelsToOptions,
} from '../utils/helpers';
import { NotificationsService } from '../../../../../services';
import { validateName } from '../../../../../utils/validation';
import { CoreServicesContext } from '../../../../../components/core_services';
import { BREADCRUMBS } from '../../../../../utils/constants';
import {
  AlertCondition,
  CreateDetectorSteps,
  Detector,
  DetectorCreationStep,
  NotificationChannelTypeOptions,
} from '../../../../../../types';
import { MetricsContext } from '../../../../../metrics/MetricsContext';

interface ConfigureAlertsProps extends RouteComponentProps {
  detector: Detector;
  isEdit: boolean;
  rulesOptions: CreateDetectorRulesOptions;
  changeDetector: (detector: Detector) => void;
  updateDataValidState: (step: DetectorCreationStep, isValid: boolean) => void;
  notificationsService: NotificationsService;
  getTriggerName: () => string;
  metricsContext?: MetricsContext;
}

interface ConfigureAlertsState {
  loading: boolean;
  notificationChannels: NotificationChannelTypeOptions[];
}

const isTriggerValid = (triggers: AlertCondition[]) => {
  return (
    !triggers.length ||
    triggers.every((trigger) => {
      return (
        !!trigger.name &&
        validateName(trigger.name) &&
        trigger.severity &&
        trigger.detection_types.length
      );
    })
  );
};

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
      detector: { triggers },
    } = this.props;
    this.getNotificationChannels();

    if (triggers.length === 0) {
      this.addCondition();
      this.props.updateDataValidState(DetectorCreationStep.CONFIGURE_ALERTS, true);
    } else {
      const isTriggerDataValid = isTriggerValid(triggers);
      this.props.updateDataValidState(DetectorCreationStep.CONFIGURE_ALERTS, isTriggerDataValid);
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
    const parsedChannels = parseNotificationChannelsToOptions(channels);
    this.setState({ notificationChannels: parsedChannels });
    this.setState({ loading: false });
  };

  addCondition = () => {
    const {
      changeDetector,
      detector,
      detector: { triggers },
      getTriggerName,
    } = this.props;
    const detectionTypes = ['rules'];
    if (detector.threat_intel_enabled) {
      detectionTypes.push('threat_intel');
    }
    const newTriggers = [...triggers];
    newTriggers.push(getEmptyAlertCondition(getTriggerName(), detectionTypes));
    changeDetector({ ...detector, triggers: newTriggers });
  };

  onAlertTriggerChanged = (newDetector: Detector, emitMetrics: boolean = true): void => {
    const isTriggerDataValid = isTriggerValid(newDetector.triggers);
    this.props.changeDetector(newDetector);
    this.props.updateDataValidState(DetectorCreationStep.CONFIGURE_ALERTS, isTriggerDataValid);
    if (emitMetrics) {
      this.props.metricsContext?.detectorMetricsManager.sendMetrics(
        CreateDetectorSteps.triggerConfigured
      );
    }
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

    let getPageTitle = (): string | JSX.Element => {
      if (isEdit) {
        return <>{`Alert triggers (${triggers.length})`}</>;
      }

      return (
        <>
          <EuiTitle size={'m'}>
            <h3>Set up alert triggers</h3>
          </EuiTitle>
          <EuiText size="s" color="subdued">
            Get notified when specific rule conditions are found by the detector.
          </EuiText>
        </>
      );
    };

    const { loading, notificationChannels } = this.state;
    const content = (
      <>
        {getPageTitle()}

        <EuiSpacer size={'m'} />

        {triggers.map((alertCondition, index) => (
          <div key={index}>
            {index > 0 && <EuiSpacer size={'l'} />}
            <EuiPanel>
              <EuiAccordion
                id={`alert-condition-${index}`}
                buttonContent={
                  <EuiTitle>
                    <h4>{alertCondition.name}</h4>
                  </EuiTitle>
                }
                paddingSize={'none'}
                initialIsOpen={true}
                extraAction={
                  <EuiSmallButton color="danger" onClick={() => this.onDelete(index)}>
                    Remove
                  </EuiSmallButton>
                }
              >
                <EuiSpacer size={'m'} />
                <AlertConditionPanel
                  {...this.props}
                  alertCondition={alertCondition}
                  allNotificationChannels={notificationChannels}
                  indexNum={index}
                  loadingNotifications={loading}
                  onAlertTriggerChanged={this.onAlertTriggerChanged}
                  refreshNotificationChannels={this.getNotificationChannels}
                />
              </EuiAccordion>
            </EuiPanel>
          </div>
        ))}
        {!triggers?.length && (
          <EuiCallOut
            color={'primary'}
            iconType={'iInCircle'}
            title={
              <>
                <p>
                  We recommend creating alert triggers to get notified when specific conditions are
                  found by the detector.
                </p>
                <p>You can also configure alert triggers after the detector is created.</p>
              </>
            }
          />
        )}

        <EuiSpacer size={'m'} />

        <EuiSmallButton disabled={triggers.length >= MAX_ALERT_CONDITIONS} onClick={this.addCondition}>
          {triggers.length > 0 ? 'Add another alert trigger' : 'Add alert triggers'}
        </EuiSmallButton>
      </>
    );

    return isEdit ? <div>{content}</div> : <EuiPanel>{content}</EuiPanel>;
  }
}
