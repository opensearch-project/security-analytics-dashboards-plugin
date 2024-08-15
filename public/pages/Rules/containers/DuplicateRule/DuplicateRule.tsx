/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserServices } from '../../../../models/interfaces';
import { RuleEditorContainer } from '../../components/RuleEditor/RuleEditorContainer';
import React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { BREADCRUMBS } from '../../../../utils/constants';
import { setRulesRelatedBreadCrumb } from '../../utils/helpers';
import { NotificationsStart } from 'opensearch-dashboards/public';
import { RuleItemInfoBase } from '../../../../../types';
import { setBreadcrumbs } from '../../../../utils/helpers';

export interface DuplicateRuleProps
  extends RouteComponentProps<any, any, { ruleItem: RuleItemInfoBase }> {
  services: BrowserServices;
  notifications?: NotificationsStart;
}

export const DuplicateRule: React.FC<DuplicateRuleProps> = ({
  history,
  services,
  location,
  notifications,
}) => {
  setRulesRelatedBreadCrumb(BREADCRUMBS.RULES_DUPLICATE, setBreadcrumbs);

  return (
    <RuleEditorContainer
      title="Duplicate rule"
      rule={location.state.ruleItem._source}
      history={history}
      notifications={notifications}
      mode={'create'}
    />
  );
};
