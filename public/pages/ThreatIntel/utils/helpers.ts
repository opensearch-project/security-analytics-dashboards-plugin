/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { DEFAULT_EMPTY_DATA } from '../../../utils/constants';
import {
  ThreatIntelAlertTrigger,
  ThreatIntelNextStepCardProps,
  TriggerAction,
} from '../../../../types';
import { AlertSeverity } from '../../Alerts/utils/constants';
import { ALERT_SEVERITY_OPTIONS } from '../../CreateDetector/components/ConfigureAlerts/utils/constants';

export function getEmptyThreatIntelAlertTrigger(): ThreatIntelAlertTrigger {
  const emptyTriggerAction: TriggerAction = {
    id: '',
    name: '',
    destination_id: '',
    subject_template: {
      source: '',
      lang: 'mustache',
    },
    message_template: {
      source: '',
      lang: 'mustache',
    },
    throttle_enabled: false,
    throttle: {
      value: 10,
      unit: 'MINUTES',
    },
  };

  return {
    name: 'Trigger 1',
    triggerCondition: {
      indicatorType: [],
      dataSource: [],
    },
    alertSeverity: AlertSeverity.ONE,
    action: {
      ...emptyTriggerAction,
      destination_name: '',
    },
  };
}

export function getThreatIntelALertSeverityLabel(severity: AlertSeverity) {
  return (
    Object.values(ALERT_SEVERITY_OPTIONS).find((option) => option.value === severity)?.label ||
    DEFAULT_EMPTY_DATA
  );
}

export function getThreatIntelNextStepsProps(
  logSourceAdded: boolean,
  isScanSetup: boolean
): ThreatIntelNextStepCardProps[] {
  return [
    {
      id: 'add-source',
      title: '1. Setup threat intel sources',
      description: 'Add/activate threat intel source(s) to get started',
      footerButtonProps: {
        text: 'Add threat intel source',
      },
    },
    {
      id: 'configure-scan',
      title: '2. Set up the scan for your log sources',
      description: 'Select log sources for scan and get alerted on security threats',
      footerButtonProps: {
        text: isScanSetup ? 'Edit scan configuration' : 'Configure scan',
        disabled: !logSourceAdded,
      },
    },
  ];
}
