/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useContext, useEffect, useState } from 'react';
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
} from '../../../../../types';
import { SetupThreatIntelAlertTriggers } from '../../components/SetupThreatIntelAlertTriggers/SetupThreatIntelAlertTriggers';
import { NotificationsService } from '../../../../services';
import { getEmptyThreatIntelAlertTrigger } from '../../utils/helpers';
import { RouteComponentProps } from 'react-router-dom';
import { ConfigureThreatIntelScanStep } from '../../utils/constants';

export interface ThreatIntelScanConfigFormProps
  extends RouteComponentProps<
    any,
    any,
    { scanConfig?: ThreatIntelScanConfig; step?: ConfigureThreatIntelScanStep }
  > {
  notificationsService: NotificationsService;
}

export const ThreatIntelScanConfigForm: React.FC<ThreatIntelScanConfigFormProps> = ({
  notificationsService,
  location,
}) => {
  const isEdit = !!location.state?.scanConfig?.logSources?.length;
  const context = useContext(CoreServicesContext);
  const [currentStep, setCurrentStep] = useState(
    location.state?.step ?? ConfigureThreatIntelScanStep.SelectLogSources
  );
  const [configureInProgress, setConfigureInProgress] = useState(false);
  const [stepDataValid, setStepDataValid] = useState({
    [ConfigureThreatIntelScanStep.SelectLogSources]: true,
    [ConfigureThreatIntelScanStep.SetupAlertTriggers]: false,
  });
  const [configureScanPayload, setConfigureScanPayload] = useState<ThreatIntelScanConfig>(() => {
    return {
      isRunning: location.state?.scanConfig?.isRunning ?? false,
      logSources: location.state?.scanConfig?.logSources ?? [],
      triggers: !!location.state?.scanConfig?.triggers.length
        ? location.state?.scanConfig?.triggers
        : [getEmptyThreatIntelAlertTrigger()],
    };
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

  const onSourcesChange = (logSources: ThreatIntelLogSource[]): void => {
    setConfigureScanPayload({
      ...configureScanPayload,
      logSources,
    });
  };

  const onTriggersChange = (triggers: ThreatIntelAlertTrigger[]) => {
    setConfigureScanPayload({
      ...configureScanPayload,
      triggers,
    });
  };

  const getStepConent = (step: ConfigureThreatIntelScanStep) => {
    switch (step) {
      case ConfigureThreatIntelScanStep.SelectLogSources:
        return (
          <SelectThreatIntelLogSources
            sources={configureScanPayload.logSources}
            updateSources={onSourcesChange}
          />
        );
      case ConfigureThreatIntelScanStep.SetupAlertTriggers:
        return (
          <SetupThreatIntelAlertTriggers
            alertTriggers={configureScanPayload.triggers}
            notificationsService={notificationsService}
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

  const onSubmit = () => {
    setConfigureInProgress(true);
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
