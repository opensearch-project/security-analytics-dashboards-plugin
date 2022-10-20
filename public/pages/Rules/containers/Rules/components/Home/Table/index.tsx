import React, { Fragment } from 'react';
import { SigmaTable } from '../../Tables/SIGMA';
import _ from 'lodash';
import { EuiText, EuiFlexGroup, EuiFlexItem, EuiSpacer, EuiPanel } from '@elastic/eui';

export const Table = () => {
  return (
    <Fragment>
      <EuiPanel paddingSize="l">
        <EuiFlexGroup>
          <EuiFlexItem grow={5}>
            <SigmaTable />
            <EuiSpacer />
            <div style={{ display: 'flex', justifyContent: 'center' }}></div>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiPanel>
    </Fragment>
  );
};
