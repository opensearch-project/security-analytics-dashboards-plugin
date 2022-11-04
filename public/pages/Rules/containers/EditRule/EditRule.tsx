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

export interface EditRuleProps
  extends RouteComponentProps<any, any, { ruleItem: RuleItemInfoBase }> {
  services: BrowserServices;
}

export const EditRule: React.FC<EditRuleProps> = ({ history, services, location }) => {
  const context = useContext(CoreServicesContext);
  context?.chrome.setBreadcrumbs([BREADCRUMBS.SECURITY_ANALYTICS, BREADCRUMBS.RULES_EDIT]);

  const footerActions: React.FC<{ rule: Rule }> = ({ rule }) => {
    const onSave = async () => {
      const updateRuleRes = await services.ruleService.updateRule(
        location.state.ruleItem._id,
        rule.category,
        rule
      );

      if (!updateRuleRes.ok) {
        // TODO: show toast notification
        alert('Failed rule creation');
      }

      history.replace(ROUTES.RULES);
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
