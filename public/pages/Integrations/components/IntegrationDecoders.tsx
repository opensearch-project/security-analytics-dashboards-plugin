/*
 * Copyright Wazuh Inc.
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  EuiInMemoryTable,
  EuiBasicTableColumn,
  EuiFlexGroup,
  EuiFlexItem,
  EuiLink,
  EuiSmallButton,
  EuiText,
  EuiToolTip,
} from '@elastic/eui';
import { ContentPanel } from '../../../components/ContentPanel';
import { DecoderDetailsFlyout } from '../../Decoders/components/DecoderDetailsFlyout';
import { formatCellValue } from '../../../utils/helpers';
import { EuiIcon } from '@elastic/eui';
import { ROUTES } from '../../../utils/constants';
import { SpaceTypes, SPACE_ACTIONS } from '../../../../common/constants';
import { actionIsAllowedOnSpace, getSpacesAllowAction } from '../../../../common/helpers';
import { Space } from '../../../../types';

export interface IntegrationDecodersProps {
  decoders: DecoderTableItem[];
  loading: boolean;
  space: string;
  onRefresh: () => void;
}

export interface DecoderTableItem {
  id: string;
  name?: string;
  title?: string;
  author?: string;
}

export const IntegrationDecoders: React.FC<IntegrationDecodersProps> = ({
  decoders,
  loading,
  space,
  onRefresh,
}) => {
  const [flyoutDecoderId, setFlyoutDecoderId] = useState<string | undefined>(undefined);

  const isCreateDisabled = !actionIsAllowedOnSpace(space as Space, SPACE_ACTIONS.CREATE);

  const columns: EuiBasicTableColumn<DecoderTableItem>[] = useMemo(
    () => [
      {
        field: 'name',
        name: 'Name',
        sortable: true,
        render: (_: string, decoder: DecoderTableItem) => (
          <EuiLink onClick={() => setFlyoutDecoderId(decoder.id)}>
            {formatCellValue(decoder?.name)}
          </EuiLink>
        ),
      },
      {
        field: 'title',
        name: 'Title',
        sortable: true,
        render: (_: string, decoder: DecoderTableItem) => formatCellValue(decoder?.title),
      },
      {
        field: 'author',
        name: 'Author',
        sortable: true,
        render: (_: string, decoder: DecoderTableItem) => formatCellValue(decoder?.author),
      },
    ],
    []
  );

  const closeFlyout = useCallback(() => {
    setFlyoutDecoderId(undefined);
  }, []);

  const search = {
    box: {
      placeholder: 'Search decoders',
      schema: true,
      compressed: true,
    },
  };

  return (
    <>
      {flyoutDecoderId && (
        <DecoderDetailsFlyout decoderId={flyoutDecoderId} space={space} onClose={closeFlyout} />
      )}

      <ContentPanel
        title="Decoders"
        hideHeaderBorder={true}
        actions={[<EuiSmallButton onClick={onRefresh}>Refresh</EuiSmallButton>]}
      >
        {decoders.length === 0 && !loading ? (
          <EuiFlexGroup justifyContent="center" alignItems="center" direction="column">
            <EuiFlexItem grow={false}>
              <EuiText color="subdued" size="s">
                <p>There are no decoders associated with this integration.</p>
              </EuiText>
            </EuiFlexItem>

            {space !== SpaceTypes.STANDARD.value && (
              <EuiFlexItem grow={false}>
                {isCreateDisabled ? (
                  <EuiToolTip
                    content={`Decoder can only be created in the spaces: ${getSpacesAllowAction(
                      SPACE_ACTIONS.CREATE
                    ).join(', ')}`}
                  >
                    <span>
                      <EuiSmallButton fill disabled>
                        Create decoder&nbsp;
                        <EuiIcon type={'popout'} />
                      </EuiSmallButton>
                    </span>
                  </EuiToolTip>
                ) : (
                  <EuiSmallButton fill href={`#${ROUTES.DECODERS_CREATE}`} target="_blank">
                    Create decoder&nbsp;
                    <EuiIcon type={'popout'} />
                  </EuiSmallButton>
                )}
              </EuiFlexItem>
            )}
          </EuiFlexGroup>
        ) : (
          <EuiInMemoryTable
            items={decoders}
            columns={columns}
            loading={loading}
            search={search}
            pagination={{
              initialPageSize: 10,
              pageSizeOptions: [10, 25, 50],
            }}
            sorting={{
              sort: { field: 'document.name', direction: 'asc' },
            }}
            message="No decoders found."
          />
        )}
      </ContentPanel>
    </>
  );
};
