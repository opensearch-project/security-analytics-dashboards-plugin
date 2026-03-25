/*
 * Copyright Wazuh Inc.
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React, { useState } from 'react';
import {
  EuiCard,
  EuiDescriptionList,
  EuiDescriptionListDescription,
  EuiDescriptionListTitle,
  EuiFlexGroup,
  EuiFlexItem,
  EuiHealth,
  EuiLoadingContent,
  EuiSpacer,
  EuiTab,
  EuiTabs,
} from '@elastic/eui';
import { DecoderSource, PolicyDocument, Space } from '../../../../types';
import { NotificationsStart } from 'opensearch-dashboards/public';
import { ENRICHMENT_LABELS, EnrichmentType } from '../constants/enrichments';
import { formatIntegrationMetadataDate } from '../utils/helpers';
import { withPolicyGuard } from './PolicyGuard';

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

type MetadataField =
  | 'title'
  | 'author'
  | 'description'
  | 'documentation'
  | 'references'
  | 'date'
  | 'modified';

/** Read metadata fields with fallback to legacy top-level fields (backward compat) */
const getMetadataValue = (
  doc: PolicyDocument | undefined,
  field: MetadataField
): string | string[] | undefined => {
  if (!doc) return undefined;
  const value = doc.metadata?.[field];
  if (value !== undefined && value !== null) return value;
  const legacy = doc as unknown as Record<string, unknown>;
  return legacy[field] as string | string[] | undefined;
};

const POLICY_INFO_TAB = {
  SETTINGS: 'settings',
  DETAILS: 'details',
} as const;
type PolicyInfoTabId = (typeof POLICY_INFO_TAB)[keyof typeof POLICY_INFO_TAB];

const renderYesNoOrDash = (value: boolean | undefined, hasPolicy: boolean): React.ReactNode => {
  if (!hasPolicy) return '-';
  return value ? 'yes' : 'no';
};

/** EuiSkeletonText is not available in all EUI builds; EuiLoadingContent is used elsewhere in this plugin. */
const ValueSkeleton: React.FC = () => <EuiLoadingContent lines={1} />;

/** Equal-width flex columns for Settings/Details horizontal rows. */
const COL: React.CSSProperties = { flex: '1 1 0', minWidth: 0 };

/** Details row 2 vs row 1 (5 cols): Documentation spans Title+Author; Description spans References+Date+Modified. */
const DETAILS_DOC_COL: React.CSSProperties = { flex: '2 1 0', minWidth: 0 };
const DETAILS_DESC_COL: React.CSSProperties = { flex: '3 1 0', minWidth: 0 };

const settingsSkeletonRows = (
  <>
    <EuiFlexGroup gutterSize="l" alignItems="flexStart" responsive={false} wrap={false}>
      <EuiFlexItem style={COL}>
        <EuiDescriptionList>
          <EuiDescriptionListTitle>Status</EuiDescriptionListTitle>
          <EuiDescriptionListDescription>
            <ValueSkeleton />
          </EuiDescriptionListDescription>
        </EuiDescriptionList>
      </EuiFlexItem>
      <EuiFlexItem style={COL}>
        <EuiDescriptionList>
          <EuiDescriptionListTitle>Root decoder</EuiDescriptionListTitle>
          <EuiDescriptionListDescription>
            <ValueSkeleton />
          </EuiDescriptionListDescription>
        </EuiDescriptionList>
      </EuiFlexItem>
      <EuiFlexItem style={COL}>
        <EuiDescriptionList>
          <EuiDescriptionListTitle>Index discarded events</EuiDescriptionListTitle>
          <EuiDescriptionListDescription>
            <ValueSkeleton />
          </EuiDescriptionListDescription>
        </EuiDescriptionList>
      </EuiFlexItem>
      <EuiFlexItem style={COL}>
        <EuiDescriptionList>
          <EuiDescriptionListTitle>Index unclassified events</EuiDescriptionListTitle>
          <EuiDescriptionListDescription>
            <ValueSkeleton />
          </EuiDescriptionListDescription>
        </EuiDescriptionList>
      </EuiFlexItem>
    </EuiFlexGroup>
    <EuiSpacer size="l" />
    <EuiFlexGroup gutterSize="l" alignItems="flexStart" responsive={false} wrap={false}>
      <EuiFlexItem grow={true} style={{ minWidth: 0 }}>
        <EuiDescriptionList>
          <EuiDescriptionListTitle>Enrichments</EuiDescriptionListTitle>
          <EuiDescriptionListDescription>
            <ValueSkeleton />
          </EuiDescriptionListDescription>
        </EuiDescriptionList>
      </EuiFlexItem>
    </EuiFlexGroup>
  </>
);

