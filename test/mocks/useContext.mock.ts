/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

const context = {
  chrome: {
    setBreadcrumbs: jest.fn(),
  },
};

export default React.createContext(context);
