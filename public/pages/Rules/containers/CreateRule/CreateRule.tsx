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
import { CoreServicesContext } from '../../../../components/core_services';
import { NotificationsStart } from 'opensearch-dashboards/public';
import { errorNotificationToast } from '../../../../utils/helpers';
import { validateRule, validateYamlContent } from '../../utils/helpers';

export interface CreateRuleProps {
  services: BrowserServices;
  history: RouteComponentProps['history'];
  notifications?: NotificationsStart;
}

export const CreateRule: React.FC<CreateRuleProps> = ({ history, services, notifications }) => {
  const context = useContext(CoreServicesContext);
  context?.chrome.setBreadcrumbs([BREADCRUMBS.SECURITY_ANALYTICS, BREADCRUMBS.RULES_CREATE]);
  const footerActions: React.FC<{ rule: Rule }> = ({ rule }) => {
    const onCreate = async () => {
      if (!validateRule(rule, notifications!, 'create')) {
        return;
      }

      const ruleDetectionError = await validateYamlContent(rule.detection);
      if (ruleDetectionError) {
        errorNotificationToast(notifications!, 'validate', 'detection field', ruleDetectionError);
        return;
      }

      const createRuleRes = await services.ruleService.createRule(rule);

      if (!createRuleRes.ok) {
        errorNotificationToast(notifications!, 'create', 'rule', createRuleRes.error);
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
          <EuiButton fill onClick={onCreate} data-test-subj={'create_rule_button'}>
            Create
          </EuiButton>
        </EuiFlexItem>
      </EuiFlexGroup>
    );
  };

  return <RuleEditor title="Create a rule" services={services} FooterActions={footerActions} />;
};
