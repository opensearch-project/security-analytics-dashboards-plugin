/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { act } from '@testing-library/react';
import { RuleEditorForm } from './RuleEditorForm';
import RuleEditorFormMock from '../../../../../test/mocks/Rules/components/RuleEditor/RuleEditorForm.mock';
import { DataStore } from '../../../../store/DataStore';
import { mockContexts } from '../../../../../test/mocks/useContext.mock';
import { notificationsMock } from '../../../../../test/mocks/services';
import { ReactWrapper, mount } from 'enzyme';
import { expect } from '@jest/globals';

describe('<RuleEditorForm /> spec', () => {
  it('renders the component', async () => {
    DataStore.init(mockContexts.services as any, notificationsMock.NotificationsStart);
    jest.spyOn(DataStore.logTypes, 'getLogTypes');
    const treeObj: { wrapper?: ReactWrapper } = { wrapper: undefined };
    await act(async () => {
      treeObj.wrapper = await mount(<RuleEditorForm {...RuleEditorFormMock} />);
    });
    treeObj.wrapper?.update();
    expect(treeObj.wrapper).toMatchSnapshot();
  });
});
