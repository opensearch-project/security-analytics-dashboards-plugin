/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { load } from 'js-yaml';
import { EuiCompressedFormRow, EuiCodeEditor, EuiLink, EuiSpacer, EuiText, EuiCallOut } from '@elastic/eui';
import FormFieldHeader from '../../../../../../components/FormFieldHeader';
import {
  mapRuleToYamlObject,
  mapYamlObjectToYamlString,
  mapYamlObjectToRule,
} from '../../../../utils/mappers';
import { Rule } from '../../../../../../../types';

export interface YamlRuleEditorComponentProps {
  rule: Rule;
  change: React.Dispatch<Rule>;
  isInvalid: boolean;
  errors?: string[];
}

export interface YamlEditorState {
  errors: string[] | null;
  value?: string;
}

export const YamlRuleEditorComponent: React.FC<YamlRuleEditorComponentProps> = ({
  rule,
  change,
  isInvalid,
  errors,
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

      setState((prevState) => ({ ...prevState, errors: null }));
    } catch (error) {
      setState((prevState) => ({ ...prevState, errors: ['Invalid YAML'] }));

      console.warn('Security Analytics - Rule Eritor - Yaml load', error);
    }
  };

  const renderErrors = () => {
    if (state.errors && state.errors.length > 0) {
      return (
        <EuiCallOut size="m" color="danger" title="Please address the highlighted errors.">
          <ul>
            {state.errors.map((error, i) => (
              <li key={i}>{error}</li>
            ))}
          </ul>
        </EuiCallOut>
      );
    } else if (isInvalid && errors && errors.length > 0) {
      return (
        <EuiCallOut size="m" color="danger" title="Please address the highlighted errors.">
          <ul>
            {errors.map((error, i) => (
              <li key={i}>{error}</li>
            ))}
          </ul>
        </EuiCallOut>
      );
    } else {
      return null;
    }
  };

  return (
    <>
      {renderErrors()}
      <EuiSpacer size="s" />
      <EuiCompressedFormRow label={<FormFieldHeader headerTitle={'Define rule in YAML'} />} fullWidth={true}>
        <>
          <EuiSpacer />
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
      </EuiCompressedFormRow>
    </>
  );
};
