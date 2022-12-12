/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserServices } from '../../../../models/interfaces';
import { RuleEditor } from '../../components/RuleEditor/RuleEditor';
import React, { useContext } from 'react';
import { EuiButton, EuiFlexGroup, EuiFlexItem } from '@elastic/eui';
import { RouteComponentProps } from 'react-router-dom';
import { BREADCRUMBS, ROUTES } from '../../../../utils/constants';
import { Rule } from '../../../../../models/interfaces';
import { RuleItemInfoBase } from '../../models/types';
import { CoreServicesContext } from '../../../../components/core_services';
import { setBreadCrumb, validateRule } from '../../utils/helpers';
import { NotificationsStart } from 'opensearch-dashboards/public';
import { errorNotificationToast } from '../../../../utils/helpers';

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
  const context = useContext(CoreServicesContext);
  setBreadCrumb(BREADCRUMBS.RULES_DUPLICATE, context?.chrome.setBreadcrumbs);
  const footerActions: React.FC<{ rule: Rule }> = ({ rule }) => {
    const onCreate = async () => {
      if (!validateRule(rule, notifications!, 'create')) {
        return;
      }
      const updateRuleRes = await services.ruleService.createRule(rule);

      if (!updateRuleRes.ok) {
        errorNotificationToast(notifications!, 'create', 'rule', updateRuleRes.error);
      } else {
        history.replace(ROUTES.RULES);
      }
    };

    return (
      <EuiFlexGroup justifyContent="flexEnd">
        <EuiFlexItem grow={false}>
          <EuiButton onClick={() => history.replace(ROUTES.RULES)}>Cancel</EuiButton>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiButton fill onClick={onCreate}>
            Create
          </EuiButton>
        </EuiFlexItem>
      </EuiFlexGroup>
    );
  };

  return (
    <RuleEditor
      title="Duplicate rule"
      FooterActions={footerActions}
      rule={location.state.ruleItem._source}
    />
  );
};
