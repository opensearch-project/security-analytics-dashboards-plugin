/*
 * Copyright Wazuh Inc.
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import { EuiHealth } from '@elastic/eui';

interface EnabledHealthProps {
  enabled: boolean | undefined;
  'data-test-subj'?: string;
}

export const EnabledHealth: React.FC<EnabledHealthProps> = ({
  enabled,
  'data-test-subj': testSubj,
}) => (
  <div data-test-subj={testSubj}>
    <EuiHealth color={enabled !== false ? 'success' : 'subdued'}>
      {enabled !== false ? 'Enabled' : 'Disabled'}
    </EuiHealth>
  </div>
);
