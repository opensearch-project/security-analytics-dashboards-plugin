/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render } from '@testing-library/react';
import { AlertFlyout } from "./AlertFlyout";
import { browserServicesMock, modelsMock } from "../../../../../test/mocks";

describe('<AlertFlyout /> spec', () => {
  const { findingsService, ruleService } = browserServicesMock;
  const { alertItemMock, detectorMock } = modelsMock;

  it('renders the component', () => {
    const { container } = render(<AlertFlyout
      alertItem={ alertItemMock }
      detector={ detectorMock }
      findingsService={ findingsService }
      ruleService={ ruleService }
      notifications={}
      onAcknowledge={}
      onClose={}
      opensearchService={}
    />);
    expect(container).toMatchSnapshot();
  });
});
