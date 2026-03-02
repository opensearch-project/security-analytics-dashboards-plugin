/*
 * Copyright Wazuh Inc.
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { useCallback, useEffect, useState } from 'react';
import { DataStore } from '../../../store/DataStore';
import { KVDBItem } from '../../../../types';

export interface useIntegrationKVDBsParams {
  kvdbIds: string[];
}

export function useIntegrationKVDBs({ kvdbIds }: useIntegrationKVDBsParams) {
  const [items, setItems] = useState<KVDBItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  useEffect(() => {
    if (kvdbIds.length === 0) {
      setItems([]);
      return;
    }

    let cancelled = false;
    setLoading(true);

    DataStore.kvdbs
      .searchKVDBs({
        query: { terms: { 'document.id': kvdbIds } },
        size: Math.min(kvdbIds.length, 10000),
        track_total_hits: true,
      })
      .then((response) => {
        if (!cancelled) {
          setItems(response.items);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setItems([]);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [kvdbIds, reloadTrigger]);

  const refresh = useCallback(() => {
    setReloadTrigger((prev) => prev + 1);
  }, []);

  return { items, loading, refresh };
}
