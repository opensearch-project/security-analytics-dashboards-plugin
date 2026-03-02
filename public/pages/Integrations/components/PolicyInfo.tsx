import React from 'react';
import { withGuardAsync } from '../utils/helpers';
import { DataStore } from '../../../store/DataStore';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiText,
  EuiDescriptionListTitle,
  EuiDescriptionListDescription,
  EuiDescriptionList,
} from '@elastic/eui';
import { DecoderSource, PolicyDocument, SearchPolicyOptions, Space } from '../../../../types';
import { ButtonSelectRootDecoder } from './RootDecoderRequirement';
import { NotificationsStart } from 'opensearch-dashboards/public';
import { SPACE_ACTIONS } from '../../../../common/constants';
import { actionIsAllowedOnSpace } from '../../../../common/helpers';

export const withPolicyGuard: <T>(
  searchPolicyOptions: SearchPolicyOptions
) => (Component: React.FC<T>) => React.ReactElement = (
  searchPolicyOptions: SearchPolicyOptions = {}
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

        return {
          ok: !Boolean(policyDocumentData),
          data: { policyDocumentData, rootDecoder, policyEnhancedData: rest },
        };
      } catch (error) {
        return { ok: false, data: { error } };
      }
    },
    ({ error }) =>
      error ? <EuiText color="danger">Error loading the policy: {error.message}</EuiText> : null,
    null,
    {
      rerunOn: ({ space }) => [space],
    }
  );

export const PolicyInfoCard: React.FC<{}> = withPolicyGuard({
  includeIntegrationFields: ['document'],
})(
  ({
    policyDocumentData,
    rootDecoder,
    notifications,
    space,
    check,
  }: {
    policyDocumentData: PolicyDocument;
    rootDecoder: DecoderSource;
    notifications: NotificationsStart;
    space: Space;
    check;
  }) => {
    return (
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
              {policyDocumentData.references.join(', ')}
            </EuiDescriptionListDescription>
            <EuiDescriptionListTitle>Root decoder</EuiDescriptionListTitle>
            <EuiDescriptionListDescription>
              {rootDecoder?.document?.name ?? ''}
              {actionIsAllowedOnSpace(space, SPACE_ACTIONS.DEFINE_ROOT_DECODER) && (
                <ButtonSelectRootDecoder
                  notifications={notifications}
                  space={space}
                  type="icon"
                  buttonProps={{ iconType: 'pencil', 'aria-label': 'Edit root decoder' }}
                  policyDocumentData={policyDocumentData}
                  rootDecoderSource={rootDecoder}
                  onConfirm={check}
                ></ButtonSelectRootDecoder>
              )}
            </EuiDescriptionListDescription>
          </EuiDescriptionList>
        </EuiFlexItem>
      </EuiFlexGroup>
    );
  }
);
