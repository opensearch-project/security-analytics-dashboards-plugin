/*
 * Copyright Wazuh Inc.
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React, { useState, useMemo } from 'react';
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
import { FilterDocument, FilterItem } from '../../../../types';
import { Metadata } from '../../../components/Utility/Metadata';
import { EnabledHealth } from '../../../components/Utility/EnabledHealth';
import { BadgeGroup } from '../../../components/Utility/BadgeGroup';
import { DEFAULT_EMPTY_DATA } from '../../../utils/constants';
import { mapYamlToLosslessObject } from '../../../components/YamlForm';
import { stringify as LosslessStringify } from 'lossless-json';
interface FilterDetailsFlyoutProps {
  filter: FilterItem;
  onClose: () => void;
}

const viewOptions = [
  {
    id: 'visual',
    label: 'Visual',
  },
  {
    id: 'yaml',
    label: 'YAML',
  },
  {
    id: 'json',
    label: 'JSON',
  },
];

/** Resolve author display: indexer sends string; legacy may send { name } */
const getAuthorDisplay = (author: string | { name?: string } | undefined): string => {
  if (!author) return '';
  if (typeof author === 'string') return author;
  return author.name ?? '';
};

const renderCheckValue = (check: string | Array<Record<string, string>> | undefined): React.ReactNode => {
  if (!check) return undefined;
  if (typeof check === 'string') return check;
  if (Array.isArray(check)) {
    return (
      <>
        {check.map((entry, i) =>
          Object.entries(entry).map(([key, val]) => (
            <div key={`${key}-${i}`}>
              - <strong>{key}</strong>: {String(val)}
            </div>
          ))
        )}
      </>
    );
  }
  return String(check);
};

export const FilterDetailsFlyout: React.FC<FilterDetailsFlyoutProps> = ({ filter, onClose }) => {
  const [selectedView, setSelectedView] = useState(viewOptions[0].id);

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

  const filterJson = useMemo(() => {
    if (!filter) return '';
    try {
      const rawYaml = typeof filter.yaml === 'string' ? filter.yaml : null;
      if (rawYaml) {
        const losslessDoc = mapYamlToLosslessObject<FilterDocument>(rawYaml);
        return LosslessStringify(losslessDoc, null, 2) ?? '';
      }
      return JSON.stringify(filter?.document, null, 2);
    } catch (err) {
      return JSON.stringify(filter?.document, null, 2) ?? '';
    }
  }, [filter]);

  const fields: Array<{
    label: string;
    value: any;
    type?: 'text' | 'date' | 'url' | 'raw';
  }> = [
    { label: 'Name', value: document.name },
    { label: 'Space', value: filter.space?.name },
    { label: 'Type', value: document.type },
    { label: 'Author', value: getAuthorDisplay(metadata.author) },
    { label: 'ID', value: document.id || filter.id },
    { label: 'Description', value: metadata.description },
    { label: 'Created', value: metadata.date, type: 'date' },
    { label: 'Modified', value: metadata.modified, type: 'date' },
    { label: 'Supports', value: <BadgeGroup emptyValue={DEFAULT_EMPTY_DATA} values={supports} />, type: 'raw' },
    { label: 'Check', value: renderCheckValue(document.check as any), type: 'raw' },
    { label: 'Documentation', value: metadata.documentation, type: 'url' },
    { label: 'SHA256', value: filter.hash?.sha256 },
    { label: 'References', value: references, type: 'url' },
  ];

  const visualContent = (
    <EuiFlexGrid columns={2}>
      {fields.map(({ label, value, type = 'text' }) => (
        <EuiFlexItem key={label}>
          <Metadata label={<EuiFormLabel>{label}</EuiFormLabel>} value={value} type={type} />
        </EuiFlexItem>
      ))}
    </EuiFlexGrid>
  );

  const jsonContent = (
    <EuiCodeBlock language="json" isCopyable={true} paddingSize="m">
      {filterJson}
    </EuiCodeBlock>
  );

  const yamlContent = (
    <EuiCodeBlock language="yaml" isCopyable={true}>
      {filter.yaml}
    </EuiCodeBlock>
  );

  const renderContent = () => {
    if (!document) {
      return null;
    }
    if (selectedView === 'yaml') {
      return yamlContent;
    }
    if (selectedView === 'json') {
      return jsonContent;
    }
    return visualContent;
  };

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
                options={viewOptions}
                idSelected={selectedView}
                onChange={(id) => setSelectedView(id)}
              />
            </EuiFlexItem>
            <EuiFlexItem>
              <EnabledHealth enabled={document.enabled} data-test-subj="filter_flyout_enabled" />
            </EuiFlexItem>
          </EuiFlexGroup>
          <EuiSpacer size="xl" />
          {renderContent()}
        </EuiModalBody>
      </EuiFlyoutBody>
    </EuiFlyout>
  );
};
