/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EuiCallOut, EuiLink, EuiSpacer } from '@elastic/eui';

export const NotificationsCallOut = () => {
  return (
    <>
      <EuiCallOut title="Notifications plugin is not installed" color="danger" iconType="alert">
        <p>
          Install the notifications plugin in order to create and select channels to send out
          notifications.&nbsp;
          <EuiLink href="https://opensearch.org/docs/latest/notifications-plugin/index/" external>
            Learn more
          </EuiLink>
          .
        </p>
      </EuiCallOut>
      <EuiSpacer size="m" />
    </>
  );
};

export default NotificationsCallOut;
