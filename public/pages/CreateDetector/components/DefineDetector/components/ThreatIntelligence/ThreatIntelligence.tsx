/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EuiLink, EuiText } from '@elastic/eui';
import { navigateToRoute } from '../../../../../../utils/helpers';
import { DETECTORS_NAV_ID, ROUTES } from '../../../../../../utils/constants';
import { RouteComponentProps } from 'react-router-dom';

export interface ThreatIntelligenceProps {
  history: RouteComponentProps['history'];
}

export const ThreatIntelligence: React.FC<ThreatIntelligenceProps> = ({ history }) => {
  return (
    <>
      <EuiText size="m">
        <h3>Threat intelligence feeds</h3>
      </EuiText>
      <EuiText size="s">
        <p>
          To match your data source against known indicators of compromise configure logs scan with
          threat intel sources on the{' '}
          <EuiLink
            onClick={() => navigateToRoute(history, DETECTORS_NAV_ID, ROUTES.THREAT_INTEL_OVERVIEW)}
          >
            Threat intelligence
          </EuiLink>{' '}
          page.
        </p>
      </EuiText>
    </>
  );
};
