/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render } from '@testing-library/react';
import props from '../../../../../test/mocks/Detectors/components/UpdateFieldMappings/UpdateFieldMappings.mock';
import { expect } from '@jest/globals';
import UpdateFieldMappings from './UpdateFieldMappings';
import { coreContextMock } from '../../../../../test/mocks/useContext.mock';
import { setupCoreStart } from '../../../../../test/utils/helpers';

beforeAll(() => {
  setupCoreStart();
});

jest.mock('../../containers/FieldMappings/EditFieldMapping.tsx', () => () => {
  return <mock-component mock="EditFieldMapping" />;
});

describe('<UpdateFieldMappings /> spec', () => {
  it('renders the component', () => {
    UpdateFieldMappings.contextType = React.createContext(coreContextMock);
    const view = render(<UpdateFieldMappings {...props} />);
    expect(view).toMatchSnapshot();
  });
});
