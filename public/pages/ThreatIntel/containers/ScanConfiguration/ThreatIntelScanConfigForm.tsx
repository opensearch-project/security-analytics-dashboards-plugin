/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useContext, useEffect, useRef, useState } from 'react';
import {
  EuiButton,
  EuiButtonEmpty,
  EuiFlexGroup,
  EuiFlexItem,
  EuiSpacer,
  EuiSteps,
  EuiTitle,
} from '@elastic/eui';
import { BREADCRUMBS, PLUGIN_NAME, ROUTES } from '../../../../utils/constants';
import { CoreServicesContext } from '../../../../components/core_services';
import { SelectThreatIntelLogSources } from '../../components/SelectLogSourcesForm/SelectThreatIntelLogSourcesForm';
import {
  ThreatIntelScanConfig,
  ThreatIntelAlertTrigger,
  ThreatIntelLogSource,
  ThreatIntelScanConfigFormModel,
} from '../../../../../types';
import { SetupThreatIntelAlertTriggers } from '../../components/SetupThreatIntelAlertTriggers/SetupThreatIntelAlertTriggers';
import { NotificationsService, ThreatIntelService } from '../../../../services';
import {
  configFormModelToMonitorPayload,
  deriveFormModelFromConfig,
  getEmptyScanConfigFormModel,
} from '../../utils/helpers';
import { RouteComponentProps } from 'react-router-dom';
import { ConfigureThreatIntelScanStep } from '../../utils/constants';
import { NotificationsStart } from 'opensearch-dashboards/public';
import { PeriodSchedule } from '../../../../../models/interfaces';
import { errorNotificationToast } from '../../../../utils/helpers';

export interface ThreatIntelScanConfigFormProps
  extends RouteComponentProps<
    any,
    any,
    { scanConfig?: ThreatIntelScanConfig; step?: ConfigureThreatIntelScanStep }
  > {
  notificationsService: NotificationsService;
  threatIntelService: ThreatIntelService;
  notifications: NotificationsStart;
}

interface FormErrors {
  logSourceError?: string;
  fieldAliasError?: string;
  triggersErrors?: {
    nameError?: string;
    notificationChannelError?: string;
  }[];
}

