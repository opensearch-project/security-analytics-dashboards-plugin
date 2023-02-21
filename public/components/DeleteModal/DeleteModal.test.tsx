/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render } from '@testing-library/react';
import DeleteModal from './DeleteModal';

describe('<DeleteModal /> spec', () => {
  it('renders the component', () => {
    const tree = render(
      <DeleteModal
        closeDeleteModal={() => jest.fn()}
        ids={'some ids'}
        onClickDelete={() => jest.fn()}
        type={'some type'}
      />
    );

    expect(tree).toMatchSnapshot();
  });
});
