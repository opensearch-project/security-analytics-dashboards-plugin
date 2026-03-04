/*
 * Copyright Wazuh Inc.
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React, { useCallback } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { NotificationsStart } from 'opensearch-dashboards/public';
import { ROUTES } from '../../../../utils/constants';
import { EuiSpacer } from '@elastic/eui';
import { RuleEditorFormModel, ruleEditorStateDefaultValue } from './RuleEditorFormModel';
import { mapFormToRule, mapRuleToForm } from './mappers';
import { RuleEditorForm, VisualRuleEditorProps } from './RuleEditorForm';
import { validateRule } from '../../utils/helpers';
import { successNotificationToast } from '../../../../utils/helpers';
import { DataStore } from '../../../../store/DataStore';
import { Rule } from '../../../../../types';

export interface RuleEditorProps {
  title: string;
  subtitleData?: VisualRuleEditorProps['subtitleData'];
  rule?: Rule;
  history: RouteComponentProps['history'];
  notifications?: NotificationsStart;
  mode: 'create' | 'edit';
  validateOnMount?: boolean;
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
  validateOnMount,
  subtitleData,
}) => {
  const initialRuleValue = rule
    ? { ...mapRuleToForm(rule), id: ruleEditorStateDefaultValue.id }
    : ruleEditorStateDefaultValue;

  const onSubmit = async (values: RuleEditorFormModel, integrationId: string) => {
    // Wazuh: added integrationId param
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
      result = await DataStore.rules.updateRule(rule?.id, submitingRule);
    } else {
      result = await DataStore.rules.createRule(submitingRule, integrationId);
    }

    if (result) {
      successNotificationToast(
        notifications!,
        mode === 'create' ? 'create' : 'update',
        'rule',
        result.message ??
          `The rule ${values.name} has been ${
            mode === 'create' ? 'created' : 'updated'
          } successfully.`
      );
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
        validateOnMount={validateOnMount}
        subtitleData={subtitleData}
        cancel={goToRulesList}
        submit={onSubmit}
      />
      <EuiSpacer size="xl" />
    </>
  );
};
