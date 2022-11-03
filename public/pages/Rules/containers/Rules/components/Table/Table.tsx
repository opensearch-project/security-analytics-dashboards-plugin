/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useContext, Fragment, useCallback } from 'react';
import { Flyout } from '../../../../lib/UIComponents/Flyout';
import { ruleTypes, ruleSeverity, ruleSource } from '../../../../lib/helpers';
import { EuiInMemoryTable, EuiFlexGroup, EuiLink, EuiToast } from '@elastic/eui';
import { ServicesContext } from '../../../../../../services';
import { BrowserServices } from '../../../../../../models/interfaces';
import { GetRulesResponse, RuleSource } from '../../../../../../../server/models/interfaces';
import { ServerResponse } from '../../../../../../../server/models/types';
import { Search } from '@opensearch-project/oui/src/eui_components/basic_table';
import { capitalizeFirstLetter } from '../../../../../../utils/helpers';

export const Table = ({ registerRefreshCallback }: { registerRefreshCallback: Function }) => {
  const services: BrowserServices | null = useContext(ServicesContext);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 25 });
  const [filters, setFilters] = useState(true);
  const [query, setQuery] = useState<string>('');
  const [flyoutType, setflyoutType] = useState<undefined | string>('');
  const [content, setContent] = useState<any | string>('');
  const [sigmaRules, setSigmaRules] = useState<RuleSource[]>([]);
  const [customRules, setCustomRules] = useState<RuleSource[]>([]);
  const [allRules, setAllRules] = useState<RuleSource[]>([]);
  const [isFlyoutVisible, setIsFlyoutVisible] = useState(false);
  const closeFlyout = (updateTable?: boolean) => {
    setIsFlyoutVisible(false);
    if (updateTable) {
      setTimeout(() => refreshRules(), 500);
    }
  };
  const showFlyout = () => setIsFlyoutVisible(true);
  const [toastError, setToastError] = useState<string>('');
  const [toastSuccess, setToastSuccess] = useState<string>('');

  const refreshRules = useCallback(() => {
    services?.ruleService
      .getRules(true /* prePackaged */, {
        from: 0,
        size: 5000,
        query: {
          match_all: {},
        },
      })
      .then((res: ServerResponse<GetRulesResponse>) => {
        if (res.ok) {
          let sigma: any = [];
          res.response.hits.hits.map((hit) => {
            sigma.push({
              id: hit._id,
              source: 'Sigma',
              author: hit._source.author,
              category: hit._source.category,
              description: hit._source.description,
              falsepositives: hit._source.false_positives,
              level: hit._source.level,
              title: hit._source.title,
              status: hit._source.status,
              log_source: hit._source.log_source,
              queries: hit._source.queries,
              references: hit._source.references,
              tags: hit._source.tags,
              last_updated: hit._source.last_update_time,
            });
          });
          setSigmaRules(sigma);
        } else {
          setToastError(res.error);
        }
      });
    services?.ruleService
      .getRules(false /* custom */, {
        from: 0,
        size: 5000,
        query: {
          match_all: {},
        },
      })
      .then((res: ServerResponse<GetRulesResponse>) => {
        if (res.ok) {
          let custom: any = [];
          res.response.hits.hits.map((hit) => {
            custom.push({
              id: hit._id,
              source: 'Custom',
              author: hit._source.author,
              category: hit._source.category,
              description: hit._source.description,
              falsepositives: hit._source.false_positives,
              level: hit._source.level,
              title: hit._source.title,
              status: hit._source.status,
              log_source: hit._source.log_source,
              queries: hit._source.queries,
              references: hit._source.references,
              tags: hit._source.tags,
            });
          });
          setCustomRules(custom);
        } else {
          setToastError(res.error);
        }
      });
  }, [services]);

  useEffect(() => {
    refreshRules();
    registerRefreshCallback(refreshRules);
  }, [services]);

  let flyout;

  if (isFlyoutVisible) {
    flyout = <Flyout close={closeFlyout} content={content} type={flyoutType} />;
  }

  const columns = [
    {
      field: 'title',
      name: 'Rule name',
      sortable: true,
      width: '30%',
      truncateText: true,
      render: (title: string) => <EuiLink>{title}</EuiLink>,
      mobileOptions: {
        header: false,
        truncateText: false,
        enlarge: true,
        width: '100%',
      },
    },
    {
      field: 'level',
      name: 'Rule Severity',
      sortable: true,
      width: '20%',
      truncateText: true,
      mobileOptions: {
        header: false,
        truncateText: false,
        enlarge: true,
        width: '100%',
      },
      render: (level: string) => capitalizeFirstLetter(level),
    },
    {
      field: 'category',
      name: 'Log type',
      sortable: true,
      width: '20%',
      truncateText: true,
      mobileOptions: {
        header: false,
        truncateText: false,
        enlarge: true,
        width: '100%',
      },
    },
    {
      field: 'source',
      name: 'Source',
      sortable: true,
      width: '20%',
      truncateText: true,
      mobileOptions: {
        header: false,
        truncateText: false,
        enlarge: true,
        width: '100%',
      },
    },
    {
      field: 'description',
      name: 'Description',
      sortable: true,
      truncateText: true,
      mobileOptions: {
        header: false,
        truncateText: false,
        enlarge: true,
        width: '100%',
      },
    },
  ];

  //Filter table by rule type
  const search: Search = {
    box: {
      schema: true,
    },
    filters: [
      {
        type: 'field_value_selection',
        field: 'category',
        name: 'Rule Type',
        multiSelect: false,
        options: ruleTypes.map((type: string) => ({
          value: type,
        })),
      },
      {
        type: 'field_value_selection',
        field: 'level',
        name: 'Rule Severity',
        multiSelect: false,
        options: ruleSeverity,
      },
      {
        type: 'field_value_selection',
        field: 'source',
        name: 'Source',
        multiSelect: false,
        options: ruleSource.map((source: string) => ({
          value: source,
        })),
      },
    ],
  };

  //Sets content for flyout
  const getRowProps = (item: any) => {
    const { id } = item;
    return {
      'data-test-subj': `row-${id}`,
      className: 'customRowClass',
      onClick: () => {
        setflyoutType('view');
        setContent(item);
        showFlyout();
      },
    };
  };

  const getCellProps = (item: any, column: any) => {
    const { id } = item;
    const { field } = column;
    return {
      className: 'customCellClass',
      'data-test-subj': `cell-${id}-${field}`,
      textOnly: true,
    };
  };

  const toast = [
    {
      title: 'Error',
      text: (
        <Fragment>
          <p>{toastError}</p>
        </Fragment>
      ),
    },
  ];

  let combined = sigmaRules.concat(customRules);

  return (
    <div style={{ width: '95%', margin: '0 auto', paddingTop: '25px' }}>
      <EuiFlexGroup>
        {sigmaRules.length > 0 && (
          <EuiInMemoryTable
            items={combined}
            columns={columns}
            search={search}
            pagination={
              sigmaRules.length < 10 ? false : { ...pagination, pageSizeOptions: [10, 25, 50] }
            }
            onTableChange={({ page: { index } }: { page: any }) =>
              setPagination({ ...pagination, pageIndex: index })
            }
            sorting={true}
            rowProps={getRowProps}
            cellProps={getCellProps}
          />
        )}
        <div>{flyout}</div>
      </EuiFlexGroup>
    </div>
  );
};
