/*
 * Copyright Wazuh Inc.
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {
  EuiSmallButton,
  EuiComboBoxOptionOption,
  EuiFlexGroup,
  EuiFlexItem,
  EuiPanel,
  EuiSpacer,
  EuiTitle,
  EuiCompressedComboBox,
  EuiCompressedFormRow,
  EuiText,
} from '@elastic/eui';
import { PeriodSchedule } from '../../../../../models/interfaces';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import DetectorBasicDetailsForm from '../../../CreateDetector/components/DefineDetector/components/DetectorDetails';
import DetectorDataSource from '../../../CreateDetector/components/DefineDetector/components/DetectorDataSource';
import { FieldMappingService, IndexService, SecurityAnalyticsContext } from '../../../../services';
import { DetectorSchedule } from '../../../CreateDetector/components/DefineDetector/components/DetectorSchedule/DetectorSchedule';
import { DetectorHit, SearchDetectorsResponse } from '../../../../../server/models/interfaces';
import { BREADCRUMBS, EMPTY_DEFAULT_DETECTOR, ROUTES } from '../../../../utils/constants';
import { ServerResponse } from '../../../../../server/models/types';
import { NotificationsStart } from 'opensearch-dashboards/public';
import {
  errorNotificationToast,
  getIntegrationOptionsBySpace,
  setBreadcrumbs,
  successNotificationToast,
} from '../../../../utils/helpers';
import { FieldMapping, Detector } from '../../../../../types';
import { ThreatIntelligence } from '../../../CreateDetector/components/DefineDetector/components/ThreatIntelligence/ThreatIntelligence';
import { PageHeader } from '../../../../components/PageHeader/PageHeader';
import { dataSourceInfo } from '../../../../services/utils/constants';
import { SpaceSelector } from '../../../../components/SpaceSelector/SpaceSelector';
import { SpaceTypes } from '../../../../../common/constants';
import { getLogTypeLabel } from '../../../LogTypes/utils/helpers';
import { FormFieldHeader } from '../../../../components/FormFieldHeader/FormFieldHeader';
import {
  CreateDetectorRulesState,
  DetectionRules,
} from '../../../CreateDetector/components/DefineDetector/components/DetectionRules/DetectionRules';
import {
  RuleItem,
  RuleItemInfo,
} from '../../../CreateDetector/components/DefineDetector/components/DetectionRules/types/interfaces';
import { DataStore } from '../../../../store/DataStore';
import ConfigureFieldMapping from '../../../CreateDetector/components/ConfigureFieldMapping';

export interface WazuhUpdateDetectorBasicDetailsProps
  extends RouteComponentProps<any, any, { detectorHit: DetectorHit }> {
  notifications: NotificationsStart;
}

export const WazuhUpdateDetectorBasicDetails: React.FC<WazuhUpdateDetectorBasicDetailsProps> = (
  props
) => {
  const saContext = useContext(SecurityAnalyticsContext);
  const [detector, setDetector] = useState<Detector>(
    (props.location.state?.detectorHit?._source || EMPTY_DEFAULT_DETECTOR) as Detector
  );
  const [fieldMappings, setFieldMappings] = useState<FieldMapping[]>();
  const { name, inputs } = detector;
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const description = inputs[0].detector_input.description;
  const detectorId = props.location.pathname.replace(`${ROUTES.EDIT_DETECTOR_DETAILS}/`, '');

  const [threatIntelEnabledInitially, setThreatIntelEnabledInitially] = useState(false);

  const [selectedSpace, setSelectedSpace] = useState<string>(SpaceTypes.STANDARD.value);
  const [integrationOptions, setIntegrationOptions] = useState<{ value: string; label: string }[]>(
    []
  );
  const [loadingIntegrations, setLoadingIntegrations] = useState(false);
  const [integrationTouched, setIntegrationTouched] = useState(false);

  const [rulesState, setRulesState] = useState<CreateDetectorRulesState>({
    page: { index: 0 },
    allRules: [],
  });
  const [loadingRules, setLoadingRules] = useState(false);

  const getSpaceForDetectorType = async (detectorType: string): Promise<string> => {
    const standardOptions = await getIntegrationOptionsBySpace(SpaceTypes.STANDARD.value);
    if (standardOptions.some((opt) => opt.value === detectorType)) {
      return SpaceTypes.STANDARD.value;
    }
    return SpaceTypes.CUSTOM.value;
  };

  const loadIntegrationOptions = useCallback(async (space: string) => {
    setLoadingIntegrations(true);
    const options = await getIntegrationOptionsBySpace(space);
    setIntegrationOptions(options);
    setLoadingIntegrations(false);
  }, []);

  const loadRules = useCallback(
    async (
      detectorType: string,
      space: string,
      enabledRuleIds?: string[]
    ): Promise<RuleItemInfo[]> => {
      if (!detectorType) {
        setRulesState({ page: { index: 0 }, allRules: [] });
        return [];
      }
      setLoadingRules(true);
      const allRules = await DataStore.rules.getAllRules({
        'rule.category': [detectorType.toLowerCase()],
      });
      const spaceRules = allRules.filter((rule) => rule.space === space);
      const ruleItems: RuleItemInfo[] = spaceRules.map((rule) => ({
        ...rule,
        enabled: enabledRuleIds !== undefined ? enabledRuleIds.includes(rule._id) : true,
      }));
      setRulesState({ page: { index: 0 }, allRules: ruleItems });
      setLoadingRules(false);
      return ruleItems;
    },
    []
  );

  const getEnabledRuleIds = (det: Detector): string[] => {
    const prePackaged = det.inputs[0].detector_input.pre_packaged_rules.map((r) => r.id);
    const custom = det.inputs[0].detector_input.custom_rules.map((r) => r.id);
    return prePackaged.concat(custom);
  };

  const buildDetectorWithRules = useCallback(
    (det: Detector, rules: RuleItemInfo[]): Detector => ({
      ...det,
      inputs: [
        {
          detector_input: {
            ...det.inputs[0].detector_input,
            pre_packaged_rules: rules
              .filter((r) => r.enabled && r.prePackaged)
              .map((r) => ({ id: r._id })),
            custom_rules: rules
              .filter((r) => r.enabled && !r.prePackaged)
              .map((r) => ({ id: r._id })),
          },
        },
        ...det.inputs.slice(1),
      ],
    }),
    []
  );

  useEffect(() => {
    setThreatIntelEnabledInitially(detector.threat_intel_enabled);
  }, []);

  useEffect(() => {
    const getDetector = async () => {
      const response = (await saContext?.services.detectorsService.getDetectors()) as ServerResponse<
        SearchDetectorsResponse
      >;
      if (response.ok) {
        const detectorHit = response.response.hits.hits.find(
          (detectorHit) => detectorHit._id === detectorId
        ) as DetectorHit;
        const loadedDetector = detectorHit._source as Detector;
        setDetector(loadedDetector);

        setBreadcrumbs([
          BREADCRUMBS.DETECTION,
          BREADCRUMBS.DETECTORS,
          BREADCRUMBS.DETECTORS_DETAILS(detectorHit._source.name, detectorHit._id),
          BREADCRUMBS.EDIT_DETECTOR_DETAILS,
        ]);
        props.history.replace({
          pathname: `${ROUTES.EDIT_DETECTOR_DETAILS}/${detectorId}`,
          state: {
            detectorHit: {
              ...detectorHit,
              _source: { ...detectorHit._source, ...detectorHit },
            },
          },
        });

        const space = await getSpaceForDetectorType(loadedDetector.detector_type);
        setSelectedSpace(space);
        await loadIntegrationOptions(space);
        await loadRules(loadedDetector.detector_type, space, getEnabledRuleIds(loadedDetector));
      } else {
        errorNotificationToast(props.notifications, 'retrieve', 'detector', response.error);
      }
    };

    const execute = async () => {
      setLoading(true);
      await getDetector();
      setLoading(false);
    };

    if (!detector.id?.length) {
      execute().catch((e) => {
        errorNotificationToast(props.notifications, 'retrieve', 'detector', e);
      });
    } else {
      getSpaceForDetectorType(detector.detector_type).then(async (space) => {
        setSelectedSpace(space);
        await loadIntegrationOptions(space);
        await loadRules(detector.detector_type, space, getEnabledRuleIds(detector));
      });
    }
  }, [saContext?.services]);

  const updateDetectorState = useCallback(
    (det: Detector) => {
      setDetector(det);
    },
    [setDetector]
  );

  const onSpaceChange = useCallback(
    async (space: string) => {
      setSelectedSpace(space);
      const updatedDetector = {
        ...detector,
        detector_type: '',
        inputs: [
          {
            detector_input: {
              ...detector.inputs[0].detector_input,
              pre_packaged_rules: [],
              custom_rules: [],
            },
          },
          ...detector.inputs.slice(1),
        ],
      };
      updateDetectorState(updatedDetector);
      setRulesState({ page: { index: 0 }, allRules: [] });
      await loadIntegrationOptions(space);
    },
    [detector, updateDetectorState, loadIntegrationOptions]
  );

  const onIntegrationChange = useCallback(
    async (detectorType: string) => {
      setIntegrationTouched(true);
      const baseDetector = { ...detector, detector_type: detectorType };
      const loadedRules = await loadRules(detectorType, selectedSpace);
      updateDetectorState(buildDetectorWithRules(baseDetector, loadedRules));
    },
    [detector, selectedSpace, updateDetectorState, loadRules, buildDetectorWithRules]
  );

  const onRuleToggle = useCallback(
    (changedItem: RuleItem, isActive: boolean) => {
      const newRules = rulesState.allRules.map((r) =>
        r._id === changedItem.id ? { ...r, enabled: isActive } : r
      );
      setRulesState((prev) => ({ ...prev, allRules: newRules }));
      updateDetectorState(buildDetectorWithRules(detector, newRules));
    },
    [rulesState, detector, updateDetectorState, buildDetectorWithRules]
  );

  const onAllRulesToggle = useCallback(
    (enabled: boolean) => {
      const newRules = rulesState.allRules.map((r) => ({ ...r, enabled }));
      setRulesState((prev) => ({ ...prev, allRules: newRules }));
      updateDetectorState(buildDetectorWithRules(detector, newRules));
    },
    [rulesState, detector, updateDetectorState, buildDetectorWithRules]
  );

  const onPageChange = useCallback((page: { index: number; size: number }) => {
    setRulesState((prev) => ({ ...prev, page: { index: page.index } }));
  }, []);

  const onDetectorNameChange = useCallback(
    (detectorName: string) => {
      updateDetectorState({ ...detector, name: detectorName });
    },
    [detector, updateDetectorState]
  );

  const onDetectorInputDescriptionChange = useCallback(
    (description: string) => {
      const { inputs } = detector;
      updateDetectorState({
        ...detector,
        inputs: [
          {
            detector_input: {
              ...inputs[0].detector_input,
              description: description,
            },
          },
          ...inputs.slice(1),
        ],
      });
    },
    [detector, updateDetectorState]
  );

  const onDetectorInputIndicesChange = useCallback(
    (selectedOptions: EuiComboBoxOptionOption<string>[]) => {
      const detectorIndices = selectedOptions.map((selectedOption) => selectedOption.label);
      const { inputs } = detector;
      updateDetectorState({
        ...detector,
        inputs: [
          {
            detector_input: {
              ...inputs[0].detector_input,
              indices: detectorIndices,
            },
          },
          ...inputs.slice(1),
        ],
      });
    },
    [detector, updateDetectorState]
  );

  const onThreatIntelFeedToggle = useCallback(
    (enabled: boolean) => {
      updateDetectorState({ ...detector, threat_intel_enabled: enabled });
    },
    [detector, updateDetectorState]
  );

  const onDetectorScheduleChange = useCallback(
    (schedule: PeriodSchedule) => {
      updateDetectorState({ ...detector, schedule });
    },
    [detector, updateDetectorState]
  );

  const replaceFieldMappings = useCallback(
    (mappings: FieldMapping[]) => {
      setFieldMappings(mappings);
    },
    [setFieldMappings]
  );

  const onCancel = useCallback(() => {
    props.history.replace({
      pathname: `${ROUTES.DETECTOR_DETAILS}/${detectorId}`,
      state: props.location.state,
    });
  }, []);

  const onSave = useCallback(async () => {
    if (!detector.detector_type) {
      setIntegrationTouched(true);
      return;
    }

    setSubmitting(true);

    const updateDetector = async () => {
      const detectorHit = props.location.state.detectorHit;
      const updateDetectorRes = await saContext?.services.detectorsService?.updateDetector(
        detectorHit._id,
        detector
      );

      if (updateDetectorRes?.ok) {
        successNotificationToast(props.notifications, 'updated', 'detector');
      } else {
        errorNotificationToast(props.notifications, 'update', 'detector', updateDetectorRes?.error);
      }

      setSubmitting(false);

      props.history.replace({
        pathname: `${ROUTES.DETECTOR_DETAILS}/${detectorId}`,
        state: {
          detectorHit: {
            ...detectorHit,
            _source: { ...detectorHit._source, ...detector },
          },
        },
      });
    };

    if (fieldMappings?.length) {
      const createMappingsResponse = await saContext?.services.fieldMappingService?.createMappings(
        detector.inputs[0].detector_input.indices[0],
        detector.detector_type.toLowerCase(),
        fieldMappings
      );

      if (!createMappingsResponse?.ok) {
        errorNotificationToast(
          props.notifications,
          'update',
          'field mappings',
          createMappingsResponse?.error
        );
      } else {
        await updateDetector();
      }
    } else {
      await updateDetector();
    }
  }, [detector, fieldMappings]);

  const integrationIsInvalid = integrationTouched && !detector.detector_type;

  return (
    <>
      <PageHeader>
        <EuiTitle size={'m'}>
          <h3>Edit detector details</h3>
        </EuiTitle>
        <EuiSpacer size="xl" />
      </PageHeader>
      <EuiPanel>
        <DetectorBasicDetailsForm
          isEdit={true}
          detectorName={name}
          detectorDescription={description}
          onDetectorNameChange={onDetectorNameChange}
          onDetectorInputDescriptionChange={onDetectorInputDescriptionChange}
        />
        <EuiSpacer size="l" />

        <DetectorDataSource
          isEdit={true}
          detector_type={detector.detector_type}
          notifications={props.notifications}
          indexService={saContext?.services?.indexService as IndexService}
          detectorIndices={inputs[0].detector_input.indices}
          fieldMappingService={saContext?.services?.fieldMappingService as FieldMappingService}
          dataSource={dataSourceInfo.activeDataSource}
          onDetectorInputIndicesChange={onDetectorInputIndicesChange}
        />
        <EuiSpacer size={'l'} />

        <EuiFlexGroup alignItems="center" gutterSize="s">
          <EuiFlexItem grow={false}>
            <EuiText size="s">
              <strong>Space</strong>
            </EuiText>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <SpaceSelector
              selectedSpace={selectedSpace}
              onSpaceChange={onSpaceChange}
              allowedSpaces={[SpaceTypes.STANDARD.value, SpaceTypes.CUSTOM.value]}
            />
          </EuiFlexItem>
        </EuiFlexGroup>

        <EuiSpacer size="m" />

        <EuiCompressedFormRow
          label={
            <div>
              <FormFieldHeader headerTitle="Integration" />
              <EuiSpacer size="s" />
            </div>
          }
          fullWidth
          isInvalid={integrationIsInvalid}
          error={integrationIsInvalid ? 'Select an integration.' : undefined}
        >
          <EuiCompressedComboBox
            isInvalid={integrationIsInvalid}
            placeholder="Select integration"
            options={integrationOptions}
            singleSelection={{ asPlainText: true }}
            isLoading={loadingIntegrations}
            selectedOptions={
              detector.detector_type
                ? [
                    {
                      value: detector.detector_type,
                      label: getLogTypeLabel(detector.detector_type),
                    },
                  ]
                : []
            }
            onChange={(e) => onIntegrationChange(e[0]?.value || '')}
          />
        </EuiCompressedFormRow>

        <EuiSpacer size="m" />

        <DetectionRules
          detectorType={detector.detector_type}
          rulesState={rulesState}
          loading={loadingRules}
          onRuleToggle={onRuleToggle}
          onAllRulesToggle={onAllRulesToggle}
          onPageChange={onPageChange}
        />

        <EuiSpacer size="m" />

        <ConfigureFieldMapping
          {...props}
          isEdit={true}
          detector={detector}
          fieldMappingService={saContext?.services?.fieldMappingService as FieldMappingService}
          fieldMappings={fieldMappings || []}
          loading={loading}
          enabledRules={rulesState.allRules.filter((r) => r.enabled)}
          replaceFieldMappings={replaceFieldMappings}
        />

        <EuiSpacer size="l" />

        <ThreatIntelligence
          isEdit={true}
          threatIntelChecked={detector.threat_intel_enabled}
          onThreatIntelChange={onThreatIntelFeedToggle}
        />

        <EuiSpacer size="l" />

        <DetectorSchedule detector={detector} onDetectorScheduleChange={onDetectorScheduleChange} />
        <EuiSpacer size="l" />
      </EuiPanel>

      <EuiSpacer />

      <EuiFlexGroup justifyContent="flexEnd">
        <EuiFlexItem grow={false}>
          <EuiSmallButton onClick={onCancel} disabled={loading}>
            Cancel
          </EuiSmallButton>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiSmallButton
            onClick={onSave}
            fill={true}
            disabled={loading || submitting}
            isLoading={submitting}
            data-test-subj={'save-basic-details-edits'}
          >
            Save changes
          </EuiSmallButton>
        </EuiFlexItem>
      </EuiFlexGroup>
    </>
  );
};