const detailsSkeletonRows = (
  <>
    <EuiFlexGroup gutterSize="l" alignItems="flexStart" responsive={false} wrap={false}>
      <EuiFlexItem style={COL}>
        <EuiDescriptionList>
          <EuiDescriptionListTitle>Title</EuiDescriptionListTitle>
          <EuiDescriptionListDescription>
            <ValueSkeleton />
          </EuiDescriptionListDescription>
        </EuiDescriptionList>
      </EuiFlexItem>
      <EuiFlexItem style={COL}>
        <EuiDescriptionList>
          <EuiDescriptionListTitle>Author</EuiDescriptionListTitle>
          <EuiDescriptionListDescription>
            <ValueSkeleton />
          </EuiDescriptionListDescription>
        </EuiDescriptionList>
      </EuiFlexItem>
      <EuiFlexItem style={COL}>
        <EuiDescriptionList>
          <EuiDescriptionListTitle>References</EuiDescriptionListTitle>
          <EuiDescriptionListDescription>
            <ValueSkeleton />
          </EuiDescriptionListDescription>
        </EuiDescriptionList>
      </EuiFlexItem>
      <EuiFlexItem style={COL}>
        <EuiDescriptionList>
          <EuiDescriptionListTitle>Date</EuiDescriptionListTitle>
          <EuiDescriptionListDescription>
            <ValueSkeleton />
          </EuiDescriptionListDescription>
        </EuiDescriptionList>
      </EuiFlexItem>
      <EuiFlexItem style={COL}>
        <EuiDescriptionList>
          <EuiDescriptionListTitle>Modified</EuiDescriptionListTitle>
          <EuiDescriptionListDescription>
            <ValueSkeleton />
          </EuiDescriptionListDescription>
        </EuiDescriptionList>
      </EuiFlexItem>
    </EuiFlexGroup>
    <EuiSpacer size="l" />
    <EuiFlexGroup gutterSize="l" alignItems="flexStart" responsive={false} wrap={false}>
      <EuiFlexItem style={DETAILS_DOC_COL}>
        <EuiDescriptionList>
          <EuiDescriptionListTitle>Documentation</EuiDescriptionListTitle>
          <EuiDescriptionListDescription>
            <ValueSkeleton />
          </EuiDescriptionListDescription>
        </EuiDescriptionList>
      </EuiFlexItem>
      <EuiFlexItem style={DETAILS_DESC_COL}>
        <EuiDescriptionList>
          <EuiDescriptionListTitle>Description</EuiDescriptionListTitle>
          <EuiDescriptionListDescription>
            <EuiLoadingContent lines={2} />
          </EuiDescriptionListDescription>
        </EuiDescriptionList>
      </EuiFlexItem>
    </EuiFlexGroup>
  </>
);

/** Same tab structure as loaded state; placeholders while policy is loading. */
const PolicyInfoCardSkeleton: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<PolicyInfoTabId>(POLICY_INFO_TAB.SETTINGS);

  return (
    <EuiCard
      textAlign="left"
      paddingSize="m"
      title={
        <EuiTabs size="s">
          <EuiTab
            isSelected={selectedTab === POLICY_INFO_TAB.SETTINGS}
            onClick={() => setSelectedTab(POLICY_INFO_TAB.SETTINGS)}
          >
            Settings
          </EuiTab>
          <EuiTab
            isSelected={selectedTab === POLICY_INFO_TAB.DETAILS}
            onClick={() => setSelectedTab(POLICY_INFO_TAB.DETAILS)}
          >
            Details
          </EuiTab>
        </EuiTabs>
      }
    >
      <EuiSpacer size="l" />
      {selectedTab === POLICY_INFO_TAB.SETTINGS ? settingsSkeletonRows : detailsSkeletonRows}
    </EuiCard>
  );
};

