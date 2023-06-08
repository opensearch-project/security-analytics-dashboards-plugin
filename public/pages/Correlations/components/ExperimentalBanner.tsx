/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EuiCallOut, EuiLink, EuiSpacer } from '@elastic/eui';

export const CorrelationsExperimentalBanner = () => {
  return (
    <>
      <EuiCallOut title="Experimental Feature" iconType="beaker">
        <p>
          The feature is experimental and should not be used in a production environment. While we
          are working on the finishing touches, share your ideas and feedback on&nbsp;
          <EuiLink target="_blank" href="https://forum.opensearch.org/">
            forum.opensearch.org.
          </EuiLink>
          For more information see &nbsp;
          <EuiLink
            href="https://opensearch.org/docs/latest/security-analytics/index/"
            target="_blank"
          >
            Security Analytics Documentation.
          </EuiLink>
        </p>
      </EuiCallOut>
      <EuiSpacer />
    </>
  );
};
