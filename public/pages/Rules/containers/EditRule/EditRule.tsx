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
import { NotificationsStart } from 'opensearch-dashboards/public';
import { errorNotificationToast } from '../../../../utils/helpers';
import { validateRule } from '../../utils/helpers';

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
  context?.chrome.setBreadcrumbs([BREADCRUMBS.SECURITY_ANALYTICS, BREADCRUMBS.RULES_EDIT]);
  const footerActions: React.FC<{ rule: Rule }> = ({ rule }) => {
    const onSave = async () => {
      if (!validateRule(rule, notifications!, 'save')) {
        return;
      }

      const editRuleRes = await services.ruleService.updateRule(
        location.state.ruleItem._id,
        rule.category,
        rule
      );

      if (!editRuleRes.ok) {
        errorNotificationToast(notifications!, 'save', 'rule', editRuleRes.error);
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
          <EuiButton fill onClick={onSave}>
            Save changes
          </EuiButton>
        </EuiFlexItem>
      </EuiFlexGroup>
    );
  };

  return (
    <RuleEditor
      title="Edit rule"
      services={services}
      FooterActions={footerActions}
      rule={location.state.ruleItem._source}
    />
  );
};