export const ThreatIntelScanConfigForm: React.FC<ThreatIntelScanConfigFormProps> = ({
  notificationsService,
  notifications,
  location,
  threatIntelService,
  history,
}) => {
  const isEdit = !!location.state?.scanConfig?.indices.length;
  const context = useContext(CoreServicesContext);
  const [currentStep, setCurrentStep] = useState(
    location.state?.step ?? ConfigureThreatIntelScanStep.SelectLogSources
  );
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [configureInProgress, setConfigureInProgress] = useState(false);
  const [stepDataValid, setStepDataValid] = useState({
    [ConfigureThreatIntelScanStep.SelectLogSources]: true,
    [ConfigureThreatIntelScanStep.SetupAlertTriggers]: false,
  });
  const threatIntelTriggerCounter = useRef(0);
  const getNextTriggerName = () => {
    threatIntelTriggerCounter.current++;
    return `Trigger ${threatIntelTriggerCounter.current}`;
  };

  const [configureScanFormInputs, setConfigureScanPayload] = useState<
    ThreatIntelScanConfigFormModel
  >(() => {
    if (location.state?.scanConfig) {
      return deriveFormModelFromConfig(location.state?.scanConfig);
    }

    return getEmptyScanConfigFormModel(getNextTriggerName());
  });

  useEffect(() => {
    context?.chrome.setBreadcrumbs([
      BREADCRUMBS.SECURITY_ANALYTICS,
      BREADCRUMBS.THREAT_INTEL_OVERVIEW,
      isEdit
        ? BREADCRUMBS.THREAT_INTEL_EDIT_SCAN_CONFIG
        : BREADCRUMBS.THREAT_INTEL_SETUP_SCAN_CONFIG,
    ]);
  }, []);

  const updateFormErrors = (errors: FormErrors) => {
    const newErrors = {
      ...formErrors,
      ...errors,
    };
    setFormErrors(newErrors);
    updateStepValidity(newErrors);
  };

  const validateLogSources = (logSources: ThreatIntelScanConfigFormModel['logSources']) => {
    if (logSources.length === 0) {
      return 'Select at least one index/alias';
    }
  };

  const validateFieldAliases = (logSources: ThreatIntelScanConfigFormModel['logSources']) => {
    const iocEnabled = logSources.every((logSource) => {
      return Object.keys(logSource.iocConfigMap).length !== 0;
    });

    if (!iocEnabled) {
      return 'Enable at least one IoC type for each selected index/alias.';
    }

    for (let l of logSources) {
      for (let [_ioc, config] of Object.entries(l.iocConfigMap)) {
        if (config.enabled && (!config.fieldAliases || config.fieldAliases.length === 0)) {
          return 'Add at least one log source field for each enabled IoC type.';
        }
      }
    }

    return '';
  };

  const updateStepValidity = (errors: FormErrors) => {
    const stepOneDataValid = !errors.logSourceError && !errors.fieldAliasError;
    const stepTwoDataValid = !errors.triggersErrors?.some(
      (errors) => errors.nameError || errors.notificationChannelError
    );

    setStepDataValid({
      [ConfigureThreatIntelScanStep.SelectLogSources]: stepOneDataValid,
      [ConfigureThreatIntelScanStep.SetupAlertTriggers]: stepTwoDataValid,
    });
  };

  const validateFormData = (formModel: ThreatIntelScanConfigFormModel) => {
    validateLogSources(formModel.logSources);
    validateFieldAliases(formModel.logSources);
  };

  const updatePayload = (formModel: ThreatIntelScanConfigFormModel) => {
    setConfigureScanPayload(formModel);
  };

  const onSourcesChange = (logSources: ThreatIntelLogSource[]): void => {
    updatePayload({
      ...configureScanFormInputs,
      logSources,
      indices: logSources.map(({ name }) => name),
    });
    const logSourceError = validateLogSources(logSources);
    const fieldAliasError = validateFieldAliases(logSources);
    updateFormErrors({
      logSourceError,
      fieldAliasError,
    });
  };

  const onTriggersChange = (triggers: ThreatIntelAlertTrigger[]) => {
    updatePayload({
      ...configureScanFormInputs,
      triggers,
    });
  };

  const onScheduleChange = (schedule: PeriodSchedule) => {
    updatePayload({
      ...configureScanFormInputs,
      schedule,
    });
  };

  const getStepConent = (step: ConfigureThreatIntelScanStep) => {
    switch (step) {
      case ConfigureThreatIntelScanStep.SelectLogSources:
        return (
          <SelectThreatIntelLogSources
            sources={configureScanFormInputs.logSources}
            schedule={configureScanFormInputs.schedule}
            notifications={notifications}
            updateSources={onSourcesChange}
            updateSchedule={onScheduleChange}
          />
        );
      case ConfigureThreatIntelScanStep.SetupAlertTriggers:
        return (
          <SetupThreatIntelAlertTriggers
            alertTriggers={configureScanFormInputs.triggers}
            notificationsService={notificationsService}
            enabledIocTypes={configFormModelToMonitorPayload(
              configureScanFormInputs
            ).per_ioc_type_scan_input_list.map((list) => list.ioc_type)}
            logSources={configureScanFormInputs.indices}
            getNextTriggerName={getNextTriggerName}
            updateTriggers={onTriggersChange}
          />
        );
      default:
        return null;
    }
  };

  const onPreviousClick = () => {
    setCurrentStep(ConfigureThreatIntelScanStep.SelectLogSources);
  };

  const onNextClick = () => {
    setCurrentStep(ConfigureThreatIntelScanStep.SetupAlertTriggers);
  };

  const onSubmit = async () => {
    setConfigureInProgress(true);
    const res = await threatIntelService.createThreatIntelMonitor(
      configFormModelToMonitorPayload(configureScanFormInputs)
    );

    if (res.ok) {
      history.push({
        pathname: ROUTES.THREAT_INTEL_OVERVIEW,
      });
    } else {
      errorNotificationToast(notifications, 'configure', 'scan', res.error);
    }

    setConfigureInProgress(false);
  };

  return (
    <>
      <EuiFlexGroup>
        <EuiFlexItem grow={false}>
          <EuiSteps
            steps={[
              {
                title: 'Select log sources',
                status:
                  currentStep === ConfigureThreatIntelScanStep.SetupAlertTriggers
                    ? 'complete'
                    : undefined,
                children: <></>,
              },
              {
                title: 'Set up alert triggers',
                status:
                  currentStep === ConfigureThreatIntelScanStep.SetupAlertTriggers
                    ? undefined
                    : 'disabled',
                children: <></>,
              },
            ]}
          />
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiTitle>
            <h1>{isEdit ? 'Edit' : 'Set up'} real-time scan</h1>
          </EuiTitle>
          <EuiSpacer />
          {getStepConent(currentStep)}
        </EuiFlexItem>
      </EuiFlexGroup>
      <EuiSpacer />
      <EuiFlexGroup alignItems={'center'} justifyContent={'flexEnd'}>
        <EuiFlexItem grow={false}>
          <EuiButtonEmpty href={`${PLUGIN_NAME}#${ROUTES.THREAT_INTEL_OVERVIEW}`}>
            Cancel
          </EuiButtonEmpty>
        </EuiFlexItem>

        {currentStep === ConfigureThreatIntelScanStep.SelectLogSources && (
          <EuiFlexItem grow={false}>
            <EuiButton fill={true} onClick={onNextClick} disabled={!stepDataValid[currentStep]}>
              Next
            </EuiButton>
          </EuiFlexItem>
        )}

        {currentStep === ConfigureThreatIntelScanStep.SetupAlertTriggers && (
          <>
            <EuiFlexItem grow={false}>
              <EuiButton disabled={configureInProgress} onClick={onPreviousClick}>
                Back
              </EuiButton>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiButton
                disabled={configureInProgress || !stepDataValid[currentStep]}
                isLoading={configureInProgress}
                fill={true}
                onClick={onSubmit}
              >
                Save and start monitoring
              </EuiButton>
            </EuiFlexItem>
          </>
        )}
      </EuiFlexGroup>
    </>
  );
};
