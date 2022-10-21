/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { View } from '../../containers/Rules/components/View';
import {
  EuiModal,
  EuiModalFooter,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiButton,
  EuiConfirmModal,
  EuiFlexGroup,
  EuiFlexItem,
  EuiTitle,
  EuiFlyout,
  EuiFlyoutBody,
  EuiFlyoutHeader,
  EuiFlyoutFooter,
} from '@elastic/eui';

export default function Modal(props: any) {
  const { close, content, type, ruleType } = props;

  return (
    <EuiFlyout onClose={close} style={{ width: 800 }}>
      <EuiFlyoutHeader hasBorder>
        <EuiTitle size="m">
          <h3>{content.title}</h3>
        </EuiTitle>
      </EuiFlyoutHeader>
      <EuiFlyoutBody>
        {type === 'view' && <View content={content} ruleType={ruleType} />}
      </EuiFlyoutBody>
      <EuiFlyoutFooter>
        <EuiFlexGroup direction="row" justifyContent="flexEnd">
          <EuiFlexItem grow={false}>
            <EuiButton onClick={close} fill style={{ marginRight: '25px' }}>
              Close
            </EuiButton>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiFlyoutFooter>
    </EuiFlyout>
  );
}
