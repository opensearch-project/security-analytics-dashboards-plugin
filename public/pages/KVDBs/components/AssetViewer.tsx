/*
 * Copyright Wazuh Inc.
 * SPDX-License-Identifier: AGPL-3.0-or-later
*/

import React, { useMemo } from 'react';
import { EuiInMemoryTable, EuiCodeBlock } from '@elastic/eui';
import { sortBy } from 'lodash';

interface AssetViewerProps {
  content: any;
}

const columns = [
  {
    field: 'key',
    name: 'Key',
    width: '30%',
  },
  {
    field: 'value',
    name: 'Value',
  },
];

const normalizeContent = (content: any) => {
  if (content == null) {
    return null;
  }

  if (typeof content === 'string') {
    try {
      const parsed = JSON.parse(content);
      if (parsed && typeof parsed === 'object') {
        return parsed;
      }
    } catch (error) {
      return content;
    }
    return content;
  }

  return content;
};

const flattenContent = (content: Record<string, any>) => {
  return Object.entries(content).map(([key, value]) => ({
    key,
    value: JSON.stringify(value),
  }));
};

export const AssetViewer: React.FC<AssetViewerProps> = ({ content }) => {
  const normalized = useMemo(() => normalizeContent(content), [content]);

  if (normalized == null) {
    return null;
  }

  if (typeof normalized === 'string') {
    return (
      <EuiCodeBlock language="text" isCopyable={true} paddingSize="m">
        {normalized}
      </EuiCodeBlock>
    );
  }

  const tableItems = useMemo(() => sortBy(flattenContent(normalized), 'key'), [normalized]);

  return (
    <EuiInMemoryTable
      search={{
        box: {
          incremental: true,
          schema: true,
        },
      }}
      items={tableItems}
      columns={columns}
    />
  );
};
