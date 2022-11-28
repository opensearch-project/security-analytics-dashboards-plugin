/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ContentPanel } from '../../../../components/ContentPanel';
import { EuiSpacer, EuiButtonGroup } from '@elastic/eui';
import { Rule } from '../../../../../models/interfaces';
import { RuleEditorFormState } from './RuleEditorFormState.model';
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

const newRuyleDefaultState: RuleEditorFormState = {
  id: '25b9c01c-350d-4b95-bed1-836d04a4f324',
  log_source: '',
  logType: '',
  name: '',
  description: '',
  status: '',
  author: '',
  references: [''],
  tags: [],
  detection: '',
  level: '',
  falsePositives: [''],
};

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
    rule ? { ...mapRuleToForm(rule), id: newRuyleDefaultState.id } : newRuyleDefaultState
  );

  const [selectedEditorType, setSelectedEditorType] = useState('visual');

  const onEditorTypeChange = (optionId: string) => {
    setSelectedEditorType(optionId);
  };

  const getRule = (): Rule => {
    return mapFormToRule(ruleEditorFormState);
  };

  return (
    <>
      <ContentPanel title={title}>
        <EuiButtonGroup
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
            ruleEditorFormState={ruleEditorFormState}
            setRuleEditorFormState={setRuleEditorFormState}
          />
        )}
        <EuiSpacer />
      </ContentPanel>
      <EuiSpacer size="xl" />
      <FooterActions rule={getRule()} />
    </>
  );
};
