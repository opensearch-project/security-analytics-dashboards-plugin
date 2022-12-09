/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiCodeBlock } from '@elastic/eui';
import React from 'react';

export interface RuleContentYamlViewerProps {
  ruleYaml: string;
}

export const RuleContentYamlViewer: React.FC<RuleContentYamlViewerProps> = ({ ruleYaml }) => {
  return (
    <EuiCodeBlock language="yaml" data-test-subj={'rule_flyout_yaml_rule'}>
      {ruleYaml}
    </EuiCodeBlock>
  );
};
