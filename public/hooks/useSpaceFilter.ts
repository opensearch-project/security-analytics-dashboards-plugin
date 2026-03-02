/*
 * Copyright Wazuh Inc.
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { useEffect, useMemo } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { SpaceTypes } from '../../common/constants';
import { Space } from '../../types';

const SPACE_FILTER_KEY = 'security_analytics_space_filter';

export const useSpaceFilter = () => {
  const location = useLocation();
  const history = useHistory();

  const spaceFilter = useMemo(
    () =>
      new URLSearchParams(location.search).get('space') ||
      localStorage?.getItem(SPACE_FILTER_KEY) ||
      SpaceTypes.STANDARD.value,
    [location.search]
  );

  // Add space param to URL if missing
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (!params.has('space')) {
      params.set('space', spaceFilter);
      history.replace({ ...location, search: params.toString() });
    }
  }, [location.pathname]);

  // Persist to localStorage for cross-page navigation fallback
  useEffect(() => {
    localStorage?.setItem(SPACE_FILTER_KEY, spaceFilter);
  }, [spaceFilter]);

  const setSpaceFilter = (id: string) => {
    const params = new URLSearchParams(location.search);
    params.set('space', id);
    history.replace({ ...location, search: params.toString() });
    localStorage?.setItem(SPACE_FILTER_KEY, id);
  };

  return [spaceFilter as Space, setSpaceFilter] as const;
};
