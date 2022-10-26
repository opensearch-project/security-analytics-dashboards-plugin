/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import AceEditor from 'react-ace';

export const YAML = (props: any) => {
  const onEditorChange = (Value: string) => {
    console.log('VALUE', Value);
  };

  let importedDetectionValue = `
  title: ${props.props.title}
  status: ${props.props.status}
  description: ${props.props.description}
  author: ${props.props.author}
  references:
  date:
  logsource:
    category:
  detection
    selection:
    Signature|contains:
      - DumpCreds
    condition: selection
  fields:
    - FileName
    - User
  falsepositives:
    - Unlikely
  tags:
    - attack.credential_access
    - attack.t1003
    - attack.t1558
    - attack.t1003.001
    - attack.t1003.002
  `;

  return (
    <div>
      <AceEditor
        width="100%"
        name="ruleDetection"
        mode="yaml"
        theme="github"
        onChange={onEditorChange}
        value={importedDetectionValue}
      />
    </div>
  );
};