const renderSettingsPanel = (
  hasPolicy: boolean,
  policyDocumentData: PolicyDocument | undefined,
  rootDecoder: DecoderSource | undefined,
  enrichmentsDisplay: string
) => (
  <>
    <EuiFlexGroup gutterSize="l" alignItems="flexStart" responsive={false} wrap={false}>
      <EuiFlexItem style={COL}>
        <EuiDescriptionList>
          <EuiDescriptionListTitle>Status</EuiDescriptionListTitle>
          <EuiDescriptionListDescription>
            {!hasPolicy ? (
              '-'
            ) : (
              <EuiHealth color={policyDocumentData?.enabled ? 'success' : 'subdued'}>
                {policyDocumentData?.enabled ? 'Enabled' : 'Disabled'}
              </EuiHealth>
            )}
          </EuiDescriptionListDescription>
        </EuiDescriptionList>
      </EuiFlexItem>
      <EuiFlexItem style={COL}>
        <EuiDescriptionList>
          <EuiDescriptionListTitle>Root decoder</EuiDescriptionListTitle>
          <EuiDescriptionListDescription>
            {renderValue(hasPolicy ? rootDecoder?.document?.name ?? '' : undefined)}
          </EuiDescriptionListDescription>
        </EuiDescriptionList>
      </EuiFlexItem>
      <EuiFlexItem style={COL}>
        <EuiDescriptionList>
          <EuiDescriptionListTitle>Index discarded events</EuiDescriptionListTitle>
          <EuiDescriptionListDescription>
            {renderYesNoOrDash(policyDocumentData?.index_discarded_events, hasPolicy)}
          </EuiDescriptionListDescription>
        </EuiDescriptionList>
      </EuiFlexItem>
      <EuiFlexItem style={COL}>
        <EuiDescriptionList>
          <EuiDescriptionListTitle>Index unclassified events</EuiDescriptionListTitle>
          <EuiDescriptionListDescription>
            {renderYesNoOrDash(policyDocumentData?.index_unclassified_events, hasPolicy)}
          </EuiDescriptionListDescription>
        </EuiDescriptionList>
      </EuiFlexItem>
    </EuiFlexGroup>
    <EuiSpacer size="l" />
    <EuiFlexGroup gutterSize="l" alignItems="flexStart" responsive={false} wrap={false}>
      <EuiFlexItem grow={true} style={{ minWidth: 0 }}>
        <EuiDescriptionList>
          <EuiDescriptionListTitle>Enrichments</EuiDescriptionListTitle>
          <EuiDescriptionListDescription>{enrichmentsDisplay}</EuiDescriptionListDescription>
        </EuiDescriptionList>
      </EuiFlexItem>
    </EuiFlexGroup>
  </>
);

const renderDetailsPanel = (
  hasPolicy: boolean,
  title: string | string[] | undefined,
  author: string | string[] | undefined,
  description: string | string[] | undefined,
  documentation: string | string[] | undefined,
  references: string | string[] | undefined,
  dateStr: string | string[] | undefined,
  modifiedStr: string | string[] | undefined
) => (
  <>
    <EuiFlexGroup gutterSize="l" alignItems="flexStart" responsive={false} wrap={false}>
      <EuiFlexItem style={COL}>
        <EuiDescriptionList>
          <EuiDescriptionListTitle>Title</EuiDescriptionListTitle>
          <EuiDescriptionListDescription>
            {renderValue(typeof title === 'string' ? title : undefined)}
          </EuiDescriptionListDescription>
        </EuiDescriptionList>
      </EuiFlexItem>
      <EuiFlexItem style={COL}>
        <EuiDescriptionList>
          <EuiDescriptionListTitle>Author</EuiDescriptionListTitle>
          <EuiDescriptionListDescription>
            {renderValue(typeof author === 'string' ? author : undefined)}
          </EuiDescriptionListDescription>
        </EuiDescriptionList>
      </EuiFlexItem>
      <EuiFlexItem style={COL}>
        <EuiDescriptionList>
          <EuiDescriptionListTitle>References</EuiDescriptionListTitle>
          <EuiDescriptionListDescription>
            {renderValue(
              !hasPolicy
                ? undefined
                : Array.isArray(references)
                  ? references.join(', ')
                  : ((references as string) ?? '')
            )}
          </EuiDescriptionListDescription>
        </EuiDescriptionList>
      </EuiFlexItem>
      <EuiFlexItem style={COL}>
        <EuiDescriptionList>
          <EuiDescriptionListTitle>Date</EuiDescriptionListTitle>
          <EuiDescriptionListDescription>
            {renderValue(
              !hasPolicy
                ? undefined
                : typeof dateStr === 'string'
                  ? formatIntegrationMetadataDate(dateStr) || undefined
                  : undefined
            )}
          </EuiDescriptionListDescription>
        </EuiDescriptionList>
      </EuiFlexItem>
      <EuiFlexItem style={COL}>
        <EuiDescriptionList>
          <EuiDescriptionListTitle>Modified</EuiDescriptionListTitle>
          <EuiDescriptionListDescription>
            {renderValue(
              !hasPolicy
                ? undefined
                : typeof modifiedStr === 'string'
                  ? formatIntegrationMetadataDate(modifiedStr) || undefined
                  : undefined
            )}
          </EuiDescriptionListDescription>
        </EuiDescriptionList>
      </EuiFlexItem>
    </EuiFlexGroup>
    <EuiSpacer size="l" />
    <EuiFlexGroup gutterSize="l" alignItems="flexStart" responsive={false} wrap={false}>
      <EuiFlexItem style={DETAILS_DOC_COL}>
        <EuiDescriptionList>
          <EuiDescriptionListTitle>Documentation</EuiDescriptionListTitle>
          <EuiDescriptionListDescription>
            {renderValue(typeof documentation === 'string' ? documentation : undefined)}
          </EuiDescriptionListDescription>
        </EuiDescriptionList>
      </EuiFlexItem>
      <EuiFlexItem style={DETAILS_DESC_COL}>
        <EuiDescriptionList>
          <EuiDescriptionListTitle>Description</EuiDescriptionListTitle>
          <EuiDescriptionListDescription>
            {renderValue(typeof description === 'string' ? description : undefined)}
          </EuiDescriptionListDescription>
        </EuiDescriptionList>
      </EuiFlexItem>
    </EuiFlexGroup>
  </>
);

