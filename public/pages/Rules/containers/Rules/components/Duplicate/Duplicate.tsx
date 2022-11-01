/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ContentPanel } from '../../../../../../components/ContentPanel';
import { useHistory } from 'react-router-dom';
import Edit from '../Edit';
import { ROUTES } from '../../../../../../utils/constants';
import { EuiIcon, EuiFlexGroup, EuiButton } from '@elastic/eui';

export const Duplicate = () => {
  const history = useHistory();
  return (
    <ContentPanel
      title={'Duplicate a rule'}
      actions={[
        <EuiIcon
          onClick={() => {
            history.push('/rules');
          }}
          type="cross"
        />,
      ]}
    >
      <Edit type={'duplicate'} />
      <EuiFlexGroup direction="row" justifyContent="flexEnd">
        <div style={{ marginRight: '10px' }}>
          <EuiButton href={`#${ROUTES.RULES}/`}>Cancel</EuiButton>
        </div>
        <div style={{ marginRight: '10px' }}>
          <EuiButton type="submit" fill form="editForm">
            Duplicate
          </EuiButton>
        </div>
      </EuiFlexGroup>
    </ContentPanel>
  );
};
