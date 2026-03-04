import React, { useEffect, useRef } from 'react';
import { withGuardAsync } from '../utils/helpers';
import { DataStore } from '../../../store/DataStore';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiText,
  EuiTitle,
  EuiToolTip,
  EuiCard,
  EuiButtonIcon,
  EuiDescriptionListTitle,
  EuiDescriptionListDescription,
  EuiDescriptionList,
} from '@elastic/eui';
import { DecoderSource, PolicyDocument, SearchPolicyOptions, Space } from '../../../../types';
import { NotificationsStart } from 'opensearch-dashboards/public';
import { SPACE_ACTIONS } from '../../../../common/constants';
import { actionIsAllowedOnSpace } from '../../../../common/helpers';

export const withPolicyGuard: <T>(
  searchPolicyOptions: SearchPolicyOptions,
  withGuardOptions?: { rerunOn?: (props) => any[] }
) => (Component: React.FC<T>) => React.ReactElement = (
  searchPolicyOptions: SearchPolicyOptions = {},
  withGuardOptions?: { rerunOn?: (props) => any[] }
) =>
  withGuardAsync(
    async ({ space }: { space: Space }) => {
      try {
        const response = await DataStore.policies.searchPolicies(space, searchPolicyOptions);
        const item = response.items?.[0] || {};

        const { document: policyDocumentData, space: spaceData, id, ...rest } = item as {
          document?: PolicyDocument;
          [key: string]: any;
        };

        const rootDecoderId = policyDocumentData?.root_decoder;
        let rootDecoder: DecoderSource | undefined;
        if (rootDecoderId) {
          rootDecoder = await DataStore.decoders.getDecoder(rootDecoderId, space); // TODO: this could be obtained from the endpoint as rest
        }

        const ok = !Boolean(policyDocumentData);
        const error = ok ? new Error('Policy data was not found') : null;

        return {
          ok,
          data: { policyDocumentData, rootDecoder, policyEnhancedData: rest, error },
        };
      } catch (error) {
        return { ok: true, data: { error } };
      }
    },
    ({ error }) =>
      error ? <EuiText color="danger">Error loading the policy: {error.message}</EuiText> : null,
    null,
    withGuardOptions || {
      rerunOn: ({ space }) => [space],
    }
  );

export const PolicyInfoCard: React.FC<{}> = withPolicyGuard(
  {
    includeIntegrationFields: ['document'],
  },
  {
    rerunOn: ({ space, refresh }) => [space, refresh],
  }
)(
  ({
    policyDocumentData,
    rootDecoder,
    notifications,
    space,
    onEditPolicy,
  }: {
    policyDocumentData: PolicyDocument;
    rootDecoder: DecoderSource;
    notifications: NotificationsStart;
    space: Space;
    onEditPolicy: () => void;
    refreshKey: boolean;
  }) => {
    return (
      <EuiCard
        textAlign="left"
        paddingSize="m"
        title={
          <EuiFlexGroup justifyContent="spaceBetween" gutterSize="none">
            <EuiFlexItem>
              <EuiTitle size="s">
                <h3>Space details</h3>
              </EuiTitle>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              {actionIsAllowedOnSpace(space, SPACE_ACTIONS.DEFINE_ROOT_DECODER) && (
                <EuiToolTip content={'Edit space details'}>
                  <EuiButtonIcon
                    onClick={onEditPolicy}
                    iconType="pencil"
                    aria-label="Edit space details"
                  />
                </EuiToolTip>
              )}
            </EuiFlexItem>
          </EuiFlexGroup>
        }
      >
        <EuiFlexGroup>
          <EuiFlexItem>
            <EuiDescriptionList compressed type="row">
              <EuiDescriptionListTitle>Title</EuiDescriptionListTitle>
              <EuiDescriptionListDescription>
                {policyDocumentData.title}
              </EuiDescriptionListDescription>
              <EuiDescriptionListTitle>Description</EuiDescriptionListTitle>
              <EuiDescriptionListDescription>
                {policyDocumentData.description}
              </EuiDescriptionListDescription>
              <EuiDescriptionListTitle>Author</EuiDescriptionListTitle>
              <EuiDescriptionListDescription>
                {policyDocumentData.author}
              </EuiDescriptionListDescription>
            </EuiDescriptionList>
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiDescriptionList compressed type="row">
              <EuiDescriptionListTitle>Documentation</EuiDescriptionListTitle>
              <EuiDescriptionListDescription>
                {policyDocumentData.documentation}
              </EuiDescriptionListDescription>
              <EuiDescriptionListTitle>References</EuiDescriptionListTitle>
              <EuiDescriptionListDescription>
                {policyDocumentData.references?.join(', ') ?? ''}
              </EuiDescriptionListDescription>
              <EuiDescriptionListTitle>Root decoder</EuiDescriptionListTitle>
              <EuiDescriptionListDescription>
                {rootDecoder?.document?.name ?? ''}
              </EuiDescriptionListDescription>
            </EuiDescriptionList>
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiDescriptionList compressed type="row">
              <EuiDescriptionListTitle>Enabled</EuiDescriptionListTitle>
              <EuiDescriptionListDescription>
                {policyDocumentData?.enabled ? 'yes' : 'no'}
              </EuiDescriptionListDescription>
              <EuiDescriptionListTitle>Index unclassified events</EuiDescriptionListTitle>
              <EuiDescriptionListDescription>
                {policyDocumentData?.index_unclassified_events ? 'yes' : 'no'}
              </EuiDescriptionListDescription>
              <EuiDescriptionListTitle>Index discarded events</EuiDescriptionListTitle>
              <EuiDescriptionListDescription>
                {policyDocumentData?.index_discarded_events ? 'yes' : 'no'}
              </EuiDescriptionListDescription>
            </EuiDescriptionList>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiCard>
    );
  }
);
