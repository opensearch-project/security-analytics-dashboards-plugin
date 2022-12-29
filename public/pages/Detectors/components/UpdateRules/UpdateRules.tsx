/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiButton, EuiFlexGroup, EuiFlexItem, EuiSpacer, EuiTitle } from '@elastic/eui';
import {
  DetectorHit,
  GetRulesResponse,
  SearchDetectorsResponse,
  UpdateDetectorResponse,
} from '../../../../../server/models/interfaces';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { RuleItem } from '../../../CreateDetector/components/DefineDetector/components/DetectionRules/types/interfaces';
import { Detector } from '../../../../../models/interfaces';
import { DetectionRulesTable } from '../../../CreateDetector/components/DefineDetector/components/DetectionRules/DetectionRulesTable';
import { EMPTY_DEFAULT_DETECTOR, ROUTES } from '../../../../utils/constants';
import { ServicesContext } from '../../../../services';
import { ServerResponse } from '../../../../../server/models/types';
import { NotificationsStart } from 'opensearch-dashboards/public';
import { errorNotificationToast, successNotificationToast } from '../../../../utils/helpers';
import { RuleTableItem } from '../../../Rules/utils/helpers';
import { RuleViewerFlyout } from '../../../Rules/components/RuleViewerFlyout/RuleViewerFlyout';

export interface UpdateDetectorRulesProps
  extends RouteComponentProps<
    any,
    any,
    { detectorHit: DetectorHit; enabledRules?: RuleItem[]; allRules?: RuleItem[] }
  > {
  notifications: NotificationsStart;
}

