/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserServices } from '../../../../models/interfaces';
import { RuleEditor } from '../../components/RuleEditor/RuleEditor';
import React from 'react';
import { EuiButton, EuiFlexGroup, EuiFlexItem } from '@elastic/eui';
import { RouteComponentProps } from 'react-router-dom';
import { ROUTES } from '../../../../utils/constants';
import { Rule } from '../../../../../models/interfaces';

export interface CreateRuleProps {
  services: BrowserServices;
  history: RouteComponentProps['history'];
}

export const CreateRule: React.FC<CreateRuleProps> = ({ history, services }) => {
  const footerActions: React.FC<{ rule: Rule }> = ({ rule }) => {
    const onCreate = async () => {
      const createRuleRes = await services.ruleService.createRule(rule);

      if (!createRuleRes.ok) {
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
          <EuiButton fill onClick={onCreate}>
            Create
          </EuiButton>
        </EuiFlexItem>
      </EuiFlexGroup>
    );
  };

  return <RuleEditor title="Create a rule" services={services} FooterActions={footerActions} />;
};
