/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiTitle } from '@elastic/eui';
import React, { useEffect, useRef } from 'react';

export const LogCategoryOptionView: React.FC<{ categoryName: string }> = ({ categoryName }) => {
  const inputRef = useRef<HTMLHeadingElement | null>(null);

  useEffect(() => {
    inputRef.current?.closest('button.euiFilterSelectItem')?.setAttribute('disabled', 'true');
  }, [inputRef.current]);

  return (
    <EuiTitle size="xxs">
      <h4 ref={inputRef}>{categoryName}</h4>
    </EuiTitle>
  );
};
