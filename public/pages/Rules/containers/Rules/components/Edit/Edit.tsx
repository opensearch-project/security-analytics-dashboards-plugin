/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, Fragment } from 'react';
import Visual from './Visual';
import YAML from './YAML';
import { ROUTES } from '../../../../../../utils/constants';
import { EuiButtonGroup, EuiSpacer, EuiFlexGroup, EuiButton } from '@elastic/eui';
import { useHistory } from 'react-router-dom';

export const Edit = (props: any) => {
  const [toggleIdSelected, setToggleIdSelected] = useState('visual');
  const history = useHistory();

  const visualProps = props;

  let ruleProps = {
    props,
    editProps: history.location.state,
  };

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
      {toggleIdSelected === 'visual' && <Visual props={ruleProps} />}
      {toggleIdSelected === 'yaml' && <YAML props={visualProps} />}
      <div style={{ marginTop: '50px' }}>
        <EuiFlexGroup direction="row" justifyContent="flexEnd">
          <div style={{ marginRight: '10px' }}>
            <EuiButton
              onClick={() => {
                history.push(ROUTES.RULES);
              }}
            >
              Cancel
            </EuiButton>
          </div>
          <div style={{ marginRight: '10px' }}>
            <EuiButton
              type="submit"
              fill
              form="editForm"
              // onClick={() => {history.push(ROUTES.RULES) }}
              // disabled={!Boolean(Object.keys(Formikprops.errors).length === 0)}
            >
              Create
            </EuiButton>
          </div>
        </EuiFlexGroup>
      </div>
    </div>
  );
};
