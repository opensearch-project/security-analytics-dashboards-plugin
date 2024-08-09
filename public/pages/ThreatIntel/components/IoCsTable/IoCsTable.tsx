/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  EuiBasicTableColumn,
  EuiPanel,
  EuiSpacer,
  EuiText,
  EuiBasicTable,
  Pagination,
  CriteriaWithPagination,
  EuiSearchBar,
} from '@elastic/eui';
import { ThreatIntelIocData } from '../../../../../types';
import { renderTime } from '../../../../utils/helpers';
import { IocLabel, ThreatIntelIocType } from '../../../../../common/constants';
import { ThreatIntelService } from '../../../../services';

export interface IoCsTableProps {
  threatIntelService: ThreatIntelService;
  sourceId?: string;
  registerRefreshHandler: (handler: () => void) => void;
}

export const IoCsTable: React.FC<IoCsTableProps> = ({
  sourceId,
  threatIntelService,
  registerRefreshHandler,
}) => {
  const [loading, setLoading] = useState(false);
  const [searchString, setSearchString] = useState('');
  const [paginationState, setPaginationState] = useState<Pagination>({
    pageIndex: 0,
    pageSize: 10,
    totalItemCount: 0,
    pageSizeOptions: [10, 25, 50],
  });
  const [iocs, setIocs] = useState([]);

  const columns: EuiBasicTableColumn<ThreatIntelIocData>[] = [
    {
      name: 'Value',
      field: 'value',
    },
    {
      name: 'Type',
      field: 'type',
      render: (type: string) => IocLabel[type as ThreatIntelIocType],
    },
    {
      name: 'IoC matches',
      field: 'num_findings',
    },
    {
      name: 'Created',
      field: 'created',
      render: (timestamp: number | string) => renderTime(timestamp),
    },
    {
      name: 'Threat severity',
      field: 'severity',
    },
    {
      name: 'Last updated',
      field: 'modified',
      render: (timestamp: number | string) => renderTime(timestamp),
    },
  ];

  const getIocs = async () => {
    if (sourceId) {
      setLoading(true);
      const iocsRes = await threatIntelService.getThreatIntelIocs({
        feed_ids: sourceId,
        startIndex: paginationState.pageIndex * paginationState.pageSize,
        size: paginationState.pageSize,
        searchString,
      });

      if (iocsRes.ok) {
        setIocs(iocsRes.response.iocs);
        setPaginationState({
          ...paginationState,
          totalItemCount: iocsRes.response.total,
        });
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    registerRefreshHandler(getIocs);
  }, []);

  useEffect(() => {
    getIocs();
  }, [paginationState.pageIndex, paginationState.pageSize, searchString]);

  const onTableChange = ({ page }: CriteriaWithPagination<ThreatIntelIocData>) => {
    if (paginationState.pageIndex !== page.index || paginationState.pageSize !== page.size) {
      setPaginationState({
        ...paginationState,
        pageIndex: page.index,
        pageSize: page.size,
      });
    }
  };

  const renderSearch = () => {
    const schema = {
      strict: true,
      fields: {
        value: {
          type: 'string',
        },
        type: {
          type: 'string',
        },
        created: {
          type: 'date',
        },
        modified: {
          type: 'date',
        },
        num_findings: {
          type: 'number',
        },
      },
    };

    return (
      <EuiSearchBar
        defaultQuery={EuiSearchBar.Query.MATCH_ALL}
        box={{
          placeholder: 'Search',
          incremental: false,
          schema,
        }}
        onChange={({ queryText }) => setSearchString(queryText)}
      />
    );
  };

  return (
    <EuiPanel>
      <EuiText>
        <span>{paginationState.totalItemCount} malicious IoCs</span>
      </EuiText>
      <EuiSpacer />
      {renderSearch()}
      <EuiSpacer />
      <EuiBasicTable
        columns={columns}
        items={iocs}
        pagination={paginationState}
        onChange={onTableChange}
        loading={!sourceId || loading}
      />
    </EuiPanel>
  );
};
