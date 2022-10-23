/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import RulesService from '../../../../../../services/RuleService';
import { Flyout } from '../../../../lib/UIComponents/Flyout';
import { ruleTypes, ruleSeverity } from '../../../../lib/helpers';
import { EuiInMemoryTable, EuiFlexGroup, EuiLink } from '@elastic/eui';
import axios from 'axios';
import './index.scss';

export const Table = () => {
  const [pagination, setPagination] = useState({ pageIndex: 0 });
  const [filters, setFilters] = useState(true);
  const [query, setQuery] = useState<string>('');
  const [flyoutType, setflyoutType] = useState<undefined | string>('');
  const [content, setContent] = useState<any | string>('');
  const [sigmaRules, setRules] = useState<any | object>([]);
  const [isFlyoutVisible, setIsFlyoutVisible] = useState(false);
  const closeFlyout = () => setIsFlyoutVisible(false);
  const showFlyout = () => setIsFlyoutVisible(true);

  //to do: Http coming back undefined
  // useEffect(() => {
  //   const rulesService = new RulesService();
  //   rulesService.getRules('pre-packaged').then((res) => {
  //     let allRules: any = [];
  //     res.data.hits.hits.forEach((rule: any) => {
  //       allRules.push(rule._source);
  //     });
  //     setRules(allRules);
  //   });
  // }, []);

  useEffect(() => {
    const allRequest: any = {
      url: 'http://35.92.187.49:9200/_plugins/_security_analytics/rules/_search?pre_packaged=true',
      method: 'POST',
      data: {
        from: 0,
        size: 5000,
        query: {
          match_all: {},
        },
      },
    };
    axios(allRequest).then((res) => {
      let allRules: any = [];
      res.data.hits.hits.forEach((rule: any) => {
        allRules.push(rule._source);
      });
      setRules(allRules);
    });
  }, []);

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
  const search = {
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
        options: ruleSeverity.map((level: string) => ({
          value: level,
        })),
      },
      {
        type: 'field_value_selection',
        field: 'level',
        name: 'Source',
        multiSelect: false,
        options: ruleSeverity.map((level: string) => ({
          value: level,
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

  return (
    <div style={{ width: '95%', margin: '0 auto', paddingTop: '25px' }}>
      <EuiFlexGroup>
        {sigmaRules.length > 0 && (
          <EuiInMemoryTable
            items={sigmaRules}
            columns={columns}
            search={search}
            pagination={
              sigmaRules.length < 7 ? false : { ...pagination, pageSizeOptions: [7, 15, 25] }
            }
            onTableChange={({ page: { index } }: { page: any }) =>
              setPagination({ pageIndex: index })
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
