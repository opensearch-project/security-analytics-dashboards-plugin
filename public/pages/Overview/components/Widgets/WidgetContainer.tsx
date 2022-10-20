/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiFlexItem } from '@elastic/eui';
import { ContentPanel } from '../../../../components/ContentPanel';
import React from 'react';

export const WidgetContainer: React.FC<{ title: string; actions?: React.ReactNode[] }> = ({
  title,
  actions,
  children,
}) => {
  return (
    <EuiFlexItem className="grid-item">
      <ContentPanel titleSize="s" title={title} actions={actions}>
        {children}
      </ContentPanel>
    </EuiFlexItem>
  );
};
