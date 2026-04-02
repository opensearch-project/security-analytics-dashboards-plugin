/*
 * Copyright Wazuh Inc.
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React, { useEffect, useMemo, useState } from 'react';
import {
  EuiButtonGroup,
  EuiCallOut,
  EuiCodeBlock,
  EuiFlexGrid,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFlyout,
  EuiFlyoutBody,
  EuiFlyoutHeader,
  EuiFormLabel,
  EuiLoadingContent,
  EuiModalBody,
  EuiSmallButtonIcon,
  EuiSpacer,
  EuiText,
} from '@elastic/eui';
import { DecoderItem } from '../../../../types';
import { DataStore } from '../../../store/DataStore';
import { EnabledHealth } from '../../../components/Utility/EnabledHealth';
import { Metadata } from '../../../components/Utility/Metadata';
import { DEFAULT_EMPTY_DATA } from '../../../utils/constants';
import { BadgeGroup } from '../../../components/Utility/BadgeGroup';


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

  const fields: Array<{
    label: string;
    value: any;
    type?: 'text' | 'date' | 'url';
  }> = [
    { label: 'Space', value: decoder?.space },
    { label: 'Integration', value: decoder?.integrations },
    { label: 'Title', value: decoder?.document?.metadata?.title },
    { label: 'ID', value: decoder?.document?.id },
    { label: 'Author', value: decoder?.document?.metadata?.author },
    { label: 'Description', value: decoder?.document?.metadata?.description },
    { label: 'Date', value: decoder?.document?.metadata?.date, type: 'date' },
    { label: 'Modified', value: decoder?.document?.metadata?.modified, type: 'date' },
    { label: 'Documentation', value: decoder?.document?.metadata?.documentation, type: 'url' },
    { label: 'References', value: decoder?.document?.metadata?.references, type: 'url' },
    { label: 'Supports', value: <BadgeGroup emptyValue={DEFAULT_EMPTY_DATA} values={decoder?.document?.metadata?.supports} /> },
  ];

  const detailsContent = (
    <EuiFlexGrid columns={2}>
      {fields.map(({ label, value, type = 'text' }) => (
        <EuiFlexItem key={label}>
          <Metadata
            label={<EuiFormLabel>{label}</EuiFormLabel>}
            value={value}
            type={type}
          />
        </EuiFlexItem>
      ))}
    </EuiFlexGrid>
  );

  const yamlContent = (
    <EuiCodeBlock language="yaml" isCopyable={true}>
      {typeof decoder?.decoder === 'string'
        ? decoder?.decoder
        : JSON.stringify(decoder?.decoder, null, 2) ?? ''}
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
                {decoder?.document?.name ? `Decoder details - ${decoder.document.name}` : 'Decoder'}
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
          <EuiFlexGroup alignItems="center">
            <EuiFlexItem>
              <EuiButtonGroup
                data-test-subj="decoder-details-view-selector"
                legend="Decoder view selector"
                options={decoderViewOptions}
                idSelected={selectedView}
                onChange={(id) => setSelectedView(id)}
                isDisabled={loading || !!error || !decoder}
              />
            </EuiFlexItem>
            {decoder && (
              <EuiFlexItem>
                <EnabledHealth
                  enabled={decoder.document?.enabled}
                  data-test-subj="decoder_flyout_enabled"
                />
              </EuiFlexItem>
            )}
          </EuiFlexGroup>
          <EuiSpacer size="xl" />
          {renderContent()}
        </EuiModalBody>
      </EuiFlyoutBody>
    </EuiFlyout>
  );
};
