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
import { RuleItemInfoBase } from '../../../../../types';
import { setBreadcrumbs } from '../../../../utils/helpers';

export interface EditRuleProps
  extends RouteComponentProps<any, any, { ruleItem: RuleItemInfoBase }> {
  services: BrowserServices;
  notifications?: NotificationsStart;
}

export const EditRule: React.FC<EditRuleProps> = ({ history, location, notifications }) => {
  useEffect(() => {
    setRulesRelatedBreadCrumb(BREADCRUMBS.RULES_EDIT, setBreadcrumbs);
  });

  return (
    <RuleEditorContainer
      title="Edit rule"
      mode={'edit'}
      rule={location.state.ruleItem._source}
      history={history}
      notifications={notifications}
    />
  );
};
