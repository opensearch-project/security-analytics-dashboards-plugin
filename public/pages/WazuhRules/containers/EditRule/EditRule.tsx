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
import { RuleItemInfoBase } from '../../../../../types';
import { setBreadcrumbs } from '../../../../utils/helpers';
import { getUseUpdatedUx } from '../../../../services/utils/constants';

export interface EditRuleProps
  extends RouteComponentProps<any, any, { ruleItem: RuleItemInfoBase }> {
  services: BrowserServices;
  notifications?: NotificationsStart;
}

export const EditRule: React.FC<EditRuleProps> = ({ history, location, notifications }) => {
  useEffect(() => {
    const ruleItemTitle = location.state.ruleItem._source.title;
    const ruleEditDetailsBreadcrumb = BREADCRUMBS.RULE_EDIT_DETAILS(ruleItemTitle);

    if (!getUseUpdatedUx()) {
      setRulesRelatedBreadCrumb(BREADCRUMBS.RULES_EDIT, setBreadcrumbs);
    } else {
      setBreadcrumbs([ruleEditDetailsBreadcrumb]);
    }
  }, [location.state.ruleItem._source.title, getUseUpdatedUx()]); // Add relevant dependencies

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
