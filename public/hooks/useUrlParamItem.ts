/*
 * Copyright Wazuh Inc.
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { useEffect, useCallback, useRef } from 'react';
import { useHistory } from 'react-router-dom';

export const useUrlParamItem = <T>({
  paramName,
  fetchById,
  onFound,
  onClear,
}: {
  paramName: string;
  fetchById: (id: string) => Promise<T | undefined>;
  onFound: (item: T) => void;
  onClear?: () => void;
}) => {
  const history = useHistory();
  const handledRef = useRef<string | null>(null);
  const callbacksRef = useRef({ fetchById, onFound, onClear });
  
  useEffect(() => {
    callbacksRef.current = { fetchById, onFound, onClear };
  });

  const handleId = useCallback((id: string | null) => {
    if (!id) {
      if (handledRef.current !== null) {
        handledRef.current = null;
        callbacksRef.current.onClear?.();
      }
      return;
    }

    if (handledRef.current === id) return;

    handledRef.current = id;
    callbacksRef.current.fetchById(id).then((item) => {
      if (item && handledRef.current === id) callbacksRef.current.onFound(item);
    });
  }, []);

  useEffect(() => {
    const id = new URLSearchParams(history.location.search).get(paramName);
    handleId(id);
  }, []);

  useEffect(() => {
    return history.listen((location) => {
      const id = new URLSearchParams(location.search).get(paramName);
      handleId(id);
    });
  }, []);

  const setParam = (id: string) => {
    const params = new URLSearchParams(history.location.search);
    params.set(paramName, id);
    history.push({ ...history.location, search: params.toString() });
  };

  const clearParam = () => {
    const params = new URLSearchParams(history.location.search);
    params.delete(paramName);
    history.replace({ ...history.location, search: params.toString() });
  };

  return { setParam, clearParam };
};
