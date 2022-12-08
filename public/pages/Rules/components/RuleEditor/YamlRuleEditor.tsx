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
    if (!rule.detection) {
      const { detection, ...ruleWithoutDetection } = rule;
      return dump(ruleWithoutDetection);
    } else {
      return dump(rule);
    }
  } catch (error: any) {
    console.warn('Security Analytics - Rule Eritor - Yaml dump', error);
    return '';
  }
};

const mapRuleToYamlObject = (rule: Rule): any => {
  let detection = undefined;
  if (rule.detection) {
    try {
      detection = load(rule.detection);
    } catch {}
  }

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
    detection,
  };

  return yamlObject;
};

const mapYamlObjectToRule = (obj: any): Rule => {
  let detection = '';
  if (obj.detection) {
    try {
      detection = dump(obj.detection);
    } catch {}
  }
  const rule: Rule = {
    id: obj.id,
    category: obj.logsource ? obj.logsource.product : undefined,
    log_source: '',
    title: obj.title,
    description: obj.description,
    tags: obj.tags ? obj.tags.map((tag: string) => ({ value: tag })) : undefined,
    false_positives: obj.falsepositives
      ? obj.falsepositives.map((falsePositive: string) => ({ value: falsePositive }))
      : undefined,
    level: obj.level,
    status: obj.status,
    references: obj.references
      ? obj.references.map((reference: string) => ({ value: reference }))
      : undefined,
    author: obj.author,
    detection,
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
            data-test-subj={'rule_yaml_editor'}
          />
        </>
      </EuiFormRow>
    </>
  );
};
