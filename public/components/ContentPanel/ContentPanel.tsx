/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiHorizontalRule,
  EuiPanel,
  EuiText,
  EuiSpacer,
} from '@elastic/eui';

interface ContentPanelProps {
  title?: string | JSX.Element;
  titleSize?: 'xs' | 's' | 'm';
  subTitleText?: string | JSX.Element;
  bodyStyles?: object;
  panelStyles?: object;
  actions?: React.ReactNode | React.ReactNode[];
  children: React.ReactNode | React.ReactNode[];
  hideHeaderBorder?: boolean;
  className?: string;
}

const renderSubTitleText = (subTitleText: string | JSX.Element): JSX.Element | null => {
  if (typeof subTitleText === 'string') {
    if (!subTitleText) return null;
    return (
      <EuiText size="s" color="subdued">
        {subTitleText}
      </EuiText>
    );
  }
  return subTitleText;
};

const ContentPanel = ({
  title = '',
  titleSize = 's',
  subTitleText = '',
  bodyStyles = {},
  panelStyles = {},
  actions,
  children,
  hideHeaderBorder = false,
  className = '',
}: ContentPanelProps): JSX.Element => (
  <EuiPanel style={{ padding: '16px', ...panelStyles }} className={className}>
    <EuiFlexGroup style={{ padding: '0px 10px' }} justifyContent="spaceBetween" alignItems="center">
      <EuiFlexItem>
        {typeof title === 'string' ? (
          <EuiText size={titleSize}>
            <h2>{title}</h2>
          </EuiText>
        ) : (
          title
        )}
        {renderSubTitleText(subTitleText)}
      </EuiFlexItem>
      {actions ? (
        <EuiFlexItem grow={false}>
          <EuiFlexGroup justifyContent="spaceBetween" alignItems="center">
            {Array.isArray(actions) ? (
              (actions as React.ReactNode[]).map(
                (action: React.ReactNode, idx: number): React.ReactNode => (
                  <EuiFlexItem key={idx}>{action}</EuiFlexItem>
                )
              )
            ) : (
              <EuiFlexItem>{actions}</EuiFlexItem>
            )}
          </EuiFlexGroup>
        </EuiFlexItem>
      ) : null}
    </EuiFlexGroup>

    {hideHeaderBorder ? <EuiSpacer /> : <EuiHorizontalRule margin="xs" />}

    <div style={{ padding: '0px 10px', ...bodyStyles }}>{children}</div>
  </EuiPanel>
);

export default ContentPanel;
