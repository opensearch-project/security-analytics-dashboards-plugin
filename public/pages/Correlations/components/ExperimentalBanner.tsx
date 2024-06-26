/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EuiCallOut, EuiLink, EuiSpacer } from '@elastic/eui';

export const ExperimentalBanner = () => {
  return (
    <>
      <EuiCallOut title="Experimental Feature" iconType="beaker">
        <p>
        The alerts on correlations feature is experimental and should not be used in a production environment. Any generated alerts and created indexes  in will be impacted if the feature is deactivated. For more information see&nbsp;
          <EuiLink
            href="https://opensearch.org/docs/2.4/security-analytics/index/"
            target="_blank"
          >
            Security Analytics documentation
          </EuiLink>
          . To leave feedback, visit&nbsp;
          <EuiLink target="_blank" href="https://forum.opensearch.org/">
            forum.opensearch.org
          </EuiLink>
        </p>
      </EuiCallOut>
      <EuiSpacer />
    </>
  );
};