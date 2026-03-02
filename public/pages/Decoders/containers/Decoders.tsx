/*
 * Copyright Wazuh Inc.
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { NotificationsStart } from 'opensearch-dashboards/public';
import { RouteComponentProps } from 'react-router-dom';
import {
  EuiBasicTable,
  EuiBasicTableColumn,
  EuiButtonIcon,
  EuiFieldSearch,
  EuiFlexGroup,
  EuiFlexItem,
  EuiPanel,
  EuiSpacer,
  EuiText,
  EuiToolTip,
  EuiPopover,
  EuiSmallButton,
  EuiContextMenuPanel,
  EuiContextMenuItem,
  EuiConfirmModal,
} from '@elastic/eui';
import { DataStore } from '../../../store/DataStore';
import { DecoderDocument, DecoderItem } from '../../../../types';
import { BREADCRUMBS, ROUTES } from '../../../utils/constants';
import { PageHeader } from '../../../components/PageHeader/PageHeader';
import { formatCellValue, setBreadcrumbs } from '../../../utils/helpers';
import { buildDecodersSearchQuery } from '../utils/constants';
import { DecoderDetailsFlyout } from '../components/DecoderDetailsFlyout';
import { SpaceTypes } from '../../../../common/constants';
import { useSpaceSelector } from '../../../hooks/useSpaceSelector';
import {
  DELETE_ACTION,
  DELETE_SELECTED_ACTION,
  useDeleteItems,
} from '../../../hooks/useDeleteItems';

const DEFAULT_PAGE_SIZE = 25;

interface DecodersProps {
  history: RouteComponentProps['history'];
  notifications: NotificationsStart;
}

export const Decoders: React.FC<DecodersProps> = ({ history, notifications }) => {
  const isMountedRef = useRef(true);
  const [decoders, setDecoders] = useState<DecoderItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [sortField, setSortField] = useState<string>('document.name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const { component: spaceSelector, spaceFilter } = useSpaceSelector({
    onSpaceChange: () => setPageIndex(0),
  });
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [selectedDecoder, setSelectedDecoder] = useState<{
    id: string;
    space?: string;
  } | null>(null);
  const [selectedItems, setSelectedItems] = useState<DecoderItem[]>([]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    setBreadcrumbs([BREADCRUMBS.NORMALIZATION, BREADCRUMBS.DECODERS]);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setAppliedSearch(searchText);
      setPageIndex(0);
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchText]);

  const loadDecoders = useCallback(async () => {
    setLoading(true);
    const query = buildDecodersSearchQuery(appliedSearch);
    const sort = sortField
      ? [
          {
            [sortField]: {
              order: sortDirection,
            },
          },
        ]
      : undefined;

    const response = await DataStore.decoders.searchDecoders(
      {
        from: pageIndex * pageSize,
        size: pageSize,
        sort,
        query,
        _source: { includes: ['document', 'space'] },
      },
      spaceFilter
    );

    if (!isMountedRef.current) {
      return;
    }
    setDecoders(response.items);
    setTotal(response.total);
    setLoading(false);
  }, [appliedSearch, pageIndex, pageSize, spaceFilter, sortField, sortDirection]);

  useEffect(() => {
    loadDecoders();
  }, [loadDecoders]);

  const {
    itemForAction,
    setItemForAction,
    isDeleting,
    confirmDeleteSingle,
    confirmDeleteSelected,
  } = useDeleteItems({
    deleteOne: (id) => DataStore.decoders.deleteDecoder(id),
    reload: loadDecoders,
    notifications,
    entityName: 'decoder',
    entityNamePlural: 'decoders',
    isMountedRef,
  });

  const onTableChange = ({ page, sort }: { page: any; sort?: any }) => {
    if (page) {
      setPageIndex(page.index);
      setPageSize(page.size);
    }
    if (sort) {
      setSortField(sort.field);
      setSortDirection(sort.direction);
    }
  };

  const columns: Array<EuiBasicTableColumn<DecoderItem>> = useMemo(
    () => [
      {
        field: 'document.name',
        name: 'Name',
        sortable: true,
        render: (value: string) => formatCellValue(value),
      },
      {
        field: 'document.metadata.title',
        name: 'Title',
        render: (value: string) => formatCellValue(value),
      },
      {
        field: 'integrations',
        name: 'Integration',
      },
      {
        field: 'document.metadata.author.name',
        name: 'Author',
        sortable: true,
        render: (value: string) => formatCellValue(value),
      },
      {
        name: 'Actions',
        actions: [
          {
            name: 'View',
            description: 'View decoder details',
            type: 'icon',
            icon: 'inspect',
            onClick: (item: DecoderItem) => setSelectedDecoder({ id: item.id, space: item.space }),
          },
          {
            name: 'Edit',
            description: 'Edit decoder',
            type: 'icon',
            icon: 'pencil',
            onClick: (item: DecoderDocument) => history.push(`${ROUTES.DECODERS_EDIT}/${item.id}`),
            available: () => spaceFilter === SpaceTypes.DRAFT.value,
          },
          {
            name: 'Delete',
            description: 'Delete decoder',
            type: 'icon',
            icon: 'trash',
            onClick: (item: DecoderItem) =>
              setItemForAction({ action: DELETE_ACTION, id: item.id }),
            // available: () => spaceFilter === SpaceTypes.DRAFT.value,
          },
        ],
      },
    ],
    [spaceFilter, history]
  );

  const panels = [
    <EuiContextMenuItem
      key="create"
      icon="plusInCircle"
      href={`#${ROUTES.DECODERS_CREATE}`}
      disabled={spaceFilter !== SpaceTypes.DRAFT.value}
      toolTipContent={
        spaceFilter !== SpaceTypes.DRAFT.value
          ? `Cannot create decoders in the ${spaceFilter} space.`
          : undefined
      }
    >
      Create
    </EuiContextMenuItem>,
    <EuiContextMenuItem
      key="delete"
      icon="trash"
      onClick={() => {
        setItemForAction({ action: DELETE_SELECTED_ACTION });
        setIsPopoverOpen(false);
      }}
      disabled={selectedItems.length === 0 || spaceFilter !== SpaceTypes.DRAFT.value}
      toolTipContent={
        spaceFilter !== SpaceTypes.DRAFT.value
          ? `Cannot delete decoders in the ${spaceFilter} space.`
          : selectedItems.length === 0
          ? 'Select decoders to delete'
          : undefined
      }
    >
      Delete selected ({selectedItems.length})
    </EuiContextMenuItem>,
  ];

  const handlerShowActionsButton = () => setIsPopoverOpen((prevState) => !prevState);

  const actionsButton = (
    <EuiPopover
      id={'decodersActionsPopover'}
      button={
        <EuiSmallButton
          iconType={'arrowDown'}
          iconSide={'right'}
          onClick={handlerShowActionsButton}
          data-test-subj={'decodersActionsButton'}
        >
          Actions
        </EuiSmallButton>
      }
      isOpen={isPopoverOpen}
      closePopover={handlerShowActionsButton}
      panelPaddingSize={'none'}
      anchorPosition={'downLeft'}
      data-test-subj={'decodersActionsPopover'}
    >
      <EuiContextMenuPanel items={panels} size="s" />
    </EuiPopover>
  );

  return (
    <EuiFlexGroup direction="column" gutterSize="m">
      {selectedDecoder && (
        <DecoderDetailsFlyout
          decoderId={selectedDecoder.id}
          space={spaceFilter}
          onClose={() => setSelectedDecoder(null)}
        />
      )}
      {itemForAction?.action === DELETE_ACTION && (
        <EuiConfirmModal
          title="Delete decoder"
          onCancel={() => setItemForAction(null)}
          onConfirm={confirmDeleteSingle}
          cancelButtonText="Cancel"
          confirmButtonText="Delete"
          buttonColor="danger"
          defaultFocusedButton="cancel"
        >
          <p>Are you sure you want to delete this decoder? This action cannot be undone.</p>
        </EuiConfirmModal>
      )}
      {itemForAction?.action === DELETE_SELECTED_ACTION && (
        <EuiConfirmModal
          title={`Delete ${selectedItems.length} decoder${selectedItems.length !== 1 ? 's' : ''}`}
          onCancel={() => setItemForAction(null)}
          onConfirm={() => confirmDeleteSelected(selectedItems, () => setSelectedItems([]))}
          cancelButtonText="Cancel"
          confirmButtonText="Delete"
          buttonColor="danger"
          defaultFocusedButton="cancel"
        >
          <p>{`Are you sure you want to delete ${selectedItems.length} decoder${
            selectedItems.length !== 1 ? 's' : ''
          }? This action cannot be undone.`}</p>
        </EuiConfirmModal>
      )}
      <EuiFlexItem grow={false}>
        <PageHeader>
          <EuiFlexItem>
            <EuiFlexGroup alignItems="center" justifyContent="spaceBetween">
              <EuiFlexItem>
                <EuiText size="s">
                  <h1>Decoders</h1>
                </EuiText>
              </EuiFlexItem>
              <EuiFlexItem grow={false}>{spaceSelector}</EuiFlexItem>
              <EuiFlexItem grow={false}>{actionsButton}</EuiFlexItem>
            </EuiFlexGroup>
          </EuiFlexItem>
        </PageHeader>
      </EuiFlexItem>
      <EuiFlexItem>
        <EuiPanel>
          <EuiFlexGroup alignItems="center" gutterSize="m">
            <EuiFlexItem>
              <EuiFieldSearch
                fullWidth
                placeholder="Search decoders"
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                isClearable
                aria-label="Search decoders"
              />
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiToolTip content="Refresh">
                <EuiButtonIcon
                  iconType="refresh"
                  aria-label="Refresh decoders"
                  onClick={() => loadDecoders()}
                />
              </EuiToolTip>
            </EuiFlexItem>
          </EuiFlexGroup>
          <EuiSpacer size="m" />
          <EuiBasicTable
            items={decoders}
            columns={columns}
            loading={loading || isDeleting}
            pagination={{
              pageIndex,
              pageSize,
              totalItemCount: total,
              pageSizeOptions: [10, 25, 50],
            }}
            sorting={{ sort: { field: sortField, direction: sortDirection } }}
            onChange={onTableChange}
            itemId="id"
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
