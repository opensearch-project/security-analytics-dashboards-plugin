/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  EuiCallOut,
  EuiSpacer,
  EuiFlexGroup,
  EuiFlexItem,
  EuiButtonIcon,
  EuiLoadingSpinner,
} from '@elastic/eui';

export type TCalloutColor = 'primary' | 'success' | 'warning' | 'danger';
export type TCalloutIcon = 'iInCircle' | 'check' | 'help' | 'alert';

interface ICalloutType {
  color: TCalloutColor;
  iconType: TCalloutIcon;
}

export interface ICalloutProps {
  title: string | JSX.Element;
  message?: string | JSX.Element;
  type?: ICalloutType | TCalloutColor;
  closable?: boolean;
  loading?: boolean;
  closeHandler?: (callout?: ICalloutProps) => void;
}

export const CallOut = ({
  title,
  message,
  type,
  closable = true,
  loading = false,
  closeHandler,
}: ICalloutProps) => {
  const toastTypes: {
    [Key in TCalloutColor]: TCalloutIcon;
  } = {
    primary: 'iInCircle',
    success: 'check',
    warning: 'help',
    danger: 'alert',
  };

  const resolveType = (type?: ICalloutType | TCalloutColor): ICalloutType => {
    if (type === undefined) {
      return {
        color: 'primary',
        iconType: 'iInCircle',
      };
    } else {
      if (typeof type === 'string') {
        return {
          color: type,
          iconType: toastTypes[type],
        };
      } else {
        return type;
      }
    }
  };

  const closeCallout = () => closeHandler && closeHandler(undefined);

  const getTitle = (): JSX.Element => {
    return (
      <EuiFlexGroup>
        {loading ? (
          <EuiFlexItem grow={false}>
            <EuiLoadingSpinner size="l" />
          </EuiFlexItem>
        ) : null}
        <EuiFlexItem grow={false}>{title}</EuiFlexItem>
        {closable ? (
          <EuiFlexItem className={'mainCalloutCloseButton'}>
            <EuiButtonIcon onClick={() => closeCallout()} iconType="cross" aria-label="Close" />
          </EuiFlexItem>
        ) : null}
      </EuiFlexGroup>
    );
  };

  const { color, iconType } = resolveType(type);
  return (
    <>
      <EuiCallOut
        title={getTitle()}
        color={color}
        iconType={!loading ? iconType : undefined}
        className={'mainCallout'}
      >
        {message ? <p>{message}</p> : null}
      </EuiCallOut>

      <EuiSpacer size="m" />
    </>
  );
};

export default CallOut;
