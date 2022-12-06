/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { dump, load } from 'js-yaml';
import { EuiFormRow, EuiCodeEditor, EuiLink, EuiSpacer, EuiText } from '@elastic/eui';
import FormFieldHeader from '../../../../components/FormFieldHeader';
import { Rule } from '../../../../../models/interfaces';

export interface YamlRuleEditorProps {
  rule: Rule;
  change: React.Dispatch<Rule>;
}

export interface YamlEditorState {
  error: string | null;
  value?: string;
}

const mapYamlObjectToYamlString = (rule: Rule): string => {
  try {
    const yamlString = dump(rule);

    return yamlString;
  } catch (error: any) {
    console.warn('Security Analytics - Rule Eritor - Yaml dump', error);
    return '';
  }
};

const mapRuleToYamlObject = (rule: Rule): any => {
  const yamlObject: any = {
    id: rule.id,
    logsource: { product: rule.category },
    title: rule.title,
    description: rule.description,
    tags: rule.tags.map((tag) => tag.value),
    falsepositives: rule.false_positives.map((falsePositive) => falsePositive.value),
    level: rule.level,
    status: rule.status,
    references: rule.references.map((reference) => reference.value),
    author: rule.author,
    detection: load(rule.detection),
  };

  return yamlObject;
};

const mapYamlObjectToRule = (obj: any): Rule => {
  const rule: Rule = {
    id: obj.id,
    category: obj.logsource.product,
    log_source: '',
    title: obj.title,
    description: obj.description,
    tags: obj.tags.map((tag: string) => ({ value: tag })),
    false_positives: obj.falsepositives.map((falsePositive: string) => ({ value: falsePositive })),
    level: obj.level,
    status: obj.status,
    references: obj.references.map((reference: string) => ({ value: reference })),
    author: obj.author,
    detection: dump(obj.detection),
  };

  return rule;
};

export const YamlRuleEditor: React.FC<YamlRuleEditorProps> = ({ rule, change }) => {
  const yamlObject = mapRuleToYamlObject(rule);

  const [state, setState] = useState<YamlEditorState>({
    error: null,
    value: mapYamlObjectToYamlString(yamlObject),
  });

  const onChange = (value: string) => {
    setState((prevState) => ({ ...prevState, value }));
  };

  const onBlur = () => {
    if (!state.value) {
      setState((prevState) => ({ ...prevState, error: 'Required Field' }));
      return;
    }
    try {
      const yamlObject = load(state.value);

      const rule = mapYamlObjectToRule(yamlObject);

      console.log('onBlur rule load', yamlObject, rule);
      change(rule);
      setState((prevState) => ({ ...prevState, error: null }));
    } catch (error) {
      setState((prevState) => ({ ...prevState, error: 'Invalid YAML' }));

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
          {state.error && (
            <EuiText size="s" color="danger">
              {state.error}
            </EuiText>
          )}
          <EuiCodeEditor
            mode="yaml"
            width="100%"
            value={state.value}
            onChange={onChange}
            onBlur={onBlur}
            data-test-subj={'rule_detection_field'}
          />
        </>
      </EuiFormRow>
    </>
  );
};
