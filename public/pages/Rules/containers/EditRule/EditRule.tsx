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
import { RuleItemInfoBase } from '../../../../../types';

export interface EditRuleProps
  extends RouteComponentProps<any, any, { ruleItem: RuleItemInfoBase }> {
  services: BrowserServices;
  notifications?: NotificationsStart;
}

export const EditRule: React.FC<EditRuleProps> = ({
  history,
  services,
  location,
  notifications,
}) => {
  const context = useContext(CoreServicesContext);

  useEffect(() => {
    setBreadCrumb(BREADCRUMBS.RULES_EDIT, context?.chrome.setBreadcrumbs);
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
