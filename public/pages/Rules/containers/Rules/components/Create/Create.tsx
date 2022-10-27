/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ContentPanel } from '../../../../../../components/ContentPanel';
import Edit from '../Edit';
import { ROUTES } from '../../../../../../utils/constants';
import { EuiIcon, EuiFlexGroup, EuiButton } from '@elastic/eui';
import { RouteComponentProps } from 'react-router-dom';

export const Create = ({ history }: RouteComponentProps) => {
  const historyData: any = history.location.state;

  return (
    <ContentPanel
      title={`${historyData ? historyData.mode : 'Create'} a rule`}
      actions={[
        <EuiIcon
          onClick={() => {
            history.push(ROUTES.RULES);
          }}
          type="cross"
        />,
      ]}
    >
      <Edit
        onCreate={() => {
          history.push(ROUTES.RULES);
        }}
      />
    </ContentPanel>
  );
};
