/*
 * Copyright Wazuh Inc.
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { BrowserServices } from '../../../../models/interfaces';
import { RuleEditorContainer } from '../../components/RuleEditor/RuleEditorContainer';
import React, { useEffect } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { BREADCRUMBS } from '../../../../utils/constants';
import { NotificationsStart } from 'opensearch-dashboards/public';
import { setRulesRelatedBreadCrumb } from '../../utils/helpers';
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
      title="Create rule"
      subtitleData={{
        description:
          'Create a rule for detectors to identify threat scenarios for different log sources.',
        links: {
          label: 'Learn more in the Sigma rules specification',
          href: 'https://sigmahq.github.io/sigma-specification/Sigma_specification.html',
          controlType: 'link',
          target: '_blank',
          flush: 'both',
        },
      }}
      history={history}
      notifications={notifications}
      mode={'create'}
    />
  );
};
