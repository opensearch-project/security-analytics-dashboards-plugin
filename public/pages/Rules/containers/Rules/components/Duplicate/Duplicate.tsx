/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ContentPanel } from '../../../../../../components/ContentPanel';
import { useHistory } from 'react-router-dom';
import Edit from '../Edit';
import { EuiIcon } from '@elastic/eui';

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
    </ContentPanel>
  );
};