export const UpdateDetectorRules: React.FC<UpdateDetectorRulesProps> = (props) => {
  const services = useContext(ServicesContext);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [detector, setDetector] = useState<Detector>(EMPTY_DEFAULT_DETECTOR);
  const [customRuleItems, setCustomRuleItems] = useState<RuleItem[]>([]);
  const [prePackagedRuleItems, setPrePackagedRuleItems] = useState<RuleItem[]>([]);
  const detectorId = props.location.pathname.replace(`${ROUTES.EDIT_DETECTOR_RULES}/`, '');
  const [flyoutData, setFlyoutData] = useState<RuleTableItem | null>(null);

  useEffect(() => {
    const getDetector = async () => {
      setLoading(true);
      const response = (await services?.detectorsService.getDetectors()) as ServerResponse<
        SearchDetectorsResponse
      >;
      if (response.ok) {
        const detectorHit = response.response.hits.hits.find(
          (detectorHit) => detectorHit._id === detectorId
        ) as DetectorHit;
        const newDetector = { ...detectorHit._source, id: detectorId };
        setDetector(newDetector);
        await getRules(newDetector);
      } else {
        errorNotificationToast(props.notifications, 'retrieve', 'detector', response.error);
      }
      setLoading(false);
    };

    const getRules = async (detector: Detector) => {
      const prePackagedResponse = (await services?.ruleService.getRules(true, {
        from: 0,
        size: 5000,
        query: {
          nested: {
            path: 'rule',
            query: {
              bool: {
                must: [{ match: { 'rule.category': `${detector.detector_type.toLowerCase()}` } }],
              },
            },
          },
        },
      })) as ServerResponse<GetRulesResponse>;
      if (prePackagedResponse.ok) {
        const ruleInfos = prePackagedResponse.response.hits.hits;
        const enabledRuleIds = detector.inputs[0].detector_input.pre_packaged_rules.map(
          (rule) => rule.id
        );
        const ruleItems = ruleInfos.map((rule) => ({
          name: rule._source.title,
          id: rule._id,
          severity: rule._source.level,
          logType: rule._source.category,
          library: 'Sigma',
          description: rule._source.description,
          active: enabledRuleIds.includes(rule._id),
          ruleInfo: rule,
        }));
        setPrePackagedRuleItems(ruleItems);
      } else {
        errorNotificationToast(
          props.notifications,
          'retrieve',
          'pre-packaged rules',
          prePackagedResponse.error
        );
      }

      const customResponse = (await services?.ruleService.getRules(false, {
        from: 0,
        size: 5000,
        query: {
          nested: {
            path: 'rule',
            query: {
              bool: {
                must: [{ match: { 'rule.category': `${detector.detector_type.toLowerCase()}` } }],
              },
            },
          },
        },
      })) as ServerResponse<GetRulesResponse>;
      if (customResponse.ok) {
        const ruleInfos = customResponse.response.hits.hits;
        const enabledRuleIds = detector.inputs[0].detector_input.custom_rules.map(
          (rule) => rule.id
        );
        const ruleItems = ruleInfos.map((rule) => ({
          name: rule._source.title,
          id: rule._id,
          severity: rule._source.level,
          logType: rule._source.category,
          library: 'Custom',
          description: rule._source.description,
          active: enabledRuleIds.includes(rule._id),
          ruleInfo: rule,
        }));
        setCustomRuleItems(ruleItems);
      } else {
        errorNotificationToast(
          props.notifications,
          'retrieve',
          'custom rules',
          customResponse.error
        );
      }
    };

    const execute = async () => {
      if (detectorId.length > 0) await getDetector();
    };

    execute().catch((e) => {
      errorNotificationToast(props.notifications, 'retrieve', 'detector and rules', e);
    });
  }, [services, detectorId]);

  const onToggle = (changedItem: RuleItem, isActive: boolean) => {
    switch (changedItem.library) {
      case 'Custom':
        setCustomRuleItems(
          customRuleItems.map((rule) =>
            rule.id === changedItem.id ? { ...rule, active: isActive } : rule
          )
        );
        break;
      case 'Sigma':
        setPrePackagedRuleItems(
          prePackagedRuleItems.map((rule) =>
            rule.id === changedItem.id ? { ...rule, active: isActive } : rule
          )
        );
        break;
      default:
        console.warn('Unsupported rule library detected.');
    }
  };

  const onAllRulesToggle = (isActive: boolean) => {
    setCustomRuleItems(customRuleItems.map((rule) => ({ ...rule, active: isActive })));
    setPrePackagedRuleItems(prePackagedRuleItems.map((rule) => ({ ...rule, active: isActive })));
  };

  const onCancel = useCallback(() => {
    props.history.replace({
      pathname: `${ROUTES.DETECTOR_DETAILS}/${detectorId}`,
      state: props.location.state,
    });
  }, []);

  const onSave = async () => {
    setSubmitting(true);
    try {
      const newDetector = { ...detector };
      newDetector.inputs[0].detector_input.custom_rules = customRuleItems
        .filter((rule) => rule.active)
        .map((rule) => ({ id: rule.id }));
      newDetector.inputs[0].detector_input.pre_packaged_rules = prePackagedRuleItems
        .filter((rule) => rule.active)
        .map((rule) => ({ id: rule.id }));

      const updateDetectorRes = (await services?.detectorsService?.updateDetector(
        detectorId,
        newDetector
      )) as ServerResponse<UpdateDetectorResponse>;

      if (!updateDetectorRes.ok) {
        errorNotificationToast(props.notifications, 'update', 'detector', updateDetectorRes.error);
      } else {
        successNotificationToast(props.notifications, 'updated', 'detector');
      }

      props.history.replace({
        pathname: `${ROUTES.DETECTOR_DETAILS}/${detectorId}`,
      });
    } catch (e: any) {
      errorNotificationToast(props.notifications, 'update', 'detector', e);
    }
    setSubmitting(false);
  };

  const ruleItems = prePackagedRuleItems.concat(customRuleItems);

  const onRuleDetails = (ruleItem: RuleItem) => {
    console.log('onRuleDetails', ruleItem);
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
  return (
    <div>
      {flyoutData ? (
        <RuleViewerFlyout
          hideFlyout={() => setFlyoutData(() => null)}
          history={null as any}
          ruleTableItem={flyoutData}
          ruleService={null as any}
        />
      ) : null}
      <EuiTitle size={'m'}>
        <h3>Edit detector rules</h3>
      </EuiTitle>
      <EuiSpacer size="xl" />

      <DetectionRulesTable
        loading={loading}
        ruleItems={ruleItems}
        onRuleActivationToggle={onToggle}
        onAllRulesToggled={onAllRulesToggle}
        onRuleDetails={onRuleDetails}
      />

      <EuiSpacer size="xl" />

      <EuiFlexGroup justifyContent="flexEnd">
        <EuiFlexItem grow={false}>
          <EuiButton disabled={submitting} onClick={onCancel}>
            Cancel
          </EuiButton>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiButton
            disabled={loading}
            fill={true}
            isLoading={submitting}
            onClick={onSave}
            data-test-subj={'save-detector-rules-edits'}
          >
            Save changes
          </EuiButton>
        </EuiFlexItem>
      </EuiFlexGroup>
    </div>
  );
};
