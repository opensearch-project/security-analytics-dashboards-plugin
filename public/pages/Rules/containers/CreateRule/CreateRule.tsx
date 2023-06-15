/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserServices } from '../../../../models/interfaces';
import { RuleEditorContainer } from '../../components/RuleEditor/RuleEditorContainer';
import React, { useContext, useEffect } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { BREADCRUMBS } from '../../../../utils/constants';
import { CoreServicesContext } from '../../../../components/core_services';
import { NotificationsStart } from 'opensearch-dashboards/public';
import { setBreadCrumb } from '../../utils/helpers';
import { EuiTitle, EuiText, EuiLink } from '@elastic/eui';

export interface CreateRuleProps {
  services: BrowserServices;
  history: RouteComponentProps['history'];
  notifications?: NotificationsStart;
}

export const CreateRule: React.FC<CreateRuleProps> = ({ history, services, notifications }) => {
  const context = useContext(CoreServicesContext);

  useEffect(() => {
    setBreadCrumb(BREADCRUMBS.RULES_CREATE, context?.chrome.setBreadcrumbs);
  });

  return (
    <RuleEditorContainer
      title={
        <>
          <EuiTitle size={'m'}>
            <h3>Create detection rule</h3>
          </EuiTitle>
          <EuiText size="s" color="subdued">
            Create a rule for detectors to identify threat scenarios for different log sources.{' '}
            <EuiLink
              href="https://sigmahq.github.io/sigma-specification/Sigma_specification.html"
              target="_blank"
            >
              Learn more in the Sigma rules specification
            </EuiLink>
          </EuiText>
        </>
      }
      history={history}
      notifications={notifications}
      mode={'create'}
    />
  );
};
