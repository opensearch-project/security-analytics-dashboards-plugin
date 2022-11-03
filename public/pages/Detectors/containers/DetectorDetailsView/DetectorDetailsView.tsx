/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { DetectorBasicDetailsView } from '../../components/DetectorBasicDetailsView/DetectorBasicDetailsView';
import { DetectorRulesView } from '../../components/DetectorRulesView/DetectorRulesView';
import { EuiSpacer } from '@elastic/eui';
import { Detector } from '../../../../../models/interfaces';
import { RuleItem } from '../../../CreateDetector/components/DefineDetector/components/DetectionRules/types/interfaces';

export interface DetectorDetailsViewProps {
  detector: Detector;
  enabled_time?: number;
  last_update_time?: number;
  rulesCanFold?: boolean;
  editBasicDetails: () => void;
  editDetectorRules: (enabledRules: RuleItem[], allRuleItems: RuleItem[]) => void;
}

export interface DetectorDetailsViewState {}

export class DetectorDetailsView extends React.Component<
  DetectorDetailsViewProps,
  DetectorDetailsViewState
> {
  render() {
    const {
      detector,
      enabled_time,
      last_update_time,
      rulesCanFold,
      editBasicDetails,
      editDetectorRules,
    } = this.props;
    const detectorRules = (
      <DetectorRulesView
        detector={detector}
        rulesCanFold={rulesCanFold}
        onEditClicked={editDetectorRules}
      />
    );

    return (
      <>
        <DetectorBasicDetailsView
          detector={detector}
          enabled_time={enabled_time}
          last_update_time={last_update_time}
          rulesCanFold={rulesCanFold}
          onEditClicked={editBasicDetails}
        >
          {rulesCanFold ? detectorRules : null}
        </DetectorBasicDetailsView>
        <EuiSpacer size="xxl" />

        {rulesCanFold ? null : detectorRules}
      </>
    );
  }
}
