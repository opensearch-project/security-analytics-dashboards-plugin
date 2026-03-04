/*
 * Copyright Wazuh Inc.
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { NotificationsStart } from 'opensearch-dashboards/public';
import { RouteComponentProps } from 'react-router-dom';
import {
  EuiBadge,
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
import { DataStore } from '../../../../store/DataStore';
import { RuleItemInfoBase } from '../../../../../types';
import { BREADCRUMBS, ROUTES } from '../../../../utils/constants';
import { PageHeader } from '../../../../components/PageHeader/PageHeader';
import { setBreadcrumbs } from '../../../../utils/helpers';
import { buildRulesSearchQuery } from '../../utils/constants';
import { RuleTableItem } from '../../utils/helpers';
import { getSeverityColor, getSeverityLabel } from '../../../Correlations/utils/constants';
import { RuleViewerFlyout } from '../../components/RuleViewerFlyout/RuleViewerFlyout';
import { SpaceTypes } from '../../../../../common/constants';
import { useSpaceSelector } from '../../../../hooks/useSpaceSelector';
import {
  DELETE_ACTION,
  DELETE_SELECTED_ACTION,
  useDeleteItems,
} from '../../../../hooks/useDeleteItems';

const DEFAULT_PAGE_SIZE = 25;

const SORT_FIELD_TO_OS: Record<string, string | undefined> = {
  title: 'document.title',
  level: 'document.level',
  category: 'document.logsource.category',
};

interface RulesProps {
  history: RouteComponentProps['history'];
  notifications: NotificationsStart;
}

const toRuleTableItem = (rule: RuleItemInfoBase): RuleTableItem => ({
  title: rule._source.title,
  level: rule._source.level,
  category: rule._source.category,
  source: rule.prePackaged ? 'Standard' : 'Custom',
  description: rule._source.description,
  ruleInfo: rule,
  ruleId: rule._id,
});

export const Rules: React.FC<RulesProps> = ({ history, notifications }) => {
  const isMountedRef = useRef(true);
  const [allRules, setAllRules] = useState<RuleTableItem[]>([]);
  const [totalRules, setTotalRules] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [sortField, setSortField] = useState<string>('title');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const { component: spaceSelector, spaceFilter } = useSpaceSelector({
    onSpaceChange: () => setPageIndex(0),
  });
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [selectedRule, setSelectedRule] = useState<RuleTableItem | null>(null);
  const [selectedItems, setSelectedItems] = useState<RuleTableItem[]>([]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    setBreadcrumbs([BREADCRUMBS.DETECTION, BREADCRUMBS.RULES]);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setAppliedSearch(searchText);
      setPageIndex(0);
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchText]);

  const loadRules = useCallback(async () => {
    setLoading(true);
    const query = buildRulesSearchQuery(appliedSearch);
    const osField = SORT_FIELD_TO_OS[sortField];
    const sort = osField ? [{ [osField]: { order: sortDirection } }] : undefined;
    const response = await DataStore.rules.searchRules(
      { query, from: pageIndex * pageSize, size: pageSize, sort },
      spaceFilter
    );

    if (!isMountedRef.current) return;

    setAllRules(response.items.map(toRuleTableItem));
    setTotalRules(response.total);
    setSelectedItems([]);
    setLoading(false);
  }, [appliedSearch, spaceFilter, pageIndex, pageSize, sortField, sortDirection]);

  useEffect(() => {
    loadRules();
  }, [loadRules]);

  const {
    itemForAction,
    setItemForAction,
    isDeleting,
    confirmDeleteSingle,
    confirmDeleteSelected,
  } = useDeleteItems({
    deleteOne: async (id) => {
      const ok = await DataStore.rules.deleteRule(id);
      return ok ? ok : undefined;
    },
    reload: loadRules,
    notifications,
    entityName: 'rule',
    entityNamePlural: 'rules',
    isMountedRef,
  });

  const onTableChange = ({ page, sort }: { page?: any; sort?: any }) => {
    if (sort) {
      setSortField(sort.field);
      setSortDirection(sort.direction);
      setPageIndex(0);
    }
    if (page) {
      setPageIndex(page.index);
      setPageSize(page.size);
    }
  };

  const hideFlyout = (refreshRules?: boolean) => {
    setSelectedRule(null);
    if (refreshRules) {
      loadRules();
    }
  };

  const columns: Array<EuiBasicTableColumn<RuleTableItem>> = useMemo(
    () => [
      {
        field: 'title',
        name: 'Name',
        sortable: true,
        truncateText: true,
      },
      {
        field: 'level',
        name: 'Severity',
        sortable: true,
        render: (level: string) => {
          const { text, background } = getSeverityColor(level);
          return (
            <EuiBadge style={{ color: text }} color={background}>
              {getSeverityLabel(level)}
            </EuiBadge>
          );
        },
      },
      {
        field: 'category',
        name: 'Integration',
        sortable: true,
      },
      {
        field: 'description',
        name: 'Description',
        sortable: false,
        truncateText: true,
      },
      {
        name: 'Actions',
        actions: [
          {
            name: 'View',
            description: 'View rule details',
            type: 'icon',
            icon: 'inspect',
            onClick: (item: RuleTableItem) => setSelectedRule(item),
          },
          {
            name: 'Edit',
            description: 'Edit rule',
            type: 'icon',
            icon: 'pencil',
            onClick: (item: RuleTableItem) =>
              history.push({ pathname: ROUTES.RULES_EDIT, state: { ruleItem: item.ruleInfo } }),
            available: () => spaceFilter === SpaceTypes.DRAFT.value,
          },
          {
            name: 'Delete',
            description: 'Delete rule',
            type: 'icon',
            icon: 'trash',
            onClick: (item: RuleTableItem) =>
              setItemForAction({ action: DELETE_ACTION, id: item.ruleId }),
            available: () => spaceFilter === SpaceTypes.DRAFT.value,
          },
        ],
      },
    ],
    [history, spaceFilter]
  );

  const isDraftSpace = spaceFilter === SpaceTypes.DRAFT.value;

  const panels = [
    <EuiContextMenuItem
      key="create"
      icon="plusInCircle"
      href={`#${ROUTES.RULES_CREATE}`}
      disabled={!isDraftSpace}
      toolTipContent={
        !isDraftSpace ? `Cannot create rules in the ${spaceFilter} space.` : undefined
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
      disabled={selectedItems.length === 0 || !isDraftSpace}
      toolTipContent={
        !isDraftSpace
          ? `Cannot delete rules in the ${spaceFilter} space.`
          : selectedItems.length === 0
          ? 'Select rules to delete'
          : undefined
      }
    >
      Delete selected ({selectedItems.length})
    </EuiContextMenuItem>,
  ];

  const actionsButton = (
    <EuiPopover
      id={'rulesActionsPopover'}
      button={
        <EuiSmallButton
          iconType={'arrowDown'}
          iconSide={'right'}
          onClick={() => setIsPopoverOpen((prev) => !prev)}
          data-test-subj={'rulesActionsButton'}
        >
          Actions
        </EuiSmallButton>
      }
      isOpen={isPopoverOpen}
      closePopover={() => setIsPopoverOpen(false)}
      panelPaddingSize={'none'}
      anchorPosition={'downLeft'}
      data-test-subj={'rulesActionsPopover'}
    >
      <EuiContextMenuPanel items={panels} size="s" />
    </EuiPopover>
  );

  return (
    <EuiFlexGroup direction="column" gutterSize="m">
      {selectedRule && <RuleViewerFlyout ruleTableItem={selectedRule} hideFlyout={hideFlyout} />}
      {itemForAction?.action === DELETE_ACTION && (
        <EuiConfirmModal
          title="Delete rule"
          onCancel={() => setItemForAction(null)}
          onConfirm={confirmDeleteSingle}
          cancelButtonText="Cancel"
          confirmButtonText="Delete"
          buttonColor="danger"
          defaultFocusedButton="cancel"
        >
          <p>Are you sure you want to delete this rule? This action cannot be undone.</p>
        </EuiConfirmModal>
      )}
      {itemForAction?.action === DELETE_SELECTED_ACTION && (
        <EuiConfirmModal
          title={`Delete ${selectedItems.length} rule${selectedItems.length !== 1 ? 's' : ''}`}
          onCancel={() => setItemForAction(null)}
          onConfirm={() =>
            confirmDeleteSelected(
              selectedItems.map((item) => ({ id: item.ruleId })),
              () => setSelectedItems([])
            )
          }
          cancelButtonText="Cancel"
          confirmButtonText="Delete"
          buttonColor="danger"
          defaultFocusedButton="cancel"
        >
          <p>{`Are you sure you want to delete ${selectedItems.length} rule${
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
                  <h1>Rules</h1>
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
                placeholder="Search rules"
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                isClearable
                aria-label="Search rules"
              />
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiToolTip content="Refresh">
                <EuiButtonIcon
                  iconType="refresh"
                  aria-label="Refresh rules"
                  onClick={() => loadRules()}
                />
              </EuiToolTip>
            </EuiFlexItem>
          </EuiFlexGroup>
          <EuiSpacer size="m" />
          <EuiBasicTable
            items={allRules}
            columns={columns}
            loading={loading || isDeleting}
            pagination={{
              pageIndex,
              pageSize,
              totalItemCount: totalRules,
              pageSizeOptions: [10, 25, 50],
            }}
            sorting={{ sort: { field: sortField, direction: sortDirection } }}
            onChange={onTableChange}
            itemId="ruleId"
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
