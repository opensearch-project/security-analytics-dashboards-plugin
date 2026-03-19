import React from 'react';
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
import { ENRICHMENT_LABELS, EnrichmentType } from '../constants/enrichments';

const truncateStyle: React.CSSProperties = {
  display: '-webkit-box',
  WebkitLineClamp: 4,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  wordBreak: 'break-all',
};

const renderValue = (value: string | undefined | null): React.ReactNode => {
  if (!value) return '-';

  return (
    <span title={value} style={truncateStyle}>
      {value}
    </span>
  );
};

/** Read metadata fields with fallback to legacy top-level fields (backward compat) */
const getMetadataValue = (
  doc: PolicyDocument,
  field: 'title' | 'author' | 'description' | 'documentation' | 'references'
): string | string[] | undefined => {
  const value = doc.metadata?.[field];
  if (value !== undefined && value !== null) return value;
  const legacy = doc as unknown as Record<string, unknown>;
  return legacy[field] as string | string[] | undefined;
};

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
          rootDecoder = await DataStore.decoders.getDecoder(rootDecoderId, space); // TODO: this could be obtained from the endpoint as rest
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
)(({
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
  refresh?: number;
}) => {
  const title = getMetadataValue(policyDocumentData, 'title');
  const documentation = getMetadataValue(policyDocumentData, 'documentation');
  const author = getMetadataValue(policyDocumentData, 'author');
  const description = getMetadataValue(policyDocumentData, 'description');
  const references = getMetadataValue(policyDocumentData, 'references');

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
            {(actionIsAllowedOnSpace(space, SPACE_ACTIONS.DEFINE_ROOT_DECODER) ||
              actionIsAllowedOnSpace(space, SPACE_ACTIONS.EDIT_POLICY_ENRICHMENTS) ||
              actionIsAllowedOnSpace(space, SPACE_ACTIONS.EDIT_POLICY_INDEXING_SETTINGS)) && (
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
      <EuiFlexGroup direction="column" gutterSize="l">
        <EuiFlexItem>
          <EuiFlexGroup gutterSize="l">
            <EuiFlexItem style={{ minWidth: 0 }}>
              <EuiDescriptionList>
                <EuiDescriptionListTitle>Title</EuiDescriptionListTitle>
                <EuiDescriptionListDescription>
                  {renderValue(typeof title === 'string' ? title : undefined)}
                </EuiDescriptionListDescription>
              </EuiDescriptionList>
            </EuiFlexItem>
            <EuiFlexItem style={{ minWidth: 0 }}>
              <EuiDescriptionList>
                <EuiDescriptionListTitle>Documentation</EuiDescriptionListTitle>
                <EuiDescriptionListDescription>
                  {renderValue(typeof documentation === 'string' ? documentation : undefined)}
                </EuiDescriptionListDescription>
              </EuiDescriptionList>
            </EuiFlexItem>
            <EuiFlexItem style={{ minWidth: 0 }}>
              <EuiDescriptionList>
                <EuiDescriptionListTitle>Enabled</EuiDescriptionListTitle>
                <EuiDescriptionListDescription>
                  {policyDocumentData?.enabled ? 'yes' : 'no'}
                </EuiDescriptionListDescription>
              </EuiDescriptionList>
            </EuiFlexItem>
            <EuiFlexItem style={{ minWidth: 0 }}>
              <EuiDescriptionList>
                <EuiDescriptionListTitle>Enrichments</EuiDescriptionListTitle>
                <EuiDescriptionListDescription>
                  {policyDocumentData?.enrichments && policyDocumentData.enrichments.length > 0
                    ? policyDocumentData.enrichments
                        .map((e) => ENRICHMENT_LABELS[e as EnrichmentType] ?? e)
                        .join(', ')
                    : '-'}
                </EuiDescriptionListDescription>
              </EuiDescriptionList>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlexItem>

        <EuiFlexItem>
          <EuiFlexGroup gutterSize="l">
            <EuiFlexItem style={{ minWidth: 0 }}>
              <EuiDescriptionList>
                <EuiDescriptionListTitle>Author</EuiDescriptionListTitle>
                <EuiDescriptionListDescription>
                  {renderValue(typeof author === 'string' ? author : undefined)}
                </EuiDescriptionListDescription>
              </EuiDescriptionList>
            </EuiFlexItem>
            <EuiFlexItem style={{ minWidth: 0 }}>
              <EuiDescriptionList>
                <EuiDescriptionListTitle>Root decoder</EuiDescriptionListTitle>
                <EuiDescriptionListDescription>
                  {renderValue(rootDecoder?.document?.name ?? '')}
                </EuiDescriptionListDescription>
              </EuiDescriptionList>
            </EuiFlexItem>
            <EuiFlexItem style={{ minWidth: 0 }}>
              <EuiDescriptionList>
                <EuiDescriptionListTitle>Index unclassified events</EuiDescriptionListTitle>
                <EuiDescriptionListDescription>
                  {policyDocumentData?.index_unclassified_events ? 'yes' : 'no'}
                </EuiDescriptionListDescription>
              </EuiDescriptionList>
            </EuiFlexItem>
            <EuiFlexItem />
          </EuiFlexGroup>
        </EuiFlexItem>

        <EuiFlexItem>
          <EuiFlexGroup gutterSize="l">
            <EuiFlexItem style={{ minWidth: 0 }}>
              <EuiDescriptionList>
                <EuiDescriptionListTitle>Description</EuiDescriptionListTitle>
                <EuiDescriptionListDescription>
                  {renderValue(typeof description === 'string' ? description : undefined)}
                </EuiDescriptionListDescription>
              </EuiDescriptionList>
            </EuiFlexItem>
            <EuiFlexItem style={{ minWidth: 0 }}>
              <EuiDescriptionList>
                <EuiDescriptionListTitle>References</EuiDescriptionListTitle>
                <EuiDescriptionListDescription>
                  {renderValue(
                    Array.isArray(references)
                      ? references.join(', ')
                      : ((references as string) ?? '')
                  )}
                </EuiDescriptionListDescription>
              </EuiDescriptionList>
            </EuiFlexItem>
            <EuiFlexItem style={{ minWidth: 0 }}>
              <EuiDescriptionList>
                <EuiDescriptionListTitle>Index discarded events</EuiDescriptionListTitle>
                <EuiDescriptionListDescription>
                  {policyDocumentData?.index_discarded_events ? 'yes' : 'no'}
                </EuiDescriptionListDescription>
              </EuiDescriptionList>
            </EuiFlexItem>
            <EuiFlexItem />
          </EuiFlexGroup>
        </EuiFlexItem>
      </EuiFlexGroup>
    </EuiCard>
  );
});
