/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiCodeBlock } from '@elastic/eui';
import React from 'react';
import { mapRuleToYamlObject, mapYamlObjectToYamlString } from '../../utils/mappers';
import { Rule } from '../../../../../models/interfaces';

export interface RuleContentYamlViewerProps {
  rule: Rule;
}

export const RuleContentYamlViewer: React.FC<RuleContentYamlViewerProps> = ({ rule }) => {
  const yamlObject = mapRuleToYamlObject(rule);
  yamlObject.id = '25b9c01c-350d-4b95-bed1-836d04a4f324';
  const ruleYaml = mapYamlObjectToYamlString(yamlObject);

  return (
    <EuiCodeBlock language="yaml" data-test-subj={'rule_flyout_yaml_rule'}>
      {ruleYaml}
    </EuiCodeBlock>
  );
};
