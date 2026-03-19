/*
 * Copyright Wazuh Inc.
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React, { useState } from 'react';
import {
  EuiButtonGroup,
  EuiCodeBlock,
  EuiFlexGrid,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFlyout,
  EuiFlyoutBody,
  EuiFlyoutHeader,
  EuiFormLabel,
  EuiModalBody,
  EuiSmallButtonIcon,
  EuiSpacer,
  EuiText,
} from '@elastic/eui';
import { get } from 'lodash';
import { FilterItem } from '../../../../types';
import { Metadata } from '../../KVDBs/components/Metadata';

interface FilterDetailsFlyoutProps {
  filter: FilterItem;
  onClose: () => void;
}

const detailsMapLabels: { [key: string]: string } = {
  'document.id': 'ID',
  'document.name': 'Name',
  'document.type': 'Type',
  'document.check': 'Check',
  'document.enabled': 'Enabled',
  'document.metadata.description': 'Description',
  'document.metadata.author': 'Author',
  'space.name': 'Space',
  'hash.sha256': 'SHA256',
};

const editorType = {
  visual: 'visual',
  json: 'json',
};

/** Resolve author display: indexer sends string; legacy may send { name } */
const getAuthorDisplay = (author: string | { name?: string } | undefined): string => {
  if (!author) return '';
  if (typeof author === 'string') return author;
  return author.name ?? '';
};

export const FilterDetailsFlyout: React.FC<FilterDetailsFlyoutProps> = ({ filter, onClose }) => {
  const [selectedEditorType, setSelectedEditorType] = useState(editorType.visual);

  const document = filter.document ?? {
    id: '',
    name: '',
    type: '',
    check: '',
    enabled: false,
  };

  const filterData = {
    'document.id': document.id || filter.id,
    'document.name': document.name,
    'document.type': document.type,
    'document.check': document.check,
    'document.enabled': document.enabled,
    'document.metadata.description': document.metadata?.description,
    'document.metadata.author': getAuthorDisplay(document.metadata?.author),
    'space.name': filter.space?.name,
    'hash.sha256': filter.hash?.sha256,
  };

  const visualTab = (
    <EuiFlexGrid columns={2}>
      {[
        'document.id',
        'document.name',
        'document.type',
        'document.check',
        ['document.enabled', 'boolean_yesno'],
        'document.metadata.description',
        'document.metadata.author',
        'space.name',
        'hash.sha256',
      ].map((item) => {
        const [field, type] = typeof item === 'string' ? [item, 'text'] : item;
        return (
          <EuiFlexItem key={field}>
            <Metadata
              label={<EuiFormLabel>{detailsMapLabels[field]}</EuiFormLabel>}
              value={get(filterData, field)}
              type={type as 'text' | 'date' | 'boolean_yesno' | 'url'}
            />
          </EuiFlexItem>
        );
      })}
    </EuiFlexGrid>
  );

  const jsonTab = (
    <EuiCodeBlock language={editorType.json} isCopyable={true} paddingSize="m">
      {JSON.stringify(document, null, 2)}
    </EuiCodeBlock>
  );

  return (
    <EuiFlyout onClose={onClose} hideCloseButton ownFocus size="m">
      <EuiFlyoutHeader hasBorder>
        <EuiFlexGroup alignItems="center">
          <EuiFlexItem>
            <EuiText size="s">
              <h2>{document.name ? `Filter details — ${document.name}` : 'Filter details'}</h2>
            </EuiText>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiSmallButtonIcon
              aria-label="close"
              iconType="cross"
              display="empty"
              iconSize="m"
              onClick={onClose}
              data-test-subj="close-filter-details-flyout"
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
              { id: editorType.visual, label: 'Visual' },
              { id: editorType.json, label: 'JSON' },
            ]}
            idSelected={selectedEditorType}
            onChange={(id) => setSelectedEditorType(id)}
          />
          <EuiSpacer size="xl" />
          {selectedEditorType === editorType.visual ? visualTab : jsonTab}
        </EuiModalBody>
      </EuiFlyoutBody>
    </EuiFlyout>
  );
};
