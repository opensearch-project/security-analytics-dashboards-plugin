/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  EuiSmallButton,
  EuiButtonEmpty,
  EuiFlexGroup,
  EuiFlexItem,
  EuiSpacer,
  EuiSteps,
  EuiTitle,
} from '@elastic/eui';
import { BREADCRUMBS, PLUGIN_NAME, ROUTES } from '../../../../utils/constants';
import { SelectThreatIntelLogSources } from '../../components/SelectLogSourcesForm/SelectThreatIntelLogSourcesForm';
import {
  ThreatIntelScanConfig,
  ThreatIntelAlertTrigger,
  ThreatIntelLogSource,
  ThreatIntelScanConfigFormModel,
} from '../../../../../types';
import { ConfigureThreatIntelAlertTriggers } from '../../components/ConfigureThreatIntelAlertTriggers/ConfigureThreatIntelAlertTriggers';
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
import { errorNotificationToast, setBreadcrumbs } from '../../../../utils/helpers';
import { validateName } from '../../../../utils/validation';
import { PageHeader } from '../../../../components/PageHeader/PageHeader';

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

interface TriggerErrors {
  nameError?: string;
  notificationChannelError?: string;
}

interface FormErrors {
  logSourceError?: string;
  fieldAliasError?: string;

  scheduleError?: string;
  triggersErrors?: TriggerErrors[];
}

export const ThreatIntelScanConfigForm: React.FC<ThreatIntelScanConfigFormProps> = ({
  notificationsService,
  notifications,
  location,
  threatIntelService,
  history,
}) => {
  const isEdit = location.pathname.includes(ROUTES.THREAT_INTEL_EDIT_SCAN_CONFIG);
  const [scanId, setScanId] = useState('');
  const [currentStep, setCurrentStep] = useState(
    location.state?.step ?? ConfigureThreatIntelScanStep.SelectLogSources
  );
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [configureInProgress, setConfigureInProgress] = useState(false);
  const [stepDataValid, setStepDataValid] = useState({
    [ConfigureThreatIntelScanStep.SelectLogSources]: false,
    [ConfigureThreatIntelScanStep.SetupAlertTriggers]: false,
  });
  const threatIntelTriggerCounter = useRef(0);
  const getNextTriggerName = () => {
    threatIntelTriggerCounter.current++;
    return `Trigger ${threatIntelTriggerCounter.current}`;
  };

  const [configureScanFormInputs, setConfigureScanFormInputs] = useState<
    ThreatIntelScanConfigFormModel
  >(() => {
    if (location.state?.scanConfig) {
      setScanId(location.state.scanConfig.id);
      return deriveFormModelFromConfig(location.state.scanConfig);
    }

    return getEmptyScanConfigFormModel(getNextTriggerName());
  });

  useEffect(() => {
    updateStepValidity(formErrors);
  }, [formErrors]);

  useEffect(() => {
    setBreadcrumbs([
      BREADCRUMBS.THREAT_INTEL_OVERVIEW,
      isEdit
        ? BREADCRUMBS.THREAT_INTEL_EDIT_SCAN_CONFIG
        : BREADCRUMBS.THREAT_INTEL_SETUP_SCAN_CONFIG,
    ]);

    if (isEdit && !location.state?.scanConfig) {
      const getScanConfig = async () => {
        try {
          const res = await threatIntelService.getThreatIntelScanConfig();

          if (res.ok && res.response) {
            setScanId(res.response.id);
            setConfigureScanFormInputs(deriveFormModelFromConfig(res.response));
          } else if (
            res.ok ||
            res.error.includes('Configured indices are not found: [.opendistro-alerting-config]')
          ) {
            history.push({
              pathname: ROUTES.THREAT_INTEL_CREATE_SCAN_CONFIG,
            });
          }
        } catch (e: any) {
          console.log('failed to get scan config');
        }
      };

      getScanConfig();
    }
  }, [isEdit]);

  const updateFormErrors = (errors: FormErrors) => {
    const newErrors = {
      ...formErrors,
      ...errors,
    };
    setFormErrors(newErrors);
  };

  const validateLogSources = (logSources: ThreatIntelScanConfigFormModel['logSources']) => {
    if (logSources.length === 0) {
      return 'Select at least one index/alias';
    }
  };

  const validateFieldAliases = (logSources: ThreatIntelScanConfigFormModel['logSources']) => {
    const iocEnabled = logSources.every((logSource) => {
      return Object.values(logSource.iocConfigMap).some(
        (o) => o.enabled && o.fieldAliases.length > 0
      );
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

  const validateSchedule = (schedule: PeriodSchedule) => {
    return !schedule.period.interval || Number.isNaN(schedule.period.interval)
      ? 'Invalid schedule'
      : '';
  };

  const validateTriggers = (triggers: ThreatIntelAlertTrigger[]) => {
    const triggersErrors: TriggerErrors[] = [];
    triggers.forEach((t, idx) => {
      const errors: TriggerErrors = {};
      errors.nameError = validateName(t.name) ? '' : 'Invalid trigger name.';
      errors.notificationChannelError = t.actions.every((a) => !!a.destination_id)
        ? ''
        : 'Select a channel';
      triggersErrors.push(errors);
    });
    setFormErrors({
      ...formErrors,
      triggersErrors,
    });
  };

  const updateStepValidity = (errors: FormErrors) => {
    const stepOneDataValid =
      !errors.logSourceError && !errors.fieldAliasError && !errors.scheduleError;
    const stepTwoDataValid = !errors.triggersErrors?.some(
      (errors) => errors.nameError || errors.notificationChannelError
    );

    setStepDataValid({
      [ConfigureThreatIntelScanStep.SelectLogSources]: stepOneDataValid,
      [ConfigureThreatIntelScanStep.SetupAlertTriggers]: stepTwoDataValid,
    });
  };

  const updatePayload = (formModel: ThreatIntelScanConfigFormModel) => {
    setConfigureScanFormInputs(formModel);
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
    validateTriggers(triggers);
  };

  const onScheduleChange = (schedule: PeriodSchedule) => {
    updatePayload({
      ...configureScanFormInputs,
      schedule,
    });
    updateFormErrors({
      scheduleError: validateSchedule(schedule),
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
          <ConfigureThreatIntelAlertTriggers
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

    let res;
    if (isEdit) {
      res = await threatIntelService.updateThreatIntelMonitor(
        scanId,
        configFormModelToMonitorPayload(configureScanFormInputs)
      );
    } else {
      res = await threatIntelService.createThreatIntelMonitor(
        configFormModelToMonitorPayload(configureScanFormInputs)
      );
    }

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
          <PageHeader>
            <EuiTitle>
              <h1>{isEdit ? 'Edit' : 'Set up'} real-time scan</h1>
            </EuiTitle>
            <EuiSpacer />
          </PageHeader>
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
            <EuiSmallButton fill={true} onClick={onNextClick} disabled={!stepDataValid[currentStep]}>
              Next
            </EuiSmallButton>
          </EuiFlexItem>
        )}

        {currentStep === ConfigureThreatIntelScanStep.SetupAlertTriggers && (
          <>
            <EuiFlexItem grow={false}>
              <EuiSmallButton disabled={configureInProgress} onClick={onPreviousClick}>
                Back
              </EuiSmallButton>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiSmallButton
                disabled={configureInProgress || !stepDataValid[currentStep]}
                isLoading={configureInProgress}
                fill={true}
                onClick={onSubmit}
              >
                Save and start monitoring
              </EuiSmallButton>
            </EuiFlexItem>
          </>
        )}
      </EuiFlexGroup>
    </>
  );
};
