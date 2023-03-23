/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { DetectorBasicDetailsView } from '../../components/DetectorBasicDetailsView/DetectorBasicDetailsView';
import { DetectorRulesView } from '../../components/DetectorRulesView/DetectorRulesView';
import { EuiSpacer } from '@elastic/eui';
import { RuleItem } from '../../../CreateDetector/components/DefineDetector/components/DetectionRules/types/interfaces';
import { NotificationsStart } from 'opensearch-dashboards/public';
import { Detector } from '../../../../../types';

export interface DetectorDetailsViewProps {
  detector: Detector;
  enabled_time?: number;
  last_update_time?: number;
  rulesCanFold?: boolean;
  notifications: NotificationsStart;
  dashboardId?: string;
  editBasicDetails: () => void;
  editDetectorRules: (enabledRules: RuleItem[], allRuleItems: RuleItem[]) => void;
  isEditable: boolean;
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
      dashboardId,
      editBasicDetails,
      editDetectorRules,
      isEditable = true,
    } = this.props;
    const detectorRules = (
      <DetectorRulesView
        {...this.props}
        detector={detector}
        rulesCanFold={rulesCanFold}
        onEditClicked={editDetectorRules}
        isEditable={isEditable}
      />
    );

    return (
      <>
        <DetectorBasicDetailsView
          {...this.props}
          detector={detector}
          enabled_time={enabled_time}
          last_update_time={last_update_time}
          rulesCanFold={rulesCanFold}
          dashboardId={dashboardId}
          onEditClicked={editBasicDetails}
          isEditable={isEditable}
        >
          {rulesCanFold ? detectorRules : null}
        </DetectorBasicDetailsView>
        <EuiSpacer size="xxl" />

        {rulesCanFold ? null : detectorRules}
      </>
    );
  }
}
