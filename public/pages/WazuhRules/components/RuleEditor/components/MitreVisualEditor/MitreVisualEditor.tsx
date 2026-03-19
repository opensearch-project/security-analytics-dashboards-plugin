/*
 * Copyright Wazuh Inc.
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React, { useEffect } from 'react';
import { EuiCodeEditor } from '@elastic/eui';

const MITRE_EXAMPLE = `tactic:
  - ""
technique:
  - ""
subtechnique:
  - ""
`;

export interface MitreVisualEditorProps {
  mitreYml: string;
  onChange: (yml: string) => void;
}

export const MitreVisualEditor: React.FC<MitreVisualEditorProps> = ({ mitreYml, onChange }) => {
  useEffect(() => {
    if (!mitreYml) {
      onChange(MITRE_EXAMPLE);
    }
  }, []);

  return (
    <EuiCodeEditor
      mode="yaml"
      width="600px"
      height="200px"
      value={mitreYml || MITRE_EXAMPLE}
      onChange={onChange}
      setOptions={{ fontSize: '12px' }}
    />
  );
};
