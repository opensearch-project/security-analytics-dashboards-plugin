import React, { Fragment } from 'react';
import { EuiTabbedContent, EuiText, EuiSpacer } from '@elastic/eui';
import { Tables } from './Tables';

export const Home = () => {
  const tabs = [
    {
      id: 'view--id',
      name: 'View Rules',
      content: (
        <Fragment>
          <Tables />
        </Fragment>
      ),
    },
    {
      id: 'manage--id',
      name: 'Manage Rules',
      content: (
        <Fragment>
          <EuiSpacer />
          <EuiText>
            <p>
              Intravenous sugar solution, also known as dextrose solution, is a mixture of dextrose
              (glucose) and water. It is used to treat low blood sugar or water loss without
              electrolyte loss.
            </p>
          </EuiText>
        </Fragment>
      ),
    },
  ];

  return (
    <div>
      <EuiTabbedContent
        tabs={tabs}
        initialSelectedTab={tabs[0]}
        autoFocus="selected"
        onTabClick={(tab) => {
          console.log('clicked tab', tab);
        }}
      />
    </div>
  );
};
