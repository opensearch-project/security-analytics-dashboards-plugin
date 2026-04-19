/*
 * Copyright Wazuh Inc.
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React, { useCallback, useEffect, useRef, useState } from "react";
import { SpaceSelector } from "../components/SpaceSelector/SpaceSelector";
import { useSpaceFilter } from "./useSpaceFilter";
import { Space } from "../../types";

interface UseSpaceSelectorOptions {
  isDisabled?: boolean;
  isLoading?: boolean;
  documentationUrl?: string;
  onSpaceChange?: (spaceId: string) => void;
}

export const useSpaceSelector = (
  options: UseSpaceSelectorOptions = {},
): { component: React.ReactComponentElement; spaceFilter: Space } => {
  const { isDisabled, isLoading, documentationUrl, onSpaceChange } = options;
  const [spaceFilter, setSpaceFilter] = useSpaceFilter();
  const [isChanging, setIsChanging] = useState(false);
  const trackPending = isLoading !== undefined;
  const prevLoadingRef = useRef(!!isLoading);

  useEffect(() => {
    if (!trackPending) return;
    if (prevLoadingRef.current && !isLoading) {
      setIsChanging(false);
    }
    prevLoadingRef.current = !!isLoading;
  }, [isLoading, trackPending]);

  const handleSpaceChange = useCallback(
    (id: string) => {
      if (id === spaceFilter) return;
      if (trackPending) setIsChanging(true);
      setSpaceFilter(id);
      onSpaceChange?.(id);
    },
    [setSpaceFilter, onSpaceChange, spaceFilter, trackPending],
  );

  const component = (
    <SpaceSelector
      selectedSpace={spaceFilter}
      onSpaceChange={handleSpaceChange}
      isDisabled={isDisabled || isLoading || isChanging}
      documentationUrl={documentationUrl}
    />
  );

  return { component, spaceFilter };
};
