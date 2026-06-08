/*
 * Copyright Wazuh Inc.
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React, { useState } from 'react';
import {
  EuiAccordion,
  EuiCodeBlock,
  EuiFlexGrid,
  EuiFlexItem,
  EuiFlyout,
  EuiFlyoutBody,
  EuiFlyoutHeader,
  EuiSpacer,
  EuiButtonGroup,
  EuiModalBody,
  EuiFormLabel,
  EuiFlexGroup,
  EuiText,
  EuiSmallButtonIcon,
} from '@elastic/eui';
import { KVDBItem } from '../../../../types';
import { AssetViewer } from './AssetViewer';
import { Metadata, MetadataFieldType } from '../../../components/Utility/Metadata';
import { BadgeGroup } from '../../../components/Utility/BadgeGroup';
import { EnabledHealth } from '../../../components/Utility/EnabledHealth';
import { DEFAULT_EMPTY_DATA } from '../../../utils/constants';

interface KVDBDetailsFlyoutProps {
  kvdb: KVDBItem;
  onClose: () => void;
}

const VISUAL_VIEW = {
  VISUAL: 'visual',
  YAML: 'yaml',
  JSON: 'json',
};

const viewOptions = [
  { id: VISUAL_VIEW.VISUAL, label: 'Visual' },
  { id: VISUAL_VIEW.YAML, label: 'YAML' },
  { id: VISUAL_VIEW.JSON, label: 'JSON' },
];

export const KVDBDetailsFlyout: React.FC<KVDBDetailsFlyoutProps> = ({ kvdb, onClose }) => {
  const [selectedView, setSelectedView] = useState(VISUAL_VIEW.VISUAL);

  const document = kvdb.document ?? { id: '' };
  const metadata = document.metadata;

  const fields: Array<{
    key: string;
    label: string;
    value: any;
    type?: MetadataFieldType;
  }> = [
    { key: 'space', label: 'Space', value: kvdb?.space?.name },
    { key: 'integration.title', label: 'Integration', value: kvdb.integration?.title },
    { key: 'document.metadata.title', label: 'Title', value: metadata?.title },
    { key: 'document.id', label: 'ID', value: document.id || kvdb.id },
    { key: 'document.metadata.author', label: 'Author', value: metadata?.author },
    { key: 'document.metadata.description', label: 'Description', value: metadata?.description },
    { key: 'document.metadata.date', label: 'Date', value: metadata?.date, type: 'date' },
    { key: 'document.metadata.modified', label: 'Modified', value: metadata?.modified, type: 'date' },
    { key: 'document.metadata.documentation', label: 'Documentation', value: metadata?.documentation },
    { key: 'document.metadata.references', label: 'References', value: metadata?.references, type: 'url' },
    { key: 'document.metadata.supports', label: 'Supports', value: <BadgeGroup emptyValue={DEFAULT_EMPTY_DATA} values={metadata?.supports} />, type: 'raw' },
  ];

  const visualTab = (
    <>
      <EuiFlexGrid columns={2}>
        {fields.map(({ key, label, value, type = 'text' }) => (
          <EuiFlexItem key={key}>
            <Metadata
              label={<EuiFormLabel>{label}</EuiFormLabel>}
              value={value}
              type={type}
            />
          </EuiFlexItem>
        ))}
      </EuiFlexGrid>
      {document.content && (
        <>
          <EuiSpacer />
          <EuiAccordion id="content" buttonContent="Content" paddingSize="s" initialIsOpen={true}>
            <AssetViewer content={document.content} />
          </EuiAccordion>
        </>
      )}
    </>
  );

  const yamlTab = (
    <EuiCodeBlock language="yaml" isCopyable={true} paddingSize="m">
      {kvdb.yaml ?? ''}
    </EuiCodeBlock>
  );

  const jsonTab = (
    <EuiCodeBlock language="json" isCopyable={true} paddingSize="m">
      {JSON.stringify(document, null, 2)}
    </EuiCodeBlock>
  );

  return (
    <EuiFlyout onClose={onClose} hideCloseButton ownFocus size="m">
      <EuiFlyoutHeader hasBorder>
        <EuiFlexGroup alignItems="center">
          <EuiFlexItem>
            <EuiText size="s">
              <h2>{metadata?.title ? `KVDB details - ${metadata.title}` : 'KVDB details'}</h2>
            </EuiText>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiSmallButtonIcon
              aria-label="close"
              iconType="cross"
              display="empty"
              iconSize="m"
              onClick={onClose}
              data-test-subj="close-kvdb-details-flyout"
            />
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiFlyoutHeader>
      <EuiFlyoutBody>
        <EuiModalBody>
          <EuiFlexGroup alignItems="center">
            <EuiFlexItem>
              <EuiButtonGroup
                data-test-subj="change-editor-type"
                legend="This is editor type selector"
                options={viewOptions}
                idSelected={selectedView}
                onChange={(id) => setSelectedView(id)}
              />
            </EuiFlexItem>
            <EuiFlexItem>
              <EnabledHealth enabled={document.enabled} data-test-subj="kvdb_flyout_enabled" />
            </EuiFlexItem>
          </EuiFlexGroup>
          <EuiSpacer size="xl" />
          {selectedView === VISUAL_VIEW.VISUAL && visualTab}
          {selectedView === VISUAL_VIEW.YAML && yamlTab}
          {selectedView === VISUAL_VIEW.JSON && jsonTab}
        </EuiModalBody>
      </EuiFlyoutBody>
    </EuiFlyout>
  );
};
