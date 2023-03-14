/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { NotificationsStart } from 'opensearch-dashboards/public';
import { ROUTES } from '../../../../utils/constants';
import { EuiSpacer } from '@elastic/eui';
import { Rule } from '../../../../../models/interfaces';
import { RuleEditorFormModel, ruleEditorStateDefaultValue } from './RuleEditorFormModel';
import { mapFormToRule, mapRuleToForm } from './mappers';
import { RuleEditorForm } from './RuleEditorForm';
import { validateRule } from '../../utils/helpers';
import { DataStore } from '../../../../store/DataStore';

export interface RuleEditorProps {
  title: string;
  rule?: Rule;
  history: RouteComponentProps['history'];
  notifications?: NotificationsStart;
  mode: 'create' | 'edit';
}

export interface VisualEditorFormErrorsState {
  nameError: string | null;
  descriptionError: string | null;
  authorError: string | null;
}

export const RuleEditorContainer: React.FC<RuleEditorProps> = ({
  history,
  notifications,
  title,
  rule,
  mode,
}) => {
  const initialRuleValue = rule
    ? { ...mapRuleToForm(rule), id: ruleEditorStateDefaultValue.id }
    : ruleEditorStateDefaultValue;

  const onSubmit = async (values: RuleEditorFormModel) => {
    const submitingRule = mapFormToRule(values);
    if (!validateRule(submitingRule, notifications!, 'create')) {
      return;
    }

    let result;
    if (mode === 'edit') {
      if (!rule) {
        console.error('No rule id found');
        return;
      }
      result = await DataStore.rules.updateRule(rule?.id, submitingRule.category, submitingRule);
    } else {
      result = await DataStore.rules.createRule(submitingRule);
    }

    if (result) {
      history.replace(ROUTES.RULES);
    }
  };

  const goToRulesList = useCallback(() => {
    history.replace(ROUTES.RULES);
  }, [history]);

  return (
    <>
      <RuleEditorForm
        title={title}
        mode={mode}
        notifications={notifications}
        initialValue={initialRuleValue}
        cancel={goToRulesList}
        submit={onSubmit}
      />
      <EuiSpacer size="xl" />
    </>
  );
};
