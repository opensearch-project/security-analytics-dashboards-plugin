import React, { useState } from 'react';
import { Add } from '../../containers/Rules/components/Visual';
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
} from '@elastic/eui';

export default function Modal(props: any) {
  const { close, modalContent, type, ruleType } = props;

  return (
    <EuiModal onClose={close} style={{ width: 800 }}>
      {type === 'view' && <View modalContent={modalContent} ruleType={ruleType} />}
      <EuiModalFooter>
        <EuiButton onClick={close} fill style={{ marginRight: '25px' }}>
          Close
        </EuiButton>
      </EuiModalFooter>
    </EuiModal>
  );
}
