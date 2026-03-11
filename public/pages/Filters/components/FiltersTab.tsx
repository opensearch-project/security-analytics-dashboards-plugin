/*
 * Copyright Wazuh Inc.
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  EuiSmallButton,
  EuiCard,
  EuiConfirmModal,
  EuiContextMenuItem,
  EuiContextMenuPanel,
  EuiInMemoryTable,
  EuiPopover,
} from '@elastic/eui';
import { NotificationsStart } from 'opensearch-dashboards/public';
import { RouteComponentProps } from 'react-router-dom';
import { FilterItem } from '../../../../types';
import { DataStore } from '../../../store/DataStore';
import { ROUTES } from '../../../utils/constants';
import { pluralize } from '../../../utils/helpers';
import { FiltersAllowedActionsBySpace, SPACE_ACTIONS } from '../../../../common/constants';
import { actionIsAllowedOnSpace, getSpacesAllowAction } from '../../../../common/helpers';
import {
  DELETE_ACTION,
  DELETE_SELECTED_ACTION,
  useDeleteItems,
} from '../../../hooks/useDeleteItems';
import {
  FilterTableItem,
  getFiltersTableColumns,
  getFiltersTableSearchConfig,
  toFilterTableItem,
} from '../utils/helpers';
import { FilterDetailsFlyout } from './FilterDetailsFlyout';

export interface FiltersTabProps {
  spaceFilter: string;
  notifications: NotificationsStart;
  history: RouteComponentProps['history'];
}

export const FiltersTab: React.FC<FiltersTabProps> = ({ spaceFilter, notifications, history }) => {
  const isMountedRef = useRef(true);
  const [items, setItems] = useState<FilterTableItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState<FilterTableItem[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<FilterItem | null>(null);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const buildQuery = useCallback(() => {
    const baseQuery = { match_all: {} };
    if (spaceFilter) {
      return {
        bool: {
          must: [baseQuery, { term: { 'space.name': spaceFilter } }],
        },
      };
    }
    return baseQuery;
  }, [spaceFilter]);

  const fetchFilters = useCallback(async () => {
    setLoading(true);
    try {
      const { items: fetchedItems } = await DataStore.filters.searchFilters({
        size: 10000,
        sort: [{ 'document.name': { order: 'asc' } }],
        query: buildQuery(),
      });
      if (isMountedRef.current) {
        setItems(fetchedItems.map(toFilterTableItem));
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [buildQuery]);

  useEffect(() => {
    fetchFilters();
  }, [fetchFilters]);

  const isCreateActionAllowed = actionIsAllowedOnSpace(
    spaceFilter,
    SPACE_ACTIONS.CREATE,
    FiltersAllowedActionsBySpace
  );
  const isDeleteActionAllowed = actionIsAllowedOnSpace(
    spaceFilter,
    SPACE_ACTIONS.DELETE,
    FiltersAllowedActionsBySpace
  );

  const {
    itemForAction,
    setItemForAction,
    isDeleting,
    confirmDeleteSingle,
    confirmDeleteSelected,
  } = useDeleteItems({
    deleteOne: (id) => DataStore.filters.deleteFilter(id),
    reload: fetchFilters,
    notifications,
    entityName: 'filter',
    entityNamePlural: 'filters',
    isMountedRef,
  });

  const onViewDetails = useCallback((item: FilterItem) => {
    setSelectedFilter(item);
  }, []);

  const onEdit = useCallback(
    (item: FilterItem) => {
      history.push(`${ROUTES.FILTERS_EDIT}/${item.id}`);
    },
    [history]
  );

  const onDelete = useCallback(
    (item: FilterItem) => {
      setItemForAction({ action: DELETE_ACTION, id: item.id });
    },
    [setItemForAction]
  );

  const actionsButton = (
    <EuiPopover
      id="filtersActionsPopover"
      button={
        <EuiSmallButton
          iconType="arrowDown"
          iconSide="right"
          onClick={() => setIsPopoverOpen((prev) => !prev)}
          data-test-subj="filtersActionsButton"
        >
          Actions
        </EuiSmallButton>
      }
      isOpen={isPopoverOpen}
      closePopover={() => setIsPopoverOpen(false)}
      panelPaddingSize="none"
      anchorPosition="downLeft"
      data-test-subj="filtersActionsPopover"
    >
      <EuiContextMenuPanel
        items={[
          <EuiContextMenuItem
            key="create"
            icon="plusInCircle"
            href={`#${ROUTES.FILTERS_CREATE}`}
            onClick={() => setIsPopoverOpen(false)}
            disabled={!isCreateActionAllowed}
            toolTipContent={
              !isCreateActionAllowed
                ? `Filters can only be created in the spaces: ${getSpacesAllowAction(
                    SPACE_ACTIONS.CREATE,
                    FiltersAllowedActionsBySpace
                  ).join(', ')}`
                : undefined
            }
          >
            Create
          </EuiContextMenuItem>,
          <EuiContextMenuItem
            key="delete_selected"
            icon="trash"
            disabled={!isDeleteActionAllowed || selectedItems.length === 0}
            toolTipContent={
              !isDeleteActionAllowed
                ? `Filters can only be deleted in the spaces: ${getSpacesAllowAction(
                    SPACE_ACTIONS.DELETE,
                    FiltersAllowedActionsBySpace
                  ).join(', ')}`
                : selectedItems.length === 0
                ? 'Select filters to delete'
                : undefined
            }
            onClick={() => {
              setItemForAction({ action: DELETE_SELECTED_ACTION });
              setIsPopoverOpen(false);
            }}
          >
            Delete selected ({selectedItems.length})
          </EuiContextMenuItem>,
        ]}
        size="s"
      />
    </EuiPopover>
  );

  return (
    <>
      <EuiInMemoryTable
        itemId="id"
        items={items}
        loading={loading || isDeleting}
        columns={getFiltersTableColumns(spaceFilter, onViewDetails, onEdit, onDelete)}
        pagination={{ initialPageSize: 25 }}
        search={getFiltersTableSearchConfig(items, { toolsRight: [actionsButton] })}
        selection={{
          onSelectionChange: setSelectedItems,
          initialSelected: [],
        }}
        isSelectable={true}
        sorting={true}
      />

      {selectedFilter && (
        <FilterDetailsFlyout filter={selectedFilter} onClose={() => setSelectedFilter(null)} />
      )}

      {itemForAction?.action === DELETE_ACTION && (
        <EuiConfirmModal
          title="Delete filter?"
          onCancel={() => setItemForAction(null)}
          onConfirm={confirmDeleteSingle}
          cancelButtonText="Cancel"
          confirmButtonText="Delete"
          buttonColor="danger"
          defaultFocusedButton="cancel"
        >
          <p>Are you sure you want to delete this filter? This action cannot be undone.</p>
        </EuiConfirmModal>
      )}

      {itemForAction?.action === DELETE_SELECTED_ACTION && (
        <EuiConfirmModal
          title={`Delete ${selectedItems.length} ${pluralize(selectedItems.length, 'filter')}?`}
          onCancel={() => setItemForAction(null)}
          onConfirm={() => confirmDeleteSelected(selectedItems, () => setSelectedItems([]))}
          cancelButtonText="Cancel"
          confirmButtonText="Delete"
          buttonColor="danger"
          defaultFocusedButton="cancel"
          isLoading={isDeleting}
        >
          <p>{`Are you sure you want to delete ${selectedItems.length} ${pluralize(
            selectedItems.length,
            'filter'
          )}? This action cannot be undone.`}</p>
        </EuiConfirmModal>
      )}
    </>
  );
};
