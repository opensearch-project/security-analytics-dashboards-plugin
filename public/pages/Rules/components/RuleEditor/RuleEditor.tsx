/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ContentPanel } from '../../../../components/ContentPanel';
import { EuiSpacer } from '@elastic/eui';
import { Rule } from '../../../../../models/interfaces';
import { RuleEditorFormState } from './RuleEditorFormState.model';
import { mapFormToRule, mapRuleToForm } from './mappers';
import { VisualRuleEditor } from './VisualRuleEditor';

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

export const RuleEditor: React.FC<RuleEditorProps> = ({ title, rule, FooterActions }) => {
  const [ruleEditorFormState, setRuleEditorFormState] = useState<RuleEditorFormState>(
    rule ? mapRuleToForm(rule) : newRuyleDefaultState
  );

  const getRule = (): Rule => {
    return mapFormToRule(ruleEditorFormState);
  };

  return (
    <>
      <ContentPanel title={title}>
        <VisualRuleEditor
          ruleEditorFormState={ruleEditorFormState}
          setRuleEditorFormState={setRuleEditorFormState}
        />

        <EuiSpacer />
      </ContentPanel>
      <EuiSpacer size="xl" />
      <FooterActions rule={getRule()} />
    </>
  );
};
