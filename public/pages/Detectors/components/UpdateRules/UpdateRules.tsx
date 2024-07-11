/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiSmallButton, EuiFlexGroup, EuiFlexItem, EuiSpacer, EuiTitle } from '@elastic/eui';
import {
  DetectorHit,
  SearchDetectorsResponse,
  UpdateDetectorResponse,
} from '../../../../../server/models/interfaces';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { RuleItem } from '../../../CreateDetector/components/DefineDetector/components/DetectionRules/types/interfaces';
import { DetectionRulesTable } from '../../../CreateDetector/components/DefineDetector/components/DetectionRules/DetectionRulesTable';
import { BREADCRUMBS, EMPTY_DEFAULT_DETECTOR, ROUTES } from '../../../../utils/constants';
import { SecurityAnalyticsContext } from '../../../../services';
import { ServerResponse } from '../../../../../server/models/types';
import { NotificationsStart } from 'opensearch-dashboards/public';
import { CoreServicesContext } from '../../../../components/core_services';
import { errorNotificationToast, successNotificationToast } from '../../../../utils/helpers';
import { RuleTableItem } from '../../../Rules/utils/helpers';
import { RuleViewerFlyout } from '../../../Rules/components/RuleViewerFlyout/RuleViewerFlyout';
import { ContentPanel } from '../../../../components/ContentPanel';
import { DataStore } from '../../../../store/DataStore';
import ReviewFieldMappings from '../ReviewFieldMappings/ReviewFieldMappings';
import { FieldMapping, Detector } from '../../../../../types';

export interface UpdateDetectorRulesProps
  extends RouteComponentProps<
    any,
    any,
    { detectorHit: DetectorHit; enabledRules?: RuleItem[]; allRules?: RuleItem[] }
  > {
  notifications: NotificationsStart;
}

