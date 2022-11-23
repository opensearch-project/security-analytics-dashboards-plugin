/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { ContentPanel } from '../../../../components/ContentPanel';
import React, { useContext, useEffect, useState } from 'react';
import { EuiAccordion, EuiButton, EuiInMemoryTable, EuiSpacer, EuiText } from '@elastic/eui';
import { RuleItem } from '../../../CreateDetector/components/DefineDetector/components/DetectionRules/types/interfaces';
import { getRulesColumns } from '../../../CreateDetector/components/DefineDetector/components/DetectionRules/utils/constants';
import { ServicesContext } from '../../../../services';
import { Detector } from '../../../../../models/interfaces';
import { RuleInfo } from '../../../../../server/models/interfaces';
import { errorNotificationToast, translateToRuleItems } from '../../../../utils/helpers';
import { NotificationsStart } from 'opensearch-dashboards/public';

export interface DetectorRulesViewProps {
  detector: Detector;
  rulesCanFold?: boolean;
  onEditClicked: (enabledRules: RuleItem[], allRuleItems: RuleItem[]) => void;
  notifications: NotificationsStart;
}

export const DetectorRulesView: React.FC<DetectorRulesViewProps> = (props) => {
  const totalSelected = props.detector.inputs.reduce((sum, inputObj) => {
    return (
      sum +
      inputObj.detector_input.custom_rules.length +
      inputObj.detector_input.pre_packaged_rules.length
    );
  }, 0);

  const [enabledRuleItems, setEnabledRuleItems] = useState<RuleItem[]>([]);
  const [allRuleItems, setAllRuleItems] = useState<RuleItem[]>([]);
  const [loading, setLoading] = useState(false);
  const actions = [
    <EuiButton
      onClick={() => props.onEditClicked(enabledRuleItems, allRuleItems)}
      data-test-subj={'edit-detector-rules'}
    >
      Edit
    </EuiButton>,
  ];
  const services = useContext(ServicesContext);

  useEffect(() => {
    const getRules = async (prePackaged: boolean): Promise<RuleInfo[]> => {
      const getRulesRes = await services?.ruleService.getRules(prePackaged, {
        from: 0,
        size: 5000,
        query: {
          nested: {
            path: 'rule',
            query: {
              bool: {
                must: [
                  { match: { 'rule.category': `${props.detector.detector_type.toLowerCase()}` } },
                ],
              },
            },
          },
        },
      });

      if (getRulesRes?.ok) {
        return getRulesRes.response.hits.hits;
      } else {
        errorNotificationToast(props.notifications, 'retrieve', 'rules', getRulesRes?.error);
        return [];
      }
    };

    const updateRulesState = async () => {
      setLoading(true);
      const enabledPrePackagedRuleIds = new Set(
        props.detector.inputs[0].detector_input.pre_packaged_rules.map((ruleInfo) => ruleInfo.id)
      );
      const enabledCustomRuleIds = new Set(
        props.detector.inputs[0].detector_input.custom_rules.map((ruleInfo) => ruleInfo.id)
      );

      const prePackagedRules = await getRules(true);
      const customRules = await getRules(false);

      const enabledPrePackagedRules = prePackagedRules.filter((hit: RuleInfo) => {
        return enabledPrePackagedRuleIds.has(hit._id);
      });

      const enabledCustomRules = customRules.filter((hit: RuleInfo) => {
        return enabledCustomRuleIds.has(hit._id);
      });

      const enabledRuleItems = translateToRuleItems(
        enabledPrePackagedRules,
        enabledCustomRules,
        props.detector.detector_type,
        () => true
      );
      const allRuleItems = translateToRuleItems(
        prePackagedRules,
        customRules,
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
  }, [services, props.detector]);

  const rules = (
    <EuiInMemoryTable
      columns={getRulesColumns(false)}
      items={enabledRuleItems}
      itemId={(item: RuleItem) => `${item.name}`}
      pagination
      loading={loading}
    />
  );

  const getDetectionRulesTitle = () => `View detection rules (${totalSelected})`;

  return props.rulesCanFold ? (
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
      {rules}
    </EuiAccordion>
  ) : (
    <ContentPanel title={`Detection rules (${totalSelected})`} actions={actions}>
      {rules}
    </ContentPanel>
  );
};
