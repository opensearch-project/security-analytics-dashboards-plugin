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
import { FilterItem } from '../../../../types';
import { Metadata } from '../../KVDBs/components/Metadata';
import { EnabledHealth } from '../../../components/Utility/EnabledHealth';

interface FilterDetailsFlyoutProps {
  filter: FilterItem;
  onClose: () => void;
}

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

  const metadata = document.metadata ?? {};
  const references = metadata.references ?? [];
  const supports = metadata.supports ?? [];

  const fields: Array<{
    label: string;
    value: any;
    type?: 'text' | 'date' | 'url';
  }> = [
    { label: 'Name', value: document.name },
    { label: 'Type', value: document.type },
    { label: 'Description', value: metadata.description },
    { label: 'Author', value: getAuthorDisplay(metadata.author) },
    { label: 'Documentation', value: metadata.documentation, type: 'url' },
    { label: 'Supports', value: supports },
    { label: 'Created', value: metadata.date, type: 'date' },
    { label: 'Modified', value: metadata.modified, type: 'date' },
    { label: 'Space', value: filter.space?.name },
    { label: 'ID', value: document.id || filter.id },
    { label: 'SHA256', value: filter.hash?.sha256 },
    { label: 'Check', value: document.check },
    { label: 'References', value: references, type: 'url' },
  ];

  const visualTab = (
    <EuiFlexGrid columns={2}>
      {fields.map(({ label, value, type = 'text' }) => (
        <EuiFlexItem key={label}>
          <Metadata label={<EuiFormLabel>{label}</EuiFormLabel>} value={value} type={type} />
        </EuiFlexItem>
      ))}
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
          <EuiFlexGroup alignItems="center">
            <EuiFlexItem>
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
            </EuiFlexItem>
            <EuiFlexItem>
              <EnabledHealth enabled={document.enabled} data-test-subj="filter_flyout_enabled" />
            </EuiFlexItem>
          </EuiFlexGroup>
          <EuiSpacer size="xl" />
          {selectedEditorType === editorType.visual ? visualTab : jsonTab}
        </EuiModalBody>
      </EuiFlyoutBody>
    </EuiFlyout>
  );
};
