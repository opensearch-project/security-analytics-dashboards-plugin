/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, Fragment } from 'react';
import { Visual } from './Visual';
import { YAML } from './YAML';
import { EuiButtonGroup, EuiSpacer } from '@elastic/eui';

export const Create = () => {
  const [toggleIdSelected, setToggleIdSelected] = useState('visual');

  const toggleButtons = [
    {
      id: 'visual',
      label: 'Visual Editor',
    },
    {
      id: 'yaml',
      label: 'YAML Editor',
    },
  ];

  const onChange = (optionId: any) => {
    setToggleIdSelected(optionId);
  };

  console.log(toggleIdSelected);

  return (
    <div>
      <Fragment>
        <EuiButtonGroup
          legend="This is a basic group"
          options={toggleButtons}
          idSelected={toggleIdSelected}
          onChange={(id) => onChange(id)}
        />
        <EuiSpacer size="m" />
      </Fragment>

      {toggleIdSelected === 'visual' && <Visual />}
      {toggleIdSelected === 'yaml' && <YAML />}
    </div>
  );
};
