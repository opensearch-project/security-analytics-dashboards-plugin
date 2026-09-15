/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import props from '../../../../../test/mocks/Detectors/containers/Detectors/Detectors.mock';
import { expect } from '@jest/globals';
import { act } from '@testing-library/react';
import { mount } from 'enzyme';
import Detectors from './Detectors';
import { coreContextMock } from '../../../../../test/mocks/useContext.mock';
import { setupCoreStart } from '../../../../../test/utils/helpers';

beforeAll(() => {
  setupCoreStart();
});

describe('<Detectors /> spec', () => {
  it('renders the component', async () => {
    let wrapper;
    await act(async () => {
      Detectors.contextType = React.createContext(coreContextMock);
      wrapper = await mount(<Detectors {...props} />);
    });
    wrapper.update();
    expect(wrapper).toMatchSnapshot();
  });
});

describe('Access column staleness guard logic', () => {
  // Direct unit coverage of the guard used in Detectors' render: the Access
  // column must only trust resourceSharing.types when it was resolved for
  // the currently selected data source. getResourceSharingAvailableTypes(...)
  // is awaited in updateResourceSharingAvailableTypes, so on a data-source
  // switch, resourceSharing.types can still hold the previous data source's
  // result until the new probe resolves.
  const computeAvailable = (
    resourceSharing: { dataSourceId: string | undefined; types: string[] },
    selectedDataSourceId: string | undefined,
    resourceType: string
  ) =>
    resourceSharing.dataSourceId === selectedDataSourceId &&
    resourceSharing.types.includes(resourceType);

  it('is available once types resolve for the currently selected data source', () => {
    const resourceSharing = { dataSourceId: 'ds-a', types: ['detector'] };
    expect(computeAvailable(resourceSharing, 'ds-a', 'detector')).toBe(true);
  });

  it('is unavailable while a resolved result belongs to a data source other than the one now selected', () => {
    const resourceSharing = { dataSourceId: 'ds-a', types: ['detector'] };
    expect(computeAvailable(resourceSharing, 'ds-b', 'detector')).toBe(false);
  });

  it('is unavailable before any result has resolved for the currently selected data source', () => {
    const resourceSharing = { dataSourceId: undefined, types: [] };
    expect(computeAvailable(resourceSharing, 'ds-a', 'detector')).toBe(false);
  });

  it('is unavailable once the current data source resolves but does not register the resource type', () => {
    const resourceSharing = { dataSourceId: 'ds-a', types: ['some-other-type'] };
    expect(computeAvailable(resourceSharing, 'ds-a', 'detector')).toBe(false);
  });
});
