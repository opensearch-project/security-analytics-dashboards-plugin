/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { getApplication, getNavigationUI, getUseUpdatedUx } from '../../utils/constants';
import { TopNavControlData } from '../../../../../src/plugins/navigation/public';

export interface PageHeaderProps {
  appRightControls?: TopNavControlData[];
  appBadgeControls?: TopNavControlData[];
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  children,
  appBadgeControls,
  appRightControls,
}) => {
  const { HeaderControl } = getNavigationUI();
  const { setAppBadgeControls, setAppRightControls } = getApplication();

  return getUseUpdatedUx() ? (
    <>
      <HeaderControl setMountPoint={setAppBadgeControls} controls={appBadgeControls} />
      <HeaderControl setMountPoint={setAppRightControls} controls={appRightControls} />
    </>
  ) : (
    <>{children}</>
  );
};
