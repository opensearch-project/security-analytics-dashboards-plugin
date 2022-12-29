/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { load } from 'js-yaml';
import {
  EuiFormRow,
  EuiCodeEditor,
  EuiLink,
  EuiSpacer,
  EuiText,
  EuiForm,
  EuiFlexGroup,
  EuiButton,
  EuiFlexItem,
} from '@elastic/eui';
import FormFieldHeader from '../../../../components/FormFieldHeader';
import { Rule } from '../../../../../models/interfaces';
import {
  AUTHOR_REGEX,
  validateDescription,
  validateName,
  authorErrorString,
  descriptionErrorString,
  titleErrorString,
} from '../../../../utils/validation';
import {
  mapRuleToYamlObject,
  mapYamlObjectToYamlString,
  mapYamlObjectToRule,
} from '../../utils/mappers';

export interface YamlRuleEditorProps {
  rule: Rule;
  change: React.Dispatch<Rule>;
  submit: () => void;
  cancel: () => void;
  mode: 'create' | 'edit';
}

export interface YamlEditorState {
  errors: string[] | null;
  value?: string;
}

const validateRule = (rule: Rule): string[] | null => {
  const requiredFiledsValidationErrors: Array<string> = [];

  if (!rule.title) {
    requiredFiledsValidationErrors.push('Title is required');
  }
  if (!rule.category) {
    requiredFiledsValidationErrors.push('Logsource is required');
  }
  if (!rule.level) {
    requiredFiledsValidationErrors.push('Level is required');
  }
  if (!rule.author) {
    requiredFiledsValidationErrors.push('Author is required');
  }
  if (!rule.status) {
    requiredFiledsValidationErrors.push('Status is required');
  }

  if (requiredFiledsValidationErrors.length > 0) {
    return requiredFiledsValidationErrors;
  }

  if (!validateName(rule.title, AUTHOR_REGEX)) {
    return [titleErrorString];
  }
  if (!validateDescription(rule.description)) {
    return [descriptionErrorString];
  }
  if (!validateName(rule.author, AUTHOR_REGEX)) {
    return [authorErrorString];
  }

  return null;
};

export const YamlRuleEditor: React.FC<YamlRuleEditorProps> = ({
  rule,
  change,
  submit,
  cancel,
  mode,
}) => {
  const yamlObject = mapRuleToYamlObject(rule);

  const [state, setState] = useState<YamlEditorState>({
    errors: null,
    value: mapYamlObjectToYamlString(yamlObject),
  });

  const onChange = (value: string) => {
    setState((prevState) => ({ ...prevState, value }));
  };

  const onBlur = () => {
    if (!state.value) {
      setState((prevState) => ({ ...prevState, errors: ['Rule cannot be empty'] }));
      return;
    }
    try {
      const yamlObject = load(state.value);

      const rule = mapYamlObjectToRule(yamlObject);

      change(rule);

      const errors = validateRule(rule);

      if (errors && errors.length > 0) {
        setState((prevState) => ({ ...prevState, errors: errors }));
        return;
      }

      setState((prevState) => ({ ...prevState, errors: null }));
    } catch (error) {
      setState((prevState) => ({ ...prevState, errors: ['Invalid YAML'] }));

      console.warn('Security Analytics - Rule Eritor - Yaml load', error);
    }
  };

  return (
    <>
      <EuiForm
        isInvalid={state.errors !== null && state.errors.length > 0}
        error={state.errors}
        component="form"
      >
        <EuiFormRow
          label={<FormFieldHeader headerTitle={'Define rule in YAML'} />}
          fullWidth={true}
        >
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
              value={state.value}
              onChange={onChange}
              onBlur={onBlur}
              data-test-subj={'rule_yaml_editor'}
            />
          </>
        </EuiFormRow>

        <EuiSpacer />

        <EuiFlexGroup justifyContent="flexEnd">
          <EuiFlexItem grow={false}>
            <EuiButton onClick={cancel}>Cancel</EuiButton>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButton onClick={submit} fill data-test-subj={'submit_rule_form_button'}>
              {mode === 'create' ? 'Create' : 'Save changes'}
            </EuiButton>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiForm>
    </>
  );
};
