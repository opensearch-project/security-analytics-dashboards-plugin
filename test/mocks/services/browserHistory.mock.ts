/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { RouteComponentProps } from 'react-router-dom';

export default ({
  replace: jest.fn(),
  listen: jest.fn(),
  location: {
    pathname: '',
  },
  push: jest.fn(),
} as unknown) as RouteComponentProps['history'];