/** Loaded policy: Settings vs Details tabs; values show "-" when empty. */
export const PolicyInfoCardLayout: React.FC<{
  policyDocumentData?: PolicyDocument;
  rootDecoder?: DecoderSource;
}> = ({ policyDocumentData, rootDecoder }) => {
  const [selectedTab, setSelectedTab] = useState<PolicyInfoTabId>(POLICY_INFO_TAB.SETTINGS);
  const hasPolicy = Boolean(policyDocumentData);
  const title = getMetadataValue(policyDocumentData, 'title');
  const documentation = getMetadataValue(policyDocumentData, 'documentation');
  const author = getMetadataValue(policyDocumentData, 'author');
  const description = getMetadataValue(policyDocumentData, 'description');
  const references = getMetadataValue(policyDocumentData, 'references');
  const dateStr = getMetadataValue(policyDocumentData, 'date');
  const modifiedStr = getMetadataValue(policyDocumentData, 'modified');

  const enrichmentsDisplay = !hasPolicy
    ? '-'
    : policyDocumentData?.enrichments && policyDocumentData.enrichments.length > 0
      ? policyDocumentData.enrichments
          .map((e) => ENRICHMENT_LABELS[e as EnrichmentType] ?? e)
          .join(', ')
      : '-';

  return (
    <EuiCard
      textAlign="left"
      paddingSize="m"
      title={
        <EuiTabs size="s">
          <EuiTab
            isSelected={selectedTab === POLICY_INFO_TAB.SETTINGS}
            onClick={() => setSelectedTab(POLICY_INFO_TAB.SETTINGS)}
          >
            Settings
          </EuiTab>
          <EuiTab
            isSelected={selectedTab === POLICY_INFO_TAB.DETAILS}
            onClick={() => setSelectedTab(POLICY_INFO_TAB.DETAILS)}
          >
            Details
          </EuiTab>
        </EuiTabs>
      }
    >
      <EuiSpacer size="l" />
      {selectedTab === POLICY_INFO_TAB.SETTINGS
        ? renderSettingsPanel(hasPolicy, policyDocumentData, rootDecoder, enrichmentsDisplay)
        : renderDetailsPanel(
            hasPolicy,
            title,
            author,
            description,
            documentation,
            references,
            dateStr,
            modifiedStr
          )}
    </EuiCard>
  );
};

const PolicyInfoCardLoading: React.FC = () => <PolicyInfoCardSkeleton />;

export const PolicyInfoCard: React.FC<{}> = withPolicyGuard(
  {
    includeIntegrationFields: ['document'],
  },
  {
    rerunOn: ({ space, refresh }) => [space, refresh],
    loadingComponent: PolicyInfoCardLoading,
  }
)(({
  policyDocumentData,
  rootDecoder,
  notifications: _notifications,
  space: _space,
}: {
  policyDocumentData: PolicyDocument;
  rootDecoder: DecoderSource;
  notifications: NotificationsStart;
  space: Space;
  refresh?: number;
}) => <PolicyInfoCardLayout policyDocumentData={policyDocumentData} rootDecoder={rootDecoder} />);
