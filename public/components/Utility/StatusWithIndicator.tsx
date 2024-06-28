/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiIcon } from '@elastic/eui';
import React from 'react';

export interface StatusWithIndicatorProps {
  text: string;
  indicatorColor: 'success' | 'text';
}

export const StatusWithIndicator: React.FC<StatusWithIndicatorProps> = ({
  text,
  indicatorColor,
}) => {
  return (
    <span>
      <EuiIcon type={'dot'} color={indicatorColor} style={{ marginBottom: 4 }} /> {text}
    </span>
  );
};
