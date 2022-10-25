/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { ContentPanel } from '../../../../components/ContentPanel';
import React, { useMemo } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { EuiButton } from '@elastic/eui';
import { ROUTES } from '../../../../utils/constants';
import { AlertTriggerView } from '../../components/AlertTriggerView/AlertTriggerView';
import { Detector } from '../../../../../models/interfaces';

export interface AlertTriggersViewProps extends RouteComponentProps {
  detector: Detector;
}

export const AlertTriggersView: React.FC<AlertTriggersViewProps> = ({ detector, history }) => {
  const actions = useMemo(
    () => [
      <EuiButton
        onClick={() => {
          history.push({
            pathname: ROUTES.EDIT_FIELD_MAPPINGS,
            state: { detector },
          });
        }}
      >
        Edit
      </EuiButton>,
    ],
    []
  );

  return (
    <ContentPanel title={`Alert triggers (${detector.triggers.length})`} actions={actions}>
      {detector.triggers.map((alertTrigger, index) => (
        <AlertTriggerView key={alertTrigger.id} alertTrigger={alertTrigger} orderPosition={index} />
      ))}
    </ContentPanel>
  );
};
