/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ContentPanel } from '../../../../../../components/ContentPanel';
import Edit from '../Edit';

export const Create = () => {
  return (
    <ContentPanel title={'Create a rule'}>
      <Edit type={'new'} />
    </ContentPanel>
  );
};
