/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EuiIcon, EuiText, EuiToolTip, IconType, ToolTipPositions } from '@elastic/eui';

export interface FormFieldHeaderProps {
  headerTitle: string;
  optionalField?: boolean;
  toolTipIconType?: IconType;
  toolTipPosition?: ToolTipPositions;
  toolTipText?: string;
}

export const FormFieldHeader = ({
  headerTitle = '',
  optionalField = false,
  toolTipIconType = 'questionInCircle',
  toolTipPosition = 'top',
  toolTipText = '',
}: FormFieldHeaderProps): JSX.Element => {
  return (
    <EuiText size={'s'}>
      <strong>{headerTitle}</strong>
      {optionalField && <i> - optional </i>}
      {toolTipText.length > 0 && (
        <EuiToolTip position={toolTipPosition} content={toolTipText}>
          <EuiIcon type={toolTipIconType} />
        </EuiToolTip>
      )}
    </EuiText>
  );
};