export const UpdateDetectorRules: React.FC<UpdateDetectorRulesProps> = (props) => {
  const saContext = useContext(SecurityAnalyticsContext);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [detector, setDetector] = useState<Detector>(EMPTY_DEFAULT_DETECTOR as Detector);
  const [customRuleItems, setCustomRuleItems] = useState<RuleItem[]>([]);
  const [prePackagedRuleItems, setPrePackagedRuleItems] = useState<RuleItem[]>([]);
  const detectorId = props.location.pathname.replace(`${ROUTES.EDIT_DETECTOR_RULES}/`, '');
  const [flyoutData, setFlyoutData] = useState<RuleTableItem | null>(null);
  const [fieldMappings, setFieldMappings] = useState<FieldMapping[]>();
  const [fieldMappingsIsVisible, setFieldMappingsIsVisible] = useState(false);
  const [ruleQueryFields, setRuleQueryFields] = useState<Set<string>>();

  const context = useContext(CoreServicesContext);

  useEffect(() => {
    const getDetector = async () => {
      setLoading(true);
      const response = (await saContext?.services.detectorsService.getDetectors()) as ServerResponse<
        SearchDetectorsResponse
      >;
      if (response.ok) {
        const detectorHit = response.response.hits.hits.find(
          (detectorHit) => detectorHit._id === detectorId
        ) as DetectorHit;
        const newDetector = { ...detectorHit._source, id: detectorId } as Detector;
        setDetector(newDetector);

        context?.chrome.setBreadcrumbs([
          BREADCRUMBS.SECURITY_ANALYTICS,
          BREADCRUMBS.DETECTORS,
          BREADCRUMBS.DETECTORS_DETAILS(detectorHit._source.name, detectorHit._id),
          {
            text: 'Edit detector rules',
          },
        ]);
        await getRules(newDetector);
      } else {
        errorNotificationToast(props.notifications, 'retrieve', 'detector', response.error);
      }
      setLoading(false);
    };

    const getRules = async (detector: Detector) => {
      let enabledRuleIds = detector.inputs[0].detector_input.pre_packaged_rules.map(
        (rule) => rule.id
      );
      const enabledCustomRuleIds = detector.inputs[0].detector_input.custom_rules.map(
        (rule) => rule.id
      );
      enabledRuleIds = enabledRuleIds.concat(enabledCustomRuleIds);

      const allRules = await DataStore.rules.getAllRules({
        'rule.category': [detector.detector_type.toLowerCase()],
      });

      const prePackagedRules = allRules?.filter((rule) => rule.prePackaged);
      const prePackagedRuleItems = prePackagedRules?.map((rule) => ({
        name: rule._source.title,
        id: rule._id,
        severity: rule._source.level,
        logType: rule._source.category,
        library: 'Standard',
        description: rule._source.description,
        active: enabledRuleIds.includes(rule._id),
        ruleInfo: rule,
      }));
      setPrePackagedRuleItems(prePackagedRuleItems || []);

      const customRules = allRules?.filter((rule) => !rule.prePackaged);
      const customRuleItems = customRules?.map((rule) => ({
        name: rule._source.title,
        id: rule._id,
        severity: rule._source.level,
        logType: rule._source.category,
        library: 'Custom',
        description: rule._source.description,
        active: enabledRuleIds.includes(rule._id),
        ruleInfo: rule,
      }));
      setCustomRuleItems(customRuleItems || []);
    };

    const execute = async () => {
      if (detectorId.length > 0) await getDetector();
    };

    execute().catch((e) => {
      errorNotificationToast(props.notifications, 'retrieve', 'detector and rules', e);
    });
  }, [saContext?.services, detectorId]);

  const onToggle = async (changedItem: RuleItem, isActive: boolean) => {
    setFieldMappingsIsVisible(true);
    switch (changedItem.library) {
      case 'Custom':
        const updatedCustomRules: RuleItem[] = customRuleItems.map((rule) =>
          rule.id === changedItem.id ? { ...rule, active: isActive } : rule
        );
        setCustomRuleItems(updatedCustomRules);
        const withCustomRulesUpdated = prePackagedRuleItems
          .concat(updatedCustomRules)
          .filter((rule) => rule.active);
        await getRuleFieldsForEnabledRules(withCustomRulesUpdated);
        break;
      case 'Standard':
        const updatedPrePackgedRules: RuleItem[] = prePackagedRuleItems.map((rule) =>
          rule.id === changedItem.id ? { ...rule, active: isActive } : rule
        );
        setPrePackagedRuleItems(updatedPrePackgedRules);
        const withPrePackagedRulesUpdated = updatedPrePackgedRules
          .concat(customRuleItems)
          .filter((rule) => rule.active);
        await getRuleFieldsForEnabledRules(withPrePackagedRulesUpdated);
        break;
      default:
        console.warn('Unsupported rule library detected.');
    }
  };

  const onAllRulesToggle = async (isActive: boolean) => {
    setFieldMappingsIsVisible(true);
    const customRules: RuleItem[] = customRuleItems.map((rule) => ({ ...rule, active: isActive }));
    const prePackagedRules: RuleItem[] = prePackagedRuleItems.map((rule) => ({
      ...rule,
      active: isActive,
    }));
    setCustomRuleItems(customRules);
    setPrePackagedRuleItems(prePackagedRules);

    const enabledRules = prePackagedRules.concat(customRules);
    await getRuleFieldsForEnabledRules(enabledRules);
  };

  const onCancel = useCallback(() => {
    props.history.replace({
      pathname: `${ROUTES.DETECTOR_DETAILS}/${detectorId}`,
      state: props.location.state,
    });
  }, []);

  const onSave = async () => {
    setSubmitting(true);

    const updateDetector = async () => {
      const newDetector = { ...detector };
      newDetector.inputs[0].detector_input.custom_rules = customRuleItems
        .filter((rule) => rule.active)
        .map((rule) => ({ id: rule.id }));
      newDetector.inputs[0].detector_input.pre_packaged_rules = prePackagedRuleItems
        .filter((rule) => rule.active)
        .map((rule) => ({ id: rule.id }));

      const updateDetectorRes = (await saContext?.services?.detectorsService?.updateDetector(
        detectorId,
        newDetector
      )) as ServerResponse<UpdateDetectorResponse>;

      if (!updateDetectorRes.ok) {
        errorNotificationToast(props.notifications, 'update', 'detector', updateDetectorRes.error);
      } else {
        successNotificationToast(props.notifications, 'updated', 'detector');
      }

      setSubmitting(false);
      props.history.replace({
        pathname: `${ROUTES.DETECTOR_DETAILS}/${detectorId}`,
      });
    };

    try {
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
    } catch (e: any) {
      errorNotificationToast(props.notifications, 'update', 'detector', e);
    }
    setSubmitting(false);
  };

  const ruleItems = prePackagedRuleItems.concat(customRuleItems);

  const onRuleDetails = (ruleItem: RuleItem) => {
    setFlyoutData(() => ({
      title: ruleItem.name,
      level: ruleItem.severity,
      category: ruleItem.logType,
      description: ruleItem.description,
      source: ruleItem.library,
      ruleInfo: ruleItem.ruleInfo,
      ruleId: ruleItem.id,
    }));
  };

  const updateFieldMappingsState = useCallback(
    (mapping: FieldMapping[]) => {
      setFieldMappings(mapping);
    },
    [setFieldMappings]
  );

  const onFieldMappingChange = useCallback(
    (fields: FieldMapping[]) => {
      const updatedFields = [...fields];
      updateFieldMappingsState(updatedFields);
    },
    [fieldMappings, updateFieldMappingsState]
  );

  const getRuleFieldsForEnabledRules = useCallback(
    async (enabledRules) => {
      const ruleFieldsForEnabledRules = new Set<string>();
      enabledRules.forEach((rule: RuleItem) => {
        const fieldNames = rule.ruleInfo._source.query_field_names;
        fieldNames.forEach((fieldname: { value: string }) => {
          ruleFieldsForEnabledRules.add(fieldname.value);
        });
      });

      setRuleQueryFields(ruleFieldsForEnabledRules);
    },
    [DataStore.rules.getAllRules, setRuleQueryFields]
  );

  return (
    <div>
      {flyoutData ? (
        <RuleViewerFlyout
          hideFlyout={() => setFlyoutData(() => null)}
          history={null as any}
          ruleTableItem={flyoutData}
        />
      ) : null}
      <EuiTitle size={'m'}>
        <h3>Edit detector rules</h3>
      </EuiTitle>
      <EuiSpacer size="xl" />

      <ContentPanel
        title={`Detection rules (${
          prePackagedRuleItems.concat(customRuleItems).filter((item) => item.active).length
        })`}
      >
        <DetectionRulesTable
          loading={loading}
          ruleItems={ruleItems}
          onRuleActivationToggle={onToggle}
          onAllRulesToggled={onAllRulesToggle}
          onRuleDetails={onRuleDetails}
        />

        <EuiSpacer size="xl" />

        {fieldMappingsIsVisible ? (
          <ReviewFieldMappings
            {...props}
            ruleQueryFields={ruleQueryFields}
            detector={detector}
            fieldMappingService={saContext?.services.fieldMappingService}
            onFieldMappingChange={onFieldMappingChange}
          />
        ) : null}

        <EuiSpacer size="xl" />

        <EuiFlexGroup justifyContent="flexEnd">
          <EuiFlexItem grow={false}>
            <EuiSmallButton disabled={submitting} onClick={onCancel}>
              Cancel
            </EuiSmallButton>
          </EuiFlexItem>

          <EuiFlexItem grow={false}>
            <EuiSmallButton
              disabled={loading}
              fill={true}
              isLoading={submitting}
              onClick={onSave}
              data-test-subj={'save-detector-rules-edits'}
            >
              Save changes
            </EuiSmallButton>
          </EuiFlexItem>
        </EuiFlexGroup>
      </ContentPanel>
    </div>
  );
};
