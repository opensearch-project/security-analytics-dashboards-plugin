/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { NotificationsStart } from 'opensearch-dashboards/public';
import { RuleService } from '../../../../services';
import { ROUTES } from '../../../../utils/constants';
import { ContentPanel } from '../../../../components/ContentPanel';
import { EuiSpacer, EuiButtonGroup } from '@elastic/eui';
import { Rule } from '../../../../../models/interfaces';
import { RuleEditorFormState, ruleEditorStateDefaultValue } from './RuleEditorFormState';
import { mapFormToRule, mapRuleToForm } from './mappers';
import { VisualRuleEditor } from './VisualRuleEditor';
import { YamlRuleEditor } from './YamlRuleEditor';
import { validateRule } from '../../utils/helpers';
import { errorNotificationToast } from '../../../../utils/helpers';

export interface RuleEditorProps {
  title: string;
  rule?: Rule;
  history: RouteComponentProps['history'];
  notifications?: NotificationsStart;
  ruleService: RuleService;
  mode: 'create' | 'edit';
}

export interface VisualEditorFormErrorsState {
  nameError: string | null;
  descriptionError: string | null;
  authorError: string | null;
}

const editorTypes = [
  {
    id: 'visual',
    label: 'Visual Editor',
  },
  {
    id: 'yaml',
    label: 'YAML Editor',
  },
];

export const RuleEditor: React.FC<RuleEditorProps> = ({
  history,
  notifications,
  title,
  rule,
  ruleService,
  mode,
}) => {
  const [ruleEditorFormState, setRuleEditorFormState] = useState<RuleEditorFormState>(
    rule
      ? { ...mapRuleToForm(rule), id: ruleEditorStateDefaultValue.id }
      : ruleEditorStateDefaultValue
  );

  const [selectedEditorType, setSelectedEditorType] = useState('visual');

  const onEditorTypeChange = (optionId: string) => {
    setSelectedEditorType(optionId);
  };

  const onYamlRuleEditorChange = (value: Rule) => {
    const formState = mapRuleToForm(value);
    setRuleEditorFormState(formState);
  };

  const onSubmit = async () => {
    const submitingRule = mapFormToRule(ruleEditorFormState);
    if (!validateRule(submitingRule, notifications!, 'create')) {
      return;
    }

    let result;
    if (mode === 'edit') {
      if (!rule) {
        console.error('No rule id found');
        return;
      }
      result = await ruleService.updateRule(rule?.id, submitingRule.category, submitingRule);
    } else {
      result = await ruleService.createRule(submitingRule);
    }

    if (!result.ok) {
      errorNotificationToast(
        notifications!,
        mode === 'create' ? 'create' : 'save',
        'rule',
        result.error
      );
    } else {
      history.replace(ROUTES.RULES);
    }
  };

  const goToRulesList = useCallback(() => {
    history.replace(ROUTES.RULES);
  }, [history]);

  return (
    <>
      <ContentPanel title={title}>
        <EuiButtonGroup
          data-test-subj="change-editor-type"
          legend="This is editor type selector"
          options={editorTypes}
          idSelected={selectedEditorType}
          onChange={(id) => onEditorTypeChange(id)}
        />
        <EuiSpacer size="xl" />
        {selectedEditorType === 'visual' && (
          <VisualRuleEditor
            mode={mode}
            notifications={notifications}
            ruleEditorFormState={ruleEditorFormState}
            setRuleEditorFormState={setRuleEditorFormState}
            cancel={goToRulesList}
            submit={onSubmit}
          />
        )}
        {selectedEditorType === 'yaml' && (
          <YamlRuleEditor
            mode={mode}
            rule={mapFormToRule(ruleEditorFormState)}
            change={onYamlRuleEditorChange}
            cancel={goToRulesList}
            submit={onSubmit}
          />
        )}
        <EuiSpacer />
      </ContentPanel>
      <EuiSpacer size="xl" />
    </>
  );
};
