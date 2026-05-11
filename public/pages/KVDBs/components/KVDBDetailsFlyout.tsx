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
import { get } from 'lodash';
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

const detailsMapLabels: { [key: string]: string } = {
  'document.id': 'ID',
  'document.name': 'Name',
  'integration.title': 'Integration',
  'document.metadata.title': 'Title',
  'document.metadata.author': 'Author',
  'document.metadata.description': 'Description',
  'document.metadata.references': 'References',
  'document.metadata.documentation': 'Documentation',
  'document.metadata.supports': 'Supports',
  'document.metadata.date': 'Date',
  'document.metadata.modified': 'Modified',
  space: 'Space',
};

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

  const kvdbData = {
    'document.id': document.id || kvdb.id,
    'integration.title': kvdb.integration?.title,
    'document.metadata.title': metadata?.title,
    'document.metadata.date': metadata?.date,
    'document.metadata.author': metadata?.author,
    'document.metadata.description': metadata?.description,
    'document.metadata.references': metadata?.references,
    'document.metadata.documentation': metadata?.documentation,
    'document.metadata.supports': (
      <BadgeGroup emptyValue={DEFAULT_EMPTY_DATA} values={metadata?.supports} />
    ),
    'document.metadata.modified': metadata?.modified,
    space: kvdb?.space?.name,
  };

  const visualTab = (
    <>
      <EuiFlexGrid columns={2}>
        {([
          'space',
          'integration.title',
          'document.metadata.title',
          'document.id',
          'document.metadata.author',
          'document.metadata.description',
          ['document.metadata.date', 'date'],
          ['document.metadata.modified', 'date'],
          ['document.metadata.documentation', 'url'],
          ['document.metadata.references', 'url'],
          ['document.metadata.supports', 'raw'],
        ] as Array<string | [string, MetadataFieldType]>).map((item) => {
          const [field, type] = typeof item === 'string' ? ([item, 'text'] as const) : item;
          return (
            <EuiFlexItem key={field}>
              <Metadata
                label={<EuiFormLabel>{detailsMapLabels[field]}</EuiFormLabel>}
                value={get(kvdbData, field)}
                type={type}
              />
            </EuiFlexItem>
          );
        })}
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
