/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ContentPanel } from '../../../../components/ContentPanel';
import { EuiSpacer, EuiButtonGroup } from '@elastic/eui';
import { Rule } from '../../../../../models/interfaces';
import { RuleEditorFormState, ruleEditorStateDefaultValue } from './RuleEditorFormState';
import { mapFormToRule, mapRuleToForm } from './mappers';
import { VisualRuleEditor } from './VisualRuleEditor';
import { YamlRuleEditor } from './YamlRuleEditor';

export interface RuleEditorProps {
  title: string;
  FooterActions: React.FC<{ rule: Rule }>;
  rule?: Rule;
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

export const RuleEditor: React.FC<RuleEditorProps> = ({ title, rule, FooterActions }) => {
  const [ruleEditorFormState, setRuleEditorFormState] = useState<RuleEditorFormState>(
    rule
      ? { ...mapRuleToForm(rule), id: ruleEditorStateDefaultValue.id }
      : ruleEditorStateDefaultValue
  );

  const [selectedEditorType, setSelectedEditorType] = useState('visual');

  const onEditorTypeChange = (optionId: string) => {
    setSelectedEditorType(optionId);
  };

  const getRule = (): Rule => {
    return mapFormToRule(ruleEditorFormState);
  };

  const onYamlRuleEditorChange = (value: Rule) => {
    const formState = mapRuleToForm(value);
    setRuleEditorFormState(formState);
  };

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
            ruleEditorFormState={ruleEditorFormState}
            setRuleEditorFormState={setRuleEditorFormState}
          />
        )}
        {selectedEditorType === 'yaml' && (
          <YamlRuleEditor
            rule={mapFormToRule(ruleEditorFormState)}
            change={onYamlRuleEditorChange}
          />
        )}
        <EuiSpacer />
      </ContentPanel>
      <EuiSpacer size="xl" />
      <FooterActions rule={getRule()} />
    </>
  );
};
