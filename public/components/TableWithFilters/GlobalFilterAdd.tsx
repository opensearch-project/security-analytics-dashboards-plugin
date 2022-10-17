/*
 * SPDX-License-Identifier: Apache-2.0
 *
 * The OpenSearch Contributors require contributions made to
 * this file be licensed under the Apache-2.0 license or a
 * compatible open source license.
 *
 * Modifications Copyright OpenSearch Contributors. See
 * GitHub history for details.
 */

import React, { useState } from 'react';

import {
  EuiButtonEmpty,
  EuiPopover,
  EuiPopoverTitle,
  EuiFlexGroup,
  EuiFlexItem,
} from '@elastic/eui';

import GlobalFilterForm from './GlobalFilterForm';

export default () => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const togglePopover = () => {
    setIsPopoverOpen(!isPopoverOpen);
  };

  const closePopover = () => {
    setIsPopoverOpen(false);
  };

  return (
    <EuiPopover
      isOpen={isPopoverOpen}
      closePopover={closePopover}
      button={
        <EuiButtonEmpty onClick={togglePopover} size="xs">
          + Add filter
        </EuiButtonEmpty>
      }
      anchorPosition="downCenter"
    >
      <EuiPopoverTitle>
        <EuiFlexGroup alignItems="baseline">
          <EuiFlexItem>Add a filter</EuiFlexItem>
          <EuiFlexItem grow={false}>
            {/* This button should open a modal */}
            <EuiButtonEmpty flush="right" size="xs">
              Edit as Query DSL
            </EuiButtonEmpty>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiPopoverTitle>

      <GlobalFilterForm style={{ width: 400 }} onAdd={togglePopover} onCancel={togglePopover} />
    </EuiPopover>
  );
};
