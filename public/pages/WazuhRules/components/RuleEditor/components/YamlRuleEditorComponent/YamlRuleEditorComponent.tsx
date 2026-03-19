/*
 * Copyright Wazuh Inc.
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React, { useEffect, useState, useRef } from 'react';
import { load } from 'js-yaml';
import {
  EuiCallOut,
  EuiCodeEditor,
  EuiCompressedFormRow,
  EuiLink,
  EuiSpacer,
  EuiText,
} from '@elastic/eui';
import FormFieldHeader from '../../../../../../components/FormFieldHeader';
import {
  mapRuleToYamlObject,
  mapYamlObjectToRule,
  mapYamlObjectToYamlString,
} from '../../../../utils/mappers';
import { Rule } from '../../../../../../../types';

export interface YamlRuleEditorComponentProps {
  rule: Rule;
  change: React.Dispatch<Rule>;
  isInvalid: boolean;
  errors?: string[];
  parseDebounceMs?: number;
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

  const timerRef = useRef<number | null>(null);
  const isFocusedRef = useRef(false);

  useEffect(() => {
    const newYaml = mapYamlObjectToYamlString(mapRuleToYamlObject(rule));
    setState((s) => {
      if (isFocusedRef.current) return s;
      if (s.value === newYaml) return s;
      return { ...s, value: newYaml };
    });
  }, [rule]);

  const tryParseAndNotify = (value: string) => {
    if (!value || value.trim() === '') {
      setState((prev) => ({ ...prev, errors: ['Rule cannot be empty'] }));
      return;
    }
    try {
      const yamlObj = load(value);
      const parsedRule = mapYamlObjectToRule(yamlObj);
      change(parsedRule);
      setState((prev) => ({ ...prev, errors: null }));
    } catch (err) {
      setState((prev) => ({ ...prev, errors: ['Invalid YAML'] }));
      console.warn('Security Analytics - Rule Editor - Yaml load', err);
    }
  };

  const onChange = (value: string) => {
    setState((prev) => ({ ...prev, value }));
    if (timerRef.current) window.clearTimeout(timerRef.current);
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
    const callout = (errs: string[]) => (
      <EuiCallOut size="m" color="danger" title="Please address the highlighted errors.">
        <ul>
          {errs.map((error, i) => (
            <li key={i}>{error}</li>
          ))}
        </ul>
      </EuiCallOut>
    );

    if (state.errors && state.errors.length > 0) return callout(state.errors);
    if (isInvalid && errors && errors.length > 0) return callout(errors);
    return null;
  };

  return (
    <>
      {renderErrors()}
      <EuiSpacer size="s" />
      <EuiCompressedFormRow
        label={<FormFieldHeader headerTitle={'Define rule in YAML'} />}
        fullWidth
      >
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
            onFocus={onFocus}
            data-test-subj={'rule_yaml_editor'}
          />
        </>
      </EuiCompressedFormRow>
    </>
  );
};
