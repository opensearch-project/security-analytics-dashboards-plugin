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
import { KVDBDetailsFlyout } from '../../KVDBs/components/KVDBDetailsFlyout';
import { formatCellValue } from '../../../utils/helpers';
import { EuiIcon } from '@elastic/eui';
import { ROUTES } from '../../../utils/constants';
import { KVDBItem, Space } from '../../../../types';
import { SpaceTypes, SPACE_ACTIONS } from '../../../../common/constants';
import { actionIsAllowedOnSpace, getSpacesAllowAction } from '../../../../common/helpers';

export interface IntegrationKVDBsProps {
  kvdbs: KVDBItem[];
  loading: boolean;
  space: string;
  onRefresh: () => void;
}

export const IntegrationKVDBs: React.FC<IntegrationKVDBsProps> = ({
  kvdbs,
  loading,
  space,
  onRefresh,
}) => {
  const [flyoutKvdb, setFlyoutKvdb] = useState<KVDBTableItem | undefined>(undefined);

  const isCreateDisabled = !actionIsAllowedOnSpace(space as Space, SPACE_ACTIONS.CREATE);

  const columns: EuiBasicTableColumn<KVDBItem>[] = useMemo(
    () => [
      {
        field: 'document.title',
        name: 'Title',
        sortable: true,
        render: (_: string, kvdb: KVDBItem) => (
          <EuiLink onClick={() => setFlyoutKvdb(kvdb)}>
            {formatCellValue(kvdb.document?.title)}
          </EuiLink>
        ),
      },
      {
        field: 'document.author',
        name: 'Author',
        sortable: true,
        render: (_: string, kvdb: KVDBItem) => formatCellValue(kvdb.document?.author),
      },
    ],
    []
  );

  const closeFlyout = useCallback(() => {
    setFlyoutKvdb(undefined);
  }, []);

  const search = {
    box: {
      schema: true,
      compressed: true,
    },
  };

  return (
    <>
      {flyoutKvdb && <KVDBDetailsFlyout kvdb={flyoutKvdb} onClose={closeFlyout} />}

      <ContentPanel
        title="KVDBs"
        hideHeaderBorder={true}
        actions={[<EuiSmallButton onClick={onRefresh}>Refresh</EuiSmallButton>]}
      >
        {kvdbs.length === 0 && !loading ? (
          <EuiFlexGroup justifyContent="center" alignItems="center" direction="column">
            <EuiFlexItem grow={false}>
              <EuiText color="subdued" size="s">
                <p>There are no KVDBs associated with this integration.</p>
              </EuiText>
            </EuiFlexItem>
            {/* TO DO: Create KVDB page*/}
            {space !== SpaceTypes.STANDARD.value && (
              <EuiFlexItem grow={false}>
                {isCreateDisabled ? (
                  <EuiToolTip
                    content={`KVDB can only be created in the spaces: ${getSpacesAllowAction(
                      SPACE_ACTIONS.CREATE
                    ).join(', ')}`}
                  >
                    <span>
                      <EuiSmallButton fill disabled>
                        Create KVDBs&nbsp;
                        <EuiIcon type={'popout'} />
                      </EuiSmallButton>
                    </span>
                  </EuiToolTip>
                ) : (
                  <EuiSmallButton fill href={`#${ROUTES.KVDBS_CREATE}`} target="_blank">
                    Create KVDBs&nbsp;
                    <EuiIcon type={'popout'} />
                  </EuiSmallButton>
                )}
              </EuiFlexItem>
            )}
          </EuiFlexGroup>
        ) : (
          <EuiInMemoryTable
            items={kvdbs}
            columns={columns}
            loading={loading}
            search={search}
            pagination={{
              initialPageSize: 10,
              pageSizeOptions: [10, 25, 50],
            }}
            sorting={{
              sort: { field: 'document.title', direction: 'asc' },
            }}
            message="No KVDBs found."
          />
        )}
      </ContentPanel>
    </>
  );
};
