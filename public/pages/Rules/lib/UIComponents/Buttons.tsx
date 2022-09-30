import React from 'react';
import { EuiButton } from '@elastic/eui';

export const PrimaryButton = (props: any) => {
  const { click, btnName } = props;
  return (
    <EuiButton
      color="primary"
      fill
      // isDisabled={value === 'disabled' ? true : false}
      onClick={() => {
        click();
      }}
    >
      {btnName}
    </EuiButton>
  );
};
