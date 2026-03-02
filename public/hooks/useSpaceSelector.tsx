/*
 * Copyright Wazuh Inc.
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React, { useCallback } from 'react';
import { SpaceSelector } from '../components/SpaceSelector/SpaceSelector';
import { useSpaceFilter } from './useSpaceFilter';
import { Space } from '../../types';

interface UseSpaceSelectorOptions {
  isDisabled?: boolean;
  documentationUrl?: string;
  onSpaceChange?: (spaceId: string) => void;
}

export const useSpaceSelector = (
  options: UseSpaceSelectorOptions = {}
): { component: React.ReactComponentElement; spaceFilter: Space } => {
  const { isDisabled, documentationUrl, onSpaceChange } = options;
  const [spaceFilter, setSpaceFilter] = useSpaceFilter();

  const handleSpaceChange = useCallback(
    (id: string) => {
      setSpaceFilter(id);
      onSpaceChange?.(id);
    },
    [setSpaceFilter, onSpaceChange]
  );

  const component = (
    <SpaceSelector
      selectedSpace={spaceFilter}
      onSpaceChange={handleSpaceChange}
      isDisabled={isDisabled}
      documentationUrl={documentationUrl}
    />
  );

  return { component, spaceFilter };
};
