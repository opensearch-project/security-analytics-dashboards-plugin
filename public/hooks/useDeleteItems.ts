/*
 * Copyright Wazuh Inc.
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { MutableRefObject, useCallback, useRef, useState } from 'react';
import { NotificationsStart } from 'opensearch-dashboards/public';
import { successNotificationToast } from '../utils/helpers';

export const DELETE_ACTION = 'delete' as const;
export const DELETE_SELECTED_ACTION = 'delete_selected' as const;

export type DeleteItemForAction =
  | { action: typeof DELETE_ACTION; id: string }
  | { action: typeof DELETE_SELECTED_ACTION };

interface UseDeleteItemsOptions {
  deleteOne: (id: string) => Promise<unknown>;
  reload: () => Promise<void> | void;
  notifications: NotificationsStart;
  entityName: string;
  entityNamePlural: string;
  isMountedRef: MutableRefObject<boolean>;
}

export function useDeleteItems({
  deleteOne,
  reload,
  notifications,
  entityName,
  entityNamePlural,
  isMountedRef,
}: UseDeleteItemsOptions) {
  const deleteOneRef = useRef(deleteOne);
  const reloadRef = useRef(reload);
  deleteOneRef.current = deleteOne;
  reloadRef.current = reload;

  const [itemForAction, setItemForAction] = useState<DeleteItemForAction | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const confirmDeleteSingle = useCallback(async () => {
    if (itemForAction?.action !== DELETE_ACTION) return;
    const { id } = itemForAction;
    setItemForAction(null);

    const result = await deleteOneRef.current(id);
    if (result !== undefined) {
      successNotificationToast(notifications, 'deleted', entityName);
      reloadRef.current();
    }
  }, [itemForAction, notifications, entityName]);

  const confirmDeleteSelected = useCallback(
    async (selectedItems: Array<{ id: string }>, onSuccess: () => void) => {
      setIsDeleting(true);
      try {
        const deleteResults = await Promise.all(
          selectedItems.map((item) => deleteOneRef.current(item.id))
        );
        const deletedCount = deleteResults.filter((r) => r !== undefined).length;
        const failedCount = deleteResults.length - deletedCount;

        if (deletedCount > 0) {
          successNotificationToast(
            notifications,
            'deleted',
            deletedCount === 1 ? entityName : entityNamePlural
          );
        }

        if (failedCount > 0) {
          notifications.toasts.addWarning({
            title: `Some ${entityNamePlural} could not be deleted`,
            text: `${failedCount} ${
              failedCount !== 1 ? entityNamePlural : entityName
            } could not be deleted.`,
            toastLifeTimeMs: 5000,
          });
        }

        await reloadRef.current();
        if (isMountedRef.current) {
          onSuccess();
        }
      } finally {
        if (isMountedRef.current) {
          setIsDeleting(false);
          setItemForAction(null);
        }
      }
    },
    [notifications, entityName, entityNamePlural, isMountedRef]
  );

  return {
    itemForAction,
    setItemForAction,
    isDeleting,
    confirmDeleteSingle,
    confirmDeleteSelected,
  };
}
