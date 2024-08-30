/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiSmallButton } from '@elastic/eui';
import React from 'react';

export interface ConfigActionButtonProps {
  action: 'configure' | 'edit';
  actionHandler: () => void;
  disabled?: boolean;
}

export const ConfigActionButton: React.FC<ConfigActionButtonProps> = ({
  action,
  disabled,
  actionHandler,
}) => {
  let buttonText;

  switch (action) {
    case 'configure':
      buttonText = 'Configure scan';
      break;
    case 'edit':
      buttonText = 'Edit scan configuration';
      break;
    default:
      buttonText = '';
  }

  return buttonText ? (
    <EuiSmallButton onClick={actionHandler} disabled={disabled}>
      {buttonText}
    </EuiSmallButton>
  ) : null;
};
