import React, { useState } from 'react';
import { Visual } from './Visual';
import { YAML } from './YAML';
import { EuiButton } from '@elastic/eui';

export const Form = () => {
  const [visualEditor, setVisualEditor] = useState<boolean>(true);
  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        <div style={{ marginRight: '15px' }}>
          <EuiButton color="primary" onClick={() => setVisualEditor(true)}>
            Visual Editor
          </EuiButton>
        </div>
        <div>
          <EuiButton color="secondary" onClick={() => setVisualEditor(false)}>
            YAML Editor
          </EuiButton>
        </div>
      </div>

      {visualEditor && <Visual />}
      {!visualEditor && <YAML />}
    </div>
  );
};
