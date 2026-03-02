/*
 * Copyright Wazuh Inc.
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  EuiBasicTable,
  EuiBasicTableColumn,
  EuiConfirmModal,
  EuiContextMenuItem,
  EuiContextMenuPanel,
  EuiFlexGroup,
  EuiFlexItem,
  EuiPanel,
  EuiPopover,
  EuiSearchBar,
  EuiSmallButton,
  EuiSpacer,
  EuiText,
} from '@elastic/eui';
import { NotificationsStart } from 'opensearch-dashboards/public';
import { RouteComponentProps } from 'react-router-dom';
import { KVDBItem } from '../../../../types';
import { DataStore } from '../../../store/DataStore';
import { BREADCRUMBS, DEFAULT_EMPTY_DATA, ROUTES } from '../../../utils/constants';
import { PageHeader } from '../../../components/PageHeader/PageHeader';
import { formatCellValue, setBreadcrumbs } from '../../../utils/helpers';
import { KVDBS_PAGE_SIZE, KVDBS_SEARCH_SCHEMA, KVDBS_SORT_FIELD } from '../utils/constants';
import { KVDBDetailsFlyout } from '../components/KVDBDetailsFlyout';
import { SPACE_ACTIONS, SpaceTypes } from '../../../../common/constants';
import { actionIsAllowedOnSpace } from '../../../../common/helpers';
import { useSpaceSelector } from '../../../hooks/useSpaceSelector';
import {
  DELETE_ACTION,
  DELETE_SELECTED_ACTION,
  useDeleteItems,
} from '../../../hooks/useDeleteItems';

interface KVDBsProps extends RouteComponentProps {
  notifications: NotificationsStart;
}

export const KVDBs: React.FC<KVDBsProps> = ({ history, notifications }) => {
  const isMountedRef = useRef(true);
  const [items, setItems] = useState<KVDBItem[]>([]);
  const [totalItemCount, setTotalItemCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(KVDBS_PAGE_SIZE);
  const [sortField, setSortField] = useState(KVDBS_SORT_FIELD);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [searchQuery, setSearchQuery] = useState<any>(null);
  const [selectedKVDB, setSelectedKVDB] = useState<KVDBItem | null>(null);
  const { component: spaceSelector, spaceFilter } = useSpaceSelector({
    onSpaceChange: () => setPageIndex(0),
  });
  const [actionsPopoverOpen, setActionsPopoverOpen] = useState<boolean>(false);
  const [selectedItems, setSelectedItems] = useState<KVDBItem[]>([]);

  const isCreateActionDisabled = !actionIsAllowedOnSpace(spaceFilter, SPACE_ACTIONS.CREATE);
  const isDeleteActionAllowed = actionIsAllowedOnSpace(spaceFilter, SPACE_ACTIONS.DELETE);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    setBreadcrumbs([BREADCRUMBS.NORMALIZATION, BREADCRUMBS.KVDBS]);
  }, []);

  const buildQuery = useCallback(() => {
    let query = searchQuery ? EuiSearchBar.Query.toESQuery(searchQuery) : { match_all: {} };
    if (!query || Object.keys(query).length === 0) {
      query = { match_all: {} };
    }

    if (spaceFilter) {
      query = {
        bool: {
          must: [query, { term: { 'space.name': spaceFilter } }],
        },
      };
    }

    return query;
  }, [searchQuery, spaceFilter]);

  const fetchKVDBs = useCallback(async () => {
    setLoading(true);
    const sort = sortField ? [{ [sortField]: { order: sortDirection } }] : undefined;

    try {
      const response = await DataStore.kvdbs.searchKVDBs({
        from: pageIndex * pageSize,
        size: pageSize,
        sort,
        query: buildQuery(),
        track_total_hits: true,
      });

      setItems(response.items);
      setTotalItemCount(response.total);
    } finally {
      setLoading(false);
    }
  }, [pageIndex, pageSize, sortField, sortDirection, buildQuery]);

  useEffect(() => {
    fetchKVDBs();
  }, [fetchKVDBs]);

  const {
    itemForAction,
    setItemForAction,
    isDeleting,
    confirmDeleteSingle,
    confirmDeleteSelected,
  } = useDeleteItems({
    deleteOne: (id) => DataStore.kvdbs.deleteKVDB(id),
    reload: fetchKVDBs,
    notifications,
    entityName: 'KVDB',
    entityNamePlural: 'KVDBs',
    isMountedRef,
  });

  const onTableChange = ({ page, sort }: any) => {
    if (page) {
      setPageIndex(page.index);
      setPageSize(page.size);
    }

    if (sort) {
      setSortField(sort.field || KVDBS_SORT_FIELD);
      setSortDirection(sort.direction || 'asc');
    }
  };

  const onSearchChange = ({ query }: { query: any }) => {
    setSearchQuery(query);
    setPageIndex(0);
  };

  const pagination = useMemo(
    () => ({
      pageIndex,
      pageSize,
      totalItemCount,
      pageSizeOptions: [10, 25, 50, 100],
    }),
    [pageIndex, pageSize, totalItemCount]
  );

  const sorting = useMemo(
    () => ({
      sort: {
        field: sortField,
        direction: sortDirection,
      },
    }),
    [sortField, sortDirection]
  );

  const menuItems = [
    <EuiContextMenuItem
      key="create"
      icon="plusInCircle"
      href={`#${ROUTES.KVDBS_CREATE}`}
      disabled={isCreateActionDisabled}
      toolTipContent={
        isCreateActionDisabled ? `Cannot create KVDBs in the ${spaceFilter} space.` : undefined
      }
    >
      Create
    </EuiContextMenuItem>,
    <EuiContextMenuItem
      key="delete"
      icon="trash"
      onClick={() => {
        setItemForAction({ action: DELETE_SELECTED_ACTION });
        setActionsPopoverOpen(false);
      }}
      disabled={selectedItems.length === 0 || !isDeleteActionAllowed}
      toolTipContent={
        !isDeleteActionAllowed
          ? `Cannot delete KVDBs in the ${spaceFilter} space.`
          : selectedItems.length === 0
          ? 'Select KVDBs to delete'
          : undefined
      }
    >
      Delete selected ({selectedItems.length})
    </EuiContextMenuItem>,
  ];

  const columns: Array<EuiBasicTableColumn<KVDBItem>> = useMemo(
    () => [
      {
        field: 'document.title',
        name: 'Title',
        sortable: true,
        dataType: 'string',
        render: (value: string) => formatCellValue(value),
      },
      {
        field: 'integration.title',
        name: 'Integration',
        dataType: 'string',
        render: (value: string) => formatCellValue(value),
      },
      {
        field: 'document.author',
        name: 'Author',
        sortable: true,
        render: (value: string) => formatCellValue(value),
      },
      {
        name: 'Actions',
        align: 'right',
        actions: [
          {
            name: 'View',
            description: 'View KVDB details',
            type: 'icon',
            icon: 'inspect',
            onClick: (item: KVDBItem) => setSelectedKVDB(item),
          },
          {
            name: 'Edit',
            description: 'Edit KVDB',
            type: 'icon',
            icon: 'pencil',
            onClick: (item: KVDBItem) => history.push(`${ROUTES.KVDBS_EDIT}/${item.id}`),
            available: () => actionIsAllowedOnSpace(spaceFilter, SPACE_ACTIONS.EDIT),
          },
          {
            name: 'Delete',
            description: 'Delete KVDB',
            type: 'icon',
            icon: 'trash',
            color: 'danger',
            onClick: (item: KVDBItem) => setItemForAction({ action: DELETE_ACTION, id: item.id }),
            available: () => actionIsAllowedOnSpace(spaceFilter, SPACE_ACTIONS.DELETE),
          },
        ],
      },
    ],
    [spaceFilter, history]
  );

  return (
    <EuiFlexGroup direction="column" gutterSize="m">
      {selectedKVDB && (
        <KVDBDetailsFlyout kvdb={selectedKVDB} onClose={() => setSelectedKVDB(null)} />
      )}
      {itemForAction?.action === DELETE_ACTION && (
        <EuiConfirmModal
          title="Delete KVDB"
          onCancel={() => setItemForAction(null)}
          onConfirm={confirmDeleteSingle}
          cancelButtonText="Cancel"
          confirmButtonText="Delete"
          buttonColor="danger"
          defaultFocusedButton="cancel"
        >
          <p>Are you sure you want to delete this KVDB? This action cannot be undone.</p>
        </EuiConfirmModal>
      )}
      {itemForAction?.action === DELETE_SELECTED_ACTION && (
        <EuiConfirmModal
          title={`Delete ${selectedItems.length} KVDB${selectedItems.length !== 1 ? 's' : ''}`}
          onCancel={() => setItemForAction(null)}
          onConfirm={() => confirmDeleteSelected(selectedItems, () => setSelectedItems([]))}
          cancelButtonText="Cancel"
          confirmButtonText="Delete"
          buttonColor="danger"
          defaultFocusedButton="cancel"
        >
          <p>{`Are you sure you want to delete ${selectedItems.length} KVDB${
            selectedItems.length !== 1 ? 's' : ''
          }? This action cannot be undone.`}</p>
        </EuiConfirmModal>
      )}
      <EuiFlexItem grow={false}>
        <PageHeader>
          <EuiFlexGroup gutterSize="s" justifyContent="spaceBetween" alignItems="center">
            <EuiFlexItem>
              <EuiText size="s">
                <h1>KVDBs</h1>
              </EuiText>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>{spaceSelector}</EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiPopover
                id="kvdbsActionsPopover"
                button={
                  <EuiSmallButton
                    iconType="arrowDown"
                    iconSide="right"
                    onClick={() => setActionsPopoverOpen((prev) => !prev)}
                    data-test-subj="kvdbsActionsButton"
                  >
                    Actions
                  </EuiSmallButton>
                }
                isOpen={actionsPopoverOpen}
                closePopover={() => setActionsPopoverOpen(false)}
                panelPaddingSize="none"
                anchorPosition="downLeft"
              >
                <EuiContextMenuPanel size="s" items={menuItems} />
              </EuiPopover>
            </EuiFlexItem>
          </EuiFlexGroup>
        </PageHeader>
      </EuiFlexItem>
      <EuiSpacer size="xs" />
      <EuiFlexItem>
        <EuiPanel>
          <EuiFlexGroup alignItems="center" gutterSize="m">
            <EuiFlexItem>
              <EuiSearchBar
                box={{
                  placeholder: 'Search KVDBs',
                  incremental: true,
                  compressed: true,
                  schema: true,
                }}
                schema={KVDBS_SEARCH_SCHEMA}
                onChange={onSearchChange}
              />
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiSmallButton iconType="refresh" onClick={fetchKVDBs}>
                Refresh
              </EuiSmallButton>
            </EuiFlexItem>
          </EuiFlexGroup>
          <EuiSpacer size="m" />
          <EuiBasicTable
            items={items}
            columns={columns}
            loading={loading || isDeleting}
            pagination={pagination}
            sorting={sorting}
            onChange={onTableChange}
            itemId={(item) => item.document?.id || item.id}
            noItemsMessage="No KVDBs to display"
            selection={{
              selectable: () => true,
              onSelectionChange: setSelectedItems,
            }}
          />
        </EuiPanel>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};
