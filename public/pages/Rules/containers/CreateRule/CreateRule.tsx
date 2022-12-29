/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserServices } from '../../../../models/interfaces';
import { RuleEditor } from '../../components/RuleEditor/RuleEditor';
import React, { useContext } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { BREADCRUMBS } from '../../../../utils/constants';
import { CoreServicesContext } from '../../../../components/core_services';
import { NotificationsStart } from 'opensearch-dashboards/public';
import { setBreadCrumb } from '../../utils/helpers';

export interface CreateRuleProps {
  services: BrowserServices;
  history: RouteComponentProps['history'];
  notifications?: NotificationsStart;
}

export const CreateRule: React.FC<CreateRuleProps> = ({ history, services, notifications }) => {
  const context = useContext(CoreServicesContext);
  setBreadCrumb(BREADCRUMBS.RULES_CREATE, context?.chrome.setBreadcrumbs);

  return (
    <RuleEditor
      title="Create a rule"
      history={history}
      notifications={notifications}
      mode={'create'}
      ruleService={services.ruleService}
    />
  );
};
