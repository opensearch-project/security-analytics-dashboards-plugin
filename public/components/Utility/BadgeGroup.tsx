/*
 * Copyright Wazuh Inc.
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {
  EuiBadge,
  EuiFlexGroup,
  EuiFlexItem,
  EuiSpacer,
  EuiText,
} from '@elastic/eui';
import { DEFAULT_EMPTY_DATA } from '../../utils/constants';

interface BadgeGroupProps {
  label?: string;
  values: string[] | React.ReactNode;
  emptyValue?: React.ReactNode;
}

export const BadgeGroup: React.FC<BadgeGroupProps> = ({ label, values, emptyValue = null }) => {
  if (!values?.length) return emptyValue;
  return (
    <div>
      {label ?
        <EuiText size="xs" color="subdued">
          <strong>{label}</strong>
        </EuiText> : null
      }
      <EuiSpacer size="xs" />
      <EuiFlexGroup gutterSize="xs" wrap responsive={false}>
        {values?.length ?
          values.map((v, i) => (
            <EuiFlexItem grow={false} key={i}>
              <EuiBadge>{v}</EuiBadge>
            </EuiFlexItem>
          )) : <EuiFlexItem grow={false}>
            {DEFAULT_EMPTY_DATA}
          </EuiFlexItem>}
      </EuiFlexGroup>
    </div>
  );
};