/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiCodeBlock } from '@elastic/eui';
import React from 'react';
import { mapRuleToYamlObject, mapYamlObjectToYamlString } from '../../utils/mappers';
import { Rule } from '../../../../../types';

export interface RuleContentYamlViewerProps {
  rule: Rule;
}

export const RuleContentYamlViewer: React.FC<RuleContentYamlViewerProps> = ({ rule }) => {
  const yamlObject = mapRuleToYamlObject(rule);
  const ruleYaml = mapYamlObjectToYamlString(yamlObject);

  return (
    <EuiCodeBlock language="yaml" data-test-subj={'rule_flyout_yaml_rule'} isCopyable={true}>
      {ruleYaml}
    </EuiCodeBlock>
  );
};
