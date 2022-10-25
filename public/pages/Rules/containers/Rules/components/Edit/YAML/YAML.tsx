/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import AceEditor from 'react-ace';

export const YAML = () => {
  const onEditorChange = (Value: string) => {
    console.log('VALUE', Value);
  };

  return (
    <div>
      <AceEditor
        width="100%"
        name="ruleDetection"
        mode="yaml"
        theme="github"
        onChange={onEditorChange}
        // value={importedDetectionValue}
      />
    </div>
  );
};
