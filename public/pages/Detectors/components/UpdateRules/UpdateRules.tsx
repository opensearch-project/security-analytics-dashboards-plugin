/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiButton, EuiFlexGroup, EuiFlexItem, EuiSpacer, EuiTitle } from '@elastic/eui';
import { DetectorHit } from '../../../../../server/models/interfaces';
import React, { useCallback, useContext, useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { RuleItem } from '../../../CreateDetector/components/DefineDetector/components/DetectionRules/types/interfaces';
import { Detector } from '../../../../../models/interfaces';
import { MIN_NUM_DATA_SOURCES } from '../../utils/constants';
import { DetectionRulesTable } from '../../../CreateDetector/components/DefineDetector/components/DetectionRules/DetectionRulesTable';
import { ROUTES } from '../../../../utils/constants';
import { ServicesContext } from '../../../../services';
import { getUpdatedEnabledRuleIds } from '../../../../utils/helpers';

export interface UpdateDetectorRulesProps
  extends RouteComponentProps<
    any,
    any,
    { detectorHit: DetectorHit; enabledRules?: RuleItem[]; allRules?: RuleItem[] }
  > {}

export const UpdateDetectorRules: React.FC<UpdateDetectorRulesProps> = (props) => {
  const services = useContext(ServicesContext);
  const enabledRules = props.location.state.enabledRules;

  const [enabledCustomRuleIds, setEnabledCustomRuleIds] = useState<Set<string>>(
    new Set(
      enabledRules
        ?.map((rule) => (rule.library === 'Custom' ? rule.id : undefined))
        .filter((id) => !!id) as string[]
    )
  );
  const [enabledPrePackagedRuleIds, setEnabledPrePackagedRuleIds] = useState<Set<string>>(
    new Set(
      enabledRules
        ?.map((rule) => (rule.library === 'Sigma' ? rule.id : undefined))
        .filter((id) => !!id) as string[]
    )
  );
  const [detector, setDetector] = useState<Detector>(props.location.state.detectorHit._source);
  const [ruleItems, setRuleItems] = useState<RuleItem[]>(props.location.state.allRules || []);

  const updateDetectorState = useCallback(
    (detector: Detector) => {
      const isDataValid =
        !!detector.name &&
        !!detector.detector_type &&
        detector.inputs[0].detector_input.indices.length >= MIN_NUM_DATA_SOURCES;

      if (isDataValid) {
        setDetector(detector);
      }
    },
    [setDetector]
  );

  const onRulesChanged = (ruleFieldname: string, enabledRuleIds: string[]) => {
    const { inputs } = detector;
    const newDetector: Detector = {
      ...detector,
      inputs: [
        {
          detector_input: {
            ...inputs[0].detector_input,
            [ruleFieldname]: enabledRuleIds.map((id) => {
              return { id };
            }),
          },
        },
        ...inputs.slice(1),
      ],
    };

    updateDetectorState(newDetector);
  };

  const onRuleActivationToggle = (changedItem: RuleItem, isActive: boolean) => {
    const newRuleItems = ruleItems.map((item) => {
      return {
        ...item,
        active: item.id === changedItem.id ? isActive : item.active,
      };
    });
    setRuleItems(newRuleItems);

    const existingEnabledIds =
      changedItem.library === 'Sigma' ? enabledPrePackagedRuleIds : enabledCustomRuleIds;
    const newEnabledIds = getUpdatedEnabledRuleIds(existingEnabledIds, changedItem.id, isActive);
    if (newEnabledIds) {
      if (changedItem.library === 'Sigma') {
        onRulesChanged('pre_packaged_rules', newEnabledIds);
        setEnabledPrePackagedRuleIds(new Set(newEnabledIds));
      } else if (changedItem.library === 'Custom') {
        onRulesChanged('custom_rules', newEnabledIds);
        setEnabledCustomRuleIds(new Set(newEnabledIds));
      }
    }
  };

  const onCancel = useCallback(() => {
    props.history.replace({
      pathname: ROUTES.DETECTOR_DETAILS,
      state: props.location.state,
    });
  }, []);

  const onSave = useCallback(() => {
    const detectorHit = props.location.state.detectorHit;

    const updateDetector = async () => {
      const updateDetectorRes = await services?.detectorsService?.updateDetector(
        detectorHit._id,
        detector
      );

      if (updateDetectorRes?.ok) {
        props.history.replace({
          pathname: ROUTES.DETECTOR_DETAILS,
          state: {
            detectorHit: { ...detectorHit, _source: { ...detectorHit._source, ...detector } },
          },
        });
      } else {
        // TODO: Show error toast
      }

      props.history.replace({
        pathname: ROUTES.DETECTOR_DETAILS,
        state: {
          detectorHit: { ...detectorHit, _source: { ...detectorHit._source, ...detector } },
        },
      });
    };

    updateDetector();
  }, [detector]);

  return (
    <div>
      <EuiTitle size={'l'}>
        <h3>Edit detector rules</h3>
      </EuiTitle>
      <EuiSpacer size="xxl" />

      <DetectionRulesTable ruleItems={ruleItems} onRuleActivationToggle={onRuleActivationToggle} />

      <EuiSpacer size="xl" />

      <EuiFlexGroup justifyContent="flexEnd">
        <EuiFlexItem grow={false}>
          <EuiButton onClick={onCancel}>Cancel</EuiButton>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiButton onClick={onSave}>Save changes</EuiButton>
        </EuiFlexItem>
      </EuiFlexGroup>
    </div>
  );
};
