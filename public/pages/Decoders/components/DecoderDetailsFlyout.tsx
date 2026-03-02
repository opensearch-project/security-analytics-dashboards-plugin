/*
 * Copyright Wazuh Inc.
 * SPDX-License-Identifier: AGPL-3.0-or-later
*/

import React, { useEffect, useMemo, useState } from 'react';
import {
  EuiButtonGroup,
  EuiCallOut,
  EuiCodeBlock,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFlyout,
  EuiFlyoutBody,
  EuiFlyoutHeader,
  EuiLoadingContent,
  EuiModalBody,
  EuiSmallButtonIcon,
  EuiSpacer,
  EuiText,
  EuiTitle,
} from '@elastic/eui';
import { DecoderItem } from '../../../../types';
import { DataStore } from '../../../store/DataStore';
import { createTextDetailsGroup } from '../../../utils/helpers';

interface DecoderDetailsFlyoutProps {
  decoderId: string;
  space?: string;
  onClose: () => void;
}

const decoderViewOptions = [
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

export const DecoderDetailsFlyout: React.FC<DecoderDetailsFlyoutProps> = ({
  decoderId,
  space,
  onClose,
}) => {
  const [decoder, setDecoder] = useState<DecoderItem | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>(undefined);
  const [selectedView, setSelectedView] = useState(decoderViewOptions[0].id);

  const formatTextValue = (value: unknown) => {
    if (value === null || value === undefined || value === '') {
      return undefined;
    }
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      return String(value);
    }
    if (Array.isArray(value)) {
      const formatted = value
        .map((entry) => {
          if (entry === null || entry === undefined) {
            return '';
          }
          if (typeof entry === 'string' || typeof entry === 'number' || typeof entry === 'boolean') {
            return String(entry);
          }
          if (typeof entry === 'object' && 'name' in entry && typeof entry.name === 'string') {
            return entry.name;
          }
          return JSON.stringify(entry);
        })
        .filter(Boolean)
        .join(', ');
      return formatted || undefined;
    }
    if (typeof value === 'object') {
      if ('name' in value && typeof value.name === 'string') {
        return value.name;
      }
      if ('value' in value && typeof value.value === 'string') {
        return value.value;
      }
      return JSON.stringify(value);
    }
    return undefined;
  };

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(undefined);
    setDecoder(undefined);
    DataStore.decoders
      .getDecoder(decoderId, space)
      .then((response) => {
        if (!isMounted) {
          return;
        }
        if (!response) {
          setError('Decoder not found.');
        } else {
          setDecoder(response);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err?.message ?? 'Failed to load decoder.');
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [decoderId, space]);

  const decoderJson = useMemo(() => {
    if (!decoder) {
      return '';
    }
    try {
      return JSON.stringify(decoder?.document, null, 2);
    } catch (err) {
      return '';
    }
  }, [decoder]);

  const integrations = decoder?.integrations?.length ? decoder.integrations.join(', ') : undefined;

  const detailsContent = (
    <>
      {createTextDetailsGroup([
        { label: 'ID', content: formatTextValue(decoder?.document?.id) },
        { label: 'Integration', content: integrations },
      ])}
      {createTextDetailsGroup([
        { label: 'Title', content: formatTextValue(decoder?.document?.metadata?.title) },
        { label: 'Module', content: formatTextValue(decoder?.document?.metadata?.module) },
      ])}
      {createTextDetailsGroup([
        {
          label: 'Compatibility',
          content: formatTextValue(decoder?.document?.metadata?.compatibility),
        },
        { label: 'Versions', content: formatTextValue(decoder?.document?.metadata?.versions) },
      ])}
      {decoder?.document?.metadata?.author && (
        <>
          <EuiTitle size="xs">
            <h3>Author</h3>
          </EuiTitle>
          <EuiSpacer size="s" />
          {createTextDetailsGroup([
            {
              label: 'Name',
              content: formatTextValue(decoder.document.metadata.author.name),
            },
            {
              label: 'Email',
              content: formatTextValue(decoder.document.metadata.author.email),
            },
          ])}
          {createTextDetailsGroup([
            {
              label: 'URL',
              content: formatTextValue(decoder.document.metadata.author.url),
              url: decoder.document.metadata.author.url,
              target: '_blank',
            },
            {
              label: 'Date',
              content: formatTextValue(decoder.document.metadata.author.date),
            },
          ])}
        </>
      )}

      {formatTextValue(decoder?.document?.metadata?.description) && (
        <>
          <EuiTitle size="xs">
            <h3>Description</h3>
          </EuiTitle>
          <EuiSpacer size="s" />
          <EuiText size="s">
            <p>{formatTextValue(decoder.document.metadata.description)}</p>
          </EuiText>
        </>
      )}
    </>
  );

  const yamlContent = (
    <EuiCodeBlock language="yaml" isCopyable={true}>
      {typeof decoder?.decoder === 'string' ? decoder?.decoder : JSON.stringify(decoder?.decoder, null, 2) ?? ''}
    </EuiCodeBlock>
  );

  const jsonContent = (
    <EuiCodeBlock language="json" isCopyable={true}>
      {decoderJson}
    </EuiCodeBlock>
  );

  const renderContent = () => {
    if (loading) {
      return <EuiLoadingContent lines={4} />;
    }
    if (error) {
      return <EuiCallOut color="danger" iconType="alert" title={error} />;
    }
    if (!decoder) {
      return null;
    }
    if (selectedView === 'yaml') {
      return yamlContent;
    }
    if (selectedView === 'json') {
      return jsonContent;
    }
    return detailsContent;
  };

  return (
    <EuiFlyout
      onClose={onClose}
      hideCloseButton
      ownFocus={true}
      size="m"
      data-test-subj="decoder-details-flyout"
    >
      <EuiFlyoutHeader hasBorder>
        <EuiFlexGroup alignItems="center">
          <EuiFlexItem>
            <EuiText size="s">
              <h2>
                {decoder?.document?.name
                  ? `Decoder details - ${decoder.document.name}`
                  : 'Decoder'}
              </h2>
            </EuiText>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiSmallButtonIcon
              aria-label="close"
              iconType="cross"
              display="empty"
              iconSize="m"
              onClick={onClose}
              data-test-subj="close-decoder-details-flyout"
            />
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiFlyoutHeader>
      <EuiFlyoutBody>
        <EuiModalBody>
          <EuiButtonGroup
            data-test-subj="decoder-details-view-selector"
            legend="Decoder view selector"
            options={decoderViewOptions}
            idSelected={selectedView}
            onChange={(id) => setSelectedView(id)}
            isDisabled={loading || !!error || !decoder}
          />
          <EuiSpacer size="xl" />
          {renderContent()}
        </EuiModalBody>
      </EuiFlyoutBody>
    </EuiFlyout>
  );
};
