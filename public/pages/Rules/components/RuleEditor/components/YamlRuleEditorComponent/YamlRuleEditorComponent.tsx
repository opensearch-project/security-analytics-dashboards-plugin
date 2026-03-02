/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useRef } from 'react';
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
  parseDebounceMs?: number; // Wazuh: added onFocus to warning erros on real time typing
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
  parseDebounceMs = 500,
}) => {
  const yamlObject = mapRuleToYamlObject(rule);

  const [state, setState] = useState<YamlEditorState>({
    errors: null,
    value: mapYamlObjectToYamlString(yamlObject),
  });

  // Wazuh: display warning erros on real time typing
  const timerRef = useRef<number | null>(null);

  // track whether the user currently has focus in the editor
  const isFocusedRef = useRef(false);

  // update local editor value when parent rule changes, BUT only if editor is NOT focused
  useEffect(() => {
    // Wazuh: display warning erros on real time typing
    const newYaml = mapYamlObjectToYamlString(mapRuleToYamlObject(rule));
    setState((s) => {
      if (isFocusedRef.current) {
        return s;
      }
      // only update if the external YAML truly differs from the current editor value
      if (s.value === newYaml) {
        return s;
      }
      return { ...s, value: newYaml };
    });
  }, [rule]);

  const tryParseAndNotify = (value: string) => {
    if (!value || value.trim() === '') {
      setState((prev) => ({ ...prev, errors: ['Rule cannot be empty'] }));
      return;
    }
    try {
      const yamlObject = load(value);
      const parsedRule = mapYamlObjectToRule(yamlObject);
      change(parsedRule);
      setState((prev) => ({ ...prev, errors: null }));
    } catch (err) {
      setState((prev) => ({ ...prev, errors: ['Invalid YAML'] }));
      console.warn('Security Analytics - Rule Editor - Yaml load', err);
    }
  };

  const onChange = (value: string) => {
    setState((prev) => ({ ...prev, value }));
    // debounce parse
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
    }
    timerRef.current = window.setTimeout(() => {
      tryParseAndNotify(value);
    }, parseDebounceMs);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  const onFocus = () => {
    isFocusedRef.current = true;
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
            onFocus={onFocus} // Wazuh: display warning erros on real time typing
            data-test-subj={'rule_yaml_editor'}
          />
        </>
      </EuiCompressedFormRow>
    </>
  );
};
