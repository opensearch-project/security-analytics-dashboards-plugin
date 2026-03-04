/*
 * Copyright Wazuh Inc.
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { useCallback, useEffect, useState } from 'react';
import { DataStore } from '../../../store/DataStore';
import { RuleItemInfoBase } from '../../../../types';
import { RuleTableItem } from '../utils/helpers';

const toRuleTableItem = (rule: RuleItemInfoBase): RuleTableItem => ({
  title: rule._source.title,
  level: rule._source.level,
  category: rule._source.category,
  source: rule.prePackaged ? 'Standard' : 'Custom',
  description: rule._source.description,
  ruleInfo: rule,
  ruleId: rule._id,
});

export function useIntegrationRules({ space }: { space: string }) {
  const [items, setItems] = useState<RuleTableItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  useEffect(() => {
    if (!space) {
      setItems([]);
      return;
    }

    let cancelled = false;
    setLoading(true);

    DataStore.rules
      .searchRules({ size: 5000 }, space)
      .then((response) => {
        if (!cancelled) {
          setItems(response.items.map(toRuleTableItem));
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
  }, [space, reloadTrigger]);

  const refresh = useCallback(() => {
    setReloadTrigger((prev) => prev + 1);
  }, []);

  return { items, loading, refresh };
}
