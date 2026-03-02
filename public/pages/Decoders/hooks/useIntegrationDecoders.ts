/*
 * Copyright Wazuh Inc.
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { DataStore } from "../../../store/DataStore";
import { DecoderTableItem } from "../../Integrations/components/IntegrationDecoders";

export interface useIntegrationDecodersParams {
  decoderIds: string[];
  space: string;
}

export function useIntegrationDecoders({
  decoderIds,
  space,
}: useIntegrationDecodersParams) {
  const [items, setItems] = useState<DecoderTableItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  useEffect(() => {
    if (decoderIds.length === 0) {
      setItems([]);
      return;
    }

    let cancelled = false;
    setLoading(true);

    DataStore.decoders
      .searchDecoders(
        {
          query: { ids: { values: decoderIds } },
          size: Math.min(decoderIds.length, 10000),
          _source: { includes: ["document", "space"] },
        },
        space,
      )
      .then((response) => {
        if (!cancelled) {
          setItems(
            response.items.map((item) => ({
              id: item.id,
              name: item.document?.name,
              title: item.document?.metadata?.title,
              author: item.document?.metadata?.author.name,
            })),
          );
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
  }, [decoderIds, space, reloadTrigger]);

  const refresh = useCallback(() => {
    setReloadTrigger((prev) => prev + 1);
  }, []);

  return { items, loading, refresh };
}
