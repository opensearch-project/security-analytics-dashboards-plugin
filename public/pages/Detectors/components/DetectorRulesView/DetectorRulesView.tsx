/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { ContentPanel } from '../../../../components/ContentPanel';
import React, { useContext, useEffect, useState } from 'react';
import { EuiAccordion, EuiSmallButton, EuiSpacer, EuiText } from '@elastic/eui';
import { RuleItem } from '../../../CreateDetector/components/DefineDetector/components/DetectionRules/types/interfaces';
import { SecurityAnalyticsContext } from '../../../../services';
import { RuleInfo } from '../../../../../server/models/interfaces';
import { errorNotificationToast, translateToRuleItems } from '../../../../utils/helpers';
import { NotificationsStart } from 'opensearch-dashboards/public';
import { RulesTable } from '../../../Rules/components/RulesTable/RulesTable';
import { RuleTableItem } from '../../../Rules/utils/helpers';
import { RuleViewerFlyout } from '../../../Rules/components/RuleViewerFlyout/RuleViewerFlyout';
import { DataStore } from '../../../../store/DataStore';
import { Detector } from '../../../../../types';

export interface DetectorRulesViewProps {
  detector: Detector;
  rulesCanFold?: boolean;
  onEditClicked: (enabledRules: RuleItem[], allRuleItems: RuleItem[]) => void;
  notifications: NotificationsStart;
  isEditable: boolean;
}

const mapRuleItemToRuleTableItem = (ruleItem: RuleItem): RuleTableItem => {
  return {
    title: ruleItem.name,
    level: ruleItem.severity,
    category: ruleItem.logType,
    description: ruleItem.description,
    source: ruleItem.library,
    ruleId: ruleItem.id,
    ruleInfo: { ...ruleItem.ruleInfo, prePackaged: ruleItem.library === 'Standard' },
  };
};

export const DetectorRulesView: React.FC<DetectorRulesViewProps> = (props) => {
  const totalSelected = props.detector.inputs.reduce((sum, inputObj) => {
    return (
      sum +
      inputObj.detector_input.custom_rules.length +
      inputObj.detector_input.pre_packaged_rules.length
    );
  }, 0);

  const [flyoutData, setFlyoutData] = useState<RuleTableItem | null>(null);
  const [enabledRuleItems, setEnabledRuleItems] = useState<RuleItem[]>([]);
  const [allRuleItems, setAllRuleItems] = useState<RuleItem[]>([]);
  const [loading, setLoading] = useState(false);
  const actions = props.isEditable
    ? [
        <EuiSmallButton
          onClick={() => props.onEditClicked(enabledRuleItems, allRuleItems)}
          data-test-subj={'edit-detector-rules'}
        >
          Edit
        </EuiSmallButton>,
      ]
    : null;
  const saContext = useContext(SecurityAnalyticsContext);

  useEffect(() => {
    const updateRulesState = async () => {
      setLoading(true);
      const enabledPrePackagedRuleIds = new Set(
        props.detector.inputs[0].detector_input.pre_packaged_rules.map((ruleInfo) => ruleInfo.id)
      );
      const enabledCustomRuleIds = new Set(
        props.detector.inputs[0].detector_input.custom_rules.map((ruleInfo) => ruleInfo.id)
      );

      const allRules = await DataStore.rules.getAllRules({
        'rule.category': [props.detector.detector_type.toLowerCase()],
      });

      const prePackagedRules = allRules?.filter((rule) => rule.prePackaged);
      const customRules = allRules?.filter((rule) => !rule.prePackaged);

      const enabledPrePackagedRules = prePackagedRules?.filter((hit: RuleInfo) => {
        return enabledPrePackagedRuleIds.has(hit._id);
      });

      const enabledCustomRules = customRules?.filter((hit: RuleInfo) => {
        return enabledCustomRuleIds.has(hit._id);
      });

      const enabledRuleItems = translateToRuleItems(
        enabledPrePackagedRules || [],
        enabledCustomRules || [],
        props.detector.detector_type,
        () => true
      );
      const allRuleItems = translateToRuleItems(
        prePackagedRules || [],
        customRules || [],
        props.detector.detector_type,
        (ruleInfo) =>
          enabledPrePackagedRuleIds.has(ruleInfo._id) || enabledCustomRuleIds.has(ruleInfo._id)
      );
      setEnabledRuleItems(enabledRuleItems);
      setAllRuleItems(allRuleItems);
      setLoading(false);
    };

    updateRulesState().catch((e) => {
      errorNotificationToast(props.notifications, 'retrieve', 'rules', e);
    });
  }, [saContext?.services, props.detector]);

  const getDetectionRulesTitle = () => `View detection rules`;

  const onShowRuleDetails = (rule: RuleTableItem) => {
    setFlyoutData(() => rule);
  };

  return (
    <>
      {flyoutData ? (
        <RuleViewerFlyout
          hideFlyout={() => setFlyoutData(() => null)}
          history={null as any}
          ruleTableItem={flyoutData}
          notifications={props.notifications}
        />
      ) : null}
      {props.rulesCanFold ? (
        <EuiAccordion
          id={props.detector.name}
          title={getDetectionRulesTitle()}
          buttonContent={
            <EuiText size="m">
              <p>{getDetectionRulesTitle()}</p>
            </EuiText>
          }
        >
          <EuiSpacer size="l" />
          <RulesTable
            loading={loading}
            ruleItems={enabledRuleItems.map((i) => mapRuleItemToRuleTableItem(i))}
            showRuleDetails={onShowRuleDetails}
          />
        </EuiAccordion>
      ) : (
        <ContentPanel title={`Active rules (${totalSelected})`} actions={actions}>
          <RulesTable
            loading={loading}
            ruleItems={enabledRuleItems.map((i) => mapRuleItemToRuleTableItem(i))}
            showRuleDetails={onShowRuleDetails}
          />
        </ContentPanel>
      )}
    </>
  );
};
