/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserServices } from '../../../../models/interfaces';
import { RuleEditorContainer } from '../../components/RuleEditor/RuleEditorContainer';
import React, { useEffect } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { BREADCRUMBS } from '../../../../utils/constants';
import { NotificationsStart } from 'opensearch-dashboards/public';
import { setRulesRelatedBreadCrumb } from '../../utils/helpers';
import { EuiTitle, EuiText, EuiLink } from '@elastic/eui';
import { setBreadcrumbs } from '../../../../utils/helpers';

export interface CreateRuleProps {
  services: BrowserServices;
  history: RouteComponentProps['history'];
  notifications?: NotificationsStart;
}

export const CreateRule: React.FC<CreateRuleProps> = ({ history, services, notifications }) => {
  useEffect(() => {
    setRulesRelatedBreadCrumb(BREADCRUMBS.RULES_CREATE, setBreadcrumbs);
  });

  return (
    <RuleEditorContainer
      // title={
      //   <>
      //     <EuiTitle size={'m'}>
      //       <h3>Create detection rule</h3>
      //     </EuiTitle>
      //     <EuiText size="s" color="subdued">
      //       Create a rule for detectors to identify threat scenarios for different log sources.{' '}
      //       <EuiLink
      //         href="https://sigmahq.github.io/sigma-specification/Sigma_specification.html"
      //         target="_blank"
      //       >
      //         Learn more in the Sigma rules specification
      //       </EuiLink>
      //     </EuiText>
      //   </>
      // }
      history={history}
      notifications={notifications}
      mode={'create'}
    />
  );
};
