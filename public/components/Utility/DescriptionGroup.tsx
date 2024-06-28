/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiDescriptionList,
  EuiFlexGroup,
  EuiFlexGroupProps,
  EuiFlexItem,
  EuiFlexItemProps,
} from '@elastic/eui';
import React from 'react';

export interface DescriptionGroupProps {
  listItems: { title: NonNullable<React.ReactNode>; description: NonNullable<React.ReactNode> }[];
  itemProps?: Pick<EuiFlexItemProps, 'grow'>;
  groupProps?: Pick<EuiFlexGroupProps, 'justifyContent'>;
}

export const DescriptionGroup: React.FC<DescriptionGroupProps> = ({
  listItems,
  itemProps,
  groupProps,
}) => {
  return (
    <EuiFlexGroup gutterSize="s" {...groupProps}>
      {listItems.map((item, idx) => (
        <EuiFlexItem {...itemProps} key={`item-${idx}`}>
          <EuiDescriptionList listItems={[item]} />
        </EuiFlexItem>
      ))}
    </EuiFlexGroup>
  );
};
