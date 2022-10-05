import React, { Fragment } from 'react';
import { EuiTabbedContent, EuiText, EuiSpacer } from '@elastic/eui';
import { Table } from './Table';

export const Home = () => {
  const tabs = [
    {
      id: 'view--id',
      name: 'View Rules',
      content: (
        <Fragment>
          <Table />
        </Fragment>
      ),
    },
    {
      id: 'detection--id',
      name: 'Detection Rules',
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
        onTabClick={(tab) => {}}
      />
    </div>
  );
};
