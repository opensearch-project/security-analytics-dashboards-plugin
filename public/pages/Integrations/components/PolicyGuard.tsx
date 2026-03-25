/*
 * Copyright Wazuh Inc.
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import { EuiText } from '@elastic/eui';
import { withGuardAsync } from '../utils/helpers';
import { DataStore } from '../../../store/DataStore';
import { DecoderSource, PolicyDocument, SearchPolicyOptions, Space } from '../../../../types';

export const withPolicyGuard: <T>(
  searchPolicyOptions: SearchPolicyOptions,
  withGuardOptions?: { rerunOn?: (props) => any[]; loadingComponent?: React.FC<any> }
) => (Component: React.FC<T>) => React.ReactElement = (
  searchPolicyOptions: SearchPolicyOptions = {},
  withGuardOptions?: { rerunOn?: (props) => any[]; loadingComponent?: React.FC<any> }
) =>
  withGuardAsync(
    async ({ space }: { space: Space }) => {
      try {
        const response = await DataStore.policies.searchPolicies(space, searchPolicyOptions);
        const item = response.items?.[0] || {};

        const {
          document: policyDocumentData,
          space: spaceData,
          id,
          ...rest
        } = item as {
          document?: PolicyDocument;
          [key: string]: any;
        };

        const rootDecoderId = policyDocumentData?.root_decoder;
        let rootDecoder: DecoderSource | undefined;
        if (rootDecoderId) {
          rootDecoder = await DataStore.decoders.getDecoder(rootDecoderId, space);
        }

        const ok = !Boolean(policyDocumentData);
        const error = ok ? new Error('Policy data was not found') : null;

        return {
          ok,
          data: {
            policyDocumentData,
            rootDecoder,
            policyEnhancedData: rest,
            error,
          },
        };
      } catch (error) {
        return { ok: true, data: { error } };
      }
    },
    ({ error }) =>
      error ? <EuiText color="danger">Error loading the policy: {error.message}</EuiText> : null,
    withGuardOptions?.loadingComponent ?? null,
    {
      rerunOn: withGuardOptions?.rerunOn ?? (({ space }) => [space]),
    }
  );
