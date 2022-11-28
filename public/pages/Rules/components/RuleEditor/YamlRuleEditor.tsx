/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { dump, load } from 'js-yaml';
import { EuiFormRow, EuiCodeEditor, EuiLink, EuiSpacer, EuiText } from '@elastic/eui';
import { RuleEditorFormState } from './RuleEditorFormState.model';
import FormFieldHeader from '../../../../components/FormFieldHeader';

export interface YamlRuleEditorProps {
  ruleEditorFormState: RuleEditorFormState;
  setRuleEditorFormState: React.Dispatch<React.SetStateAction<RuleEditorFormState>>;
}

export interface YamlEditorErrorsState {
  yamlEditorError: string | null;
}

const formToYaml = (formState: RuleEditorFormState): string => {
  try {
    const yamlString = dump(formState);

    return yamlString;
  } catch (error: any) {
    console.warn('Security Analytics - Rule Eritor - Yaml dump', error);
    return '';
  }
};

export const YamlRuleEditor: React.FC<YamlRuleEditorProps> = ({
  ruleEditorFormState,
  setRuleEditorFormState,
}) => {
  const [yamlEditorError, setYamlEditorError] = useState<YamlEditorErrorsState>({
    yamlEditorError: null,
  });

  const onYamlRuleChange = (value: string) => {
    if (value === '') {
      setYamlEditorError(() => ({ yamlEditorError: 'Required Field' }));
      return;
    }
    try {
      const newRuleEditorFormState = load(value);
      setRuleEditorFormState(() => newRuleEditorFormState);
      setYamlEditorError(() => ({ yamlEditorError: null }));
    } catch (error) {
      setYamlEditorError(() => ({ yamlEditorError: 'Invalid YAML' }));

      console.warn('Security Analytics - Rule Eritor - Yaml load', error);
    }
  };

  return (
    <>
      <EuiFormRow label={<FormFieldHeader headerTitle={'Define rule in YAML'} />} fullWidth={true}>
        <>
          <EuiText size="s" color="subdued">
            Use the YAML editor to define a sigma rule. See{' '}
            <EuiLink href="https://github.com/SigmaHQ/sigma-specification">
              Sigma specification
            </EuiLink>{' '}
            for rule structure and schema.
          </EuiText>
          <EuiSpacer size="s" />
          <EuiCodeEditor
            mode="yaml"
            width="100%"
            value={formToYaml(ruleEditorFormState)}
            onChange={onYamlRuleChange}
            data-test-subj={'rule_detection_field'}
          />
        </>
      </EuiFormRow>
    </>
  );
};
