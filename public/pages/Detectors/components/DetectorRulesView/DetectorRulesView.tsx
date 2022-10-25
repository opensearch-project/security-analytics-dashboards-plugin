/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { ContentPanel } from '../../../../components/ContentPanel';
import React, { useContext, useEffect, useState } from 'react';
import { EuiButton, EuiInMemoryTable } from '@elastic/eui';
import { RouteComponentProps } from 'react-router-dom';
import {
  RuleItem,
  RuleItemInfo,
} from '../../../CreateDetector/components/DefineDetector/components/DetectionRules/types/interfaces';
import { getRulesColumns } from '../../../CreateDetector/components/DefineDetector/components/DetectionRules/utils/constants';
import { ServicesContext } from '../../../../services';
import { ruleItemInfosToItems } from '../../../../utils/helpers';
import { Detector } from '../../../../../models/interfaces';

export interface DetectorRulesViewProps extends RouteComponentProps {
  detector: Detector;
  onEditClicked: () => void;
}

export const DetectorRulesView: React.FC<DetectorRulesViewProps> = (props) => {
  const totalSelected = props.detector.inputs.reduce((sum, inputObj) => {
    return (
      sum +
      inputObj.detector_input.custom_rules.length +
      inputObj.detector_input.pre_packaged_rules.length
    );
  }, 0);

  const actions = [<EuiButton onClick={props.onEditClicked}>Edit</EuiButton>];

  const [ruleItems, setRuleItems] = useState<RuleItem[]>([]);
  const services = useContext(ServicesContext);

  useEffect(() => {
    const getRules = async (prePackaged: boolean, enabledRuleIds: Set<string>) => {
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
        return getRulesRes.response.hits.hits.filter((hit) => {
          return enabledRuleIds.has(hit._id);
        });
      }

      return [];
    };

    const updateRulesState = async () => {
      const prePackagedRules = await getRules(
        true,
        new Set(
          props.detector.inputs[0].detector_input.pre_packaged_rules.map((ruleInfo) => ruleInfo.id)
        )
      );
      const customRules = await getRules(
        false,
        new Set(props.detector.inputs[0].detector_input.custom_rules.map((ruleInfo) => ruleInfo.id))
      );

      let ruleItemInfos: RuleItemInfo[] = prePackagedRules.map((rule) => ({
        ...rule,
        enabled: true,
        prePackaged: true,
      }));

      ruleItemInfos = ruleItemInfos.concat(
        customRules.map((rule) => ({
          ...rule,
          enabled: true,
          prePackaged: true,
        }))
      );

      setRuleItems(ruleItemInfosToItems(props.detector.detector_type, ruleItemInfos));
    };

    updateRulesState().catch((error) => {
      // TODO: Show error toast
    });
  }, [services, props.detector]);

  return (
    <ContentPanel title={`Detection rules (${totalSelected})`} actions={actions}>
      <EuiInMemoryTable
        columns={getRulesColumns()}
        items={ruleItems}
        itemId={(item: RuleItem) => `${item.name}`}
        pagination
      />
    </ContentPanel>
  );
};
