/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { MouseEventHandler } from 'react';
import { EuiSmallButton, EuiFlexGroup, EuiFlexItem, EuiSpacer, EuiText } from '@elastic/eui';
import { EuiButtonPropsForButton } from '@elastic/eui/src/components/button/button';

interface GetStartedStepButton {
  text: string;
  opts?: EuiButtonPropsForButton;
  onClick: MouseEventHandler<HTMLButtonElement>;
}

interface GetStartedStepProps {
  buttons: Array<GetStartedStepButton>;
  title: string;
}

export const GetStartedStep: React.FC<GetStartedStepProps> = ({ buttons, title }) => {
  return (
    <div>
      <EuiText>
        <p>{title}</p>
      </EuiText>
      <EuiSpacer size="s" />
      <EuiFlexGroup gutterSize="s">
        {buttons.map((btn: GetStartedStepButton, index: number) => (
          <EuiFlexItem grow={false} key={index}>
            <EuiSmallButton {...btn.opts} onClick={btn.onClick}>
              {btn.text}
            </EuiSmallButton>
          </EuiFlexItem>
        ))}
      </EuiFlexGroup>
    </div>
  );
};
