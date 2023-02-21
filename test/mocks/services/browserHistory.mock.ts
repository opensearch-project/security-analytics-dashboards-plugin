/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

export default ({
  replace: jest.fn(),
  listen: jest.fn(),
  location: {
    pathname: '',
  },
} as unknown) as History;
