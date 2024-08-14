/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { getApplication, getNavigationUI, getUseUpdatedUx } from '../../utils/constants';
import {
  TopNavControlData,
  TopNavControlDescriptionData,
  TopNavControlLinkData,
} from '../../../../../src/plugins/navigation/public';

export interface PageHeaderProps {
  appRightControls?: TopNavControlData[];
  appBadgeControls?: TopNavControlData[];
  appDescriptionControls?: (TopNavControlDescriptionData | TopNavControlLinkData)[];
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  children,
  appBadgeControls,
  appRightControls,
  appDescriptionControls,
}) => {
  const { HeaderControl } = getNavigationUI();
  const { setAppBadgeControls, setAppRightControls, setAppDescriptionControls } = getApplication();

  return getUseUpdatedUx() ? (
    <>
      <HeaderControl setMountPoint={setAppBadgeControls} controls={appBadgeControls} />
      <HeaderControl setMountPoint={setAppRightControls} controls={appRightControls} />
      <HeaderControl setMountPoint={setAppDescriptionControls} controls={appDescriptionControls} />
    </>
  ) : (
    <>{children}</>
  );
};
