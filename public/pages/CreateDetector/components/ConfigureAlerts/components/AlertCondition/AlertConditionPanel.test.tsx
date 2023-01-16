/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render } from '@testing-library/react';
import AlertConditionPanel from "./AlertConditionPanel";
import { modelsMock } from "../../../../../../../test/mocks";

describe('<AlertConditionPanel /> spec', () => {
  it('renders the component', () => {
    const { alertConditionMock } = modelsMock;

    const tree = render(
      <AlertConditionPanel
        alertCondition={ alertConditionMock }
        allNotificationChannels={}
      />
    );
    expect(tree).toMatchSnapshot();
  });
});
