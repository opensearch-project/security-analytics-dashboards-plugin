/*
 * Copyright Wazuh Inc.
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { useEffect, useState } from 'react';
import { NotificationsStart } from 'opensearch-dashboards/public';
import { DataStore } from '../../store/DataStore';
import { errorNotificationToast } from '../../utils/helpers';

export interface IntegrationOption {
  value: string;
  label: string;
  id: string;
}

interface UseIntegrationSelectorParams {
  notifications: NotificationsStart;
  enabled?: boolean;
}

export function useIntegrationSelector({
  notifications,
  enabled = true,
}: UseIntegrationSelectorParams) {
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState<IntegrationOption[]>([]);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;
    setLoading(true);

    DataStore.decoders
      .getDraftIntegrations()
      .then((result) => {
        if (!cancelled) {
          setOptions(
            result.map((option: any) => ({
              value: option._source.document.title,
              label: option._source.document.title,
              id: option._id,
            }))
          );
        }
      })
      .catch(() => {
        if (!cancelled) {
          errorNotificationToast(
            notifications,
            'retrieve',
            'integration types',
            'There was an error retrieving the integration types.'
          );
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
  }, [notifications, enabled]);

  return { loading, options };
}
