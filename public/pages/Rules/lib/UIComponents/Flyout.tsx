import React, { useState } from 'react';
import { EuiTitle, EuiFlyout, EuiFlyoutBody, EuiFlyoutHeader } from '@elastic/eui';

export const Flyout = (props: any) => {
  const [Flyout, showFlyout] = useState<boolean>(false);
  const { content, body, type } = props;

  let flyout;

  const showFlyoutFunc = () => {
    showFlyout(true);
  };
  const closeFlyoutFunc = () => {
    showFlyout(false);
  };

  if (Flyout) {
    flyout = (
      <EuiFlyout ownFocus onClose={closeFlyoutFunc}>
        <EuiFlyoutHeader hasBorder>
          <EuiTitle size="m">
            <h3>Title</h3>
          </EuiTitle>
        </EuiFlyoutHeader>
        <EuiFlyoutBody></EuiFlyoutBody>
      </EuiFlyout>
    );
  }

  return <div>{flyout}</div>;
};
