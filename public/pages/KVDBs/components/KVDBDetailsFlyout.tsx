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
import { Metadata } from './Metadata';
import { AssetViewer } from './AssetViewer';

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
  'document.enabled': 'Enabled',
  'document.metadata.references': 'References',
  'document.metadata.documentation': 'Documentation',
  'document.metadata.supports': 'Supports',
  'document.metadata.date': 'Date',
  'document.metadata.modified': 'Modified',
  space: 'Space',
};

export const KVDBDetailsFlyout: React.FC<KVDBDetailsFlyoutProps> = ({ kvdb, onClose }) => {
  const [selectedEditorType, setSelectedEditorType] = useState('visual');

  const onEditorTypeChange = (optionId: string) => {
    setSelectedEditorType(optionId);
  };
  const document = kvdb.document ?? { id: '' };

  const metadata = document.metadata;
  const kvdbData = {
    'document.id': document.id || kvdb.id,
    'integration.title': kvdb.integration?.title,
    'document.metadata.title': metadata?.title,
    'document.metadata.date': metadata?.date,
    'document.metadata.author': metadata?.author,
    'document.enabled': document.enabled,
    'document.metadata.references': metadata?.references,
    'document.metadata.documentation': metadata?.documentation,
    'document.metadata.supports': metadata?.supports,
    'document.metadata.modified': metadata?.modified,
    space: kvdb?.space?.name,
  };

  const visualTab = (
    <>
      <EuiFlexGrid columns={2}>
        {[
          'document.id',
          'integration.title',
          'document.metadata.title',
          ['document.metadata.date', 'date'],
          ['document.metadata.modified', 'date'],
          'document.metadata.author',
          ['document.enabled', 'boolean_yesno'],
          ['document.metadata.references', 'url'],
          ['document.metadata.documentation', 'url'],
          'document.metadata.supports',
          'space',
        ].map((item) => {
          const [field, type] = typeof item === 'string' ? [item, 'text'] : item;
          return (
            <EuiFlexItem key={field}>
              <Metadata
                label={<EuiFormLabel>{detailsMapLabels[field]}</EuiFormLabel>}
                value={get(kvdbData, field)}
                type={type as 'text' | 'date' | 'boolean_yesno' | 'url'}
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
          <EuiButtonGroup
            data-test-subj="change-editor-type"
            legend="This is editor type selector"
            options={[
              {
                id: 'visual',
                label: 'Visual',
              },
              {
                id: 'json',
                label: 'JSON',
              },
            ]}
            idSelected={selectedEditorType}
            onChange={(id) => onEditorTypeChange(id)}
          />
          <EuiSpacer size="xl" />
          {selectedEditorType === 'visual' ? visualTab : jsonTab}
        </EuiModalBody>
      </EuiFlyoutBody>
    </EuiFlyout>
  );
};
