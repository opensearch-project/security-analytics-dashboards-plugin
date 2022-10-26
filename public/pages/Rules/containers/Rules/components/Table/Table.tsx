/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useContext, Fragment } from 'react';
import { Flyout } from '../../../../lib/UIComponents/Flyout';
import { ruleTypes, ruleSeverity } from '../../../../lib/helpers';
import { EuiInMemoryTable, EuiFlexGroup, EuiLink, EuiToast } from '@elastic/eui';
import './index.scss';
import { ServicesContext } from '../../../../../../services';
import { BrowserServices } from '../../../../../../models/interfaces';
import { GetRulesResponse, RuleSource } from '../../../../../../../server/models/interfaces';
import { ServerResponse } from '../../../../../../../server/models/types';

export const Table = () => {
  const services: BrowserServices | null = useContext(ServicesContext);
  const [pagination, setPagination] = useState({ pageIndex: 0 });
  const [filters, setFilters] = useState(true);
  const [query, setQuery] = useState<string>('');
  const [flyoutType, setflyoutType] = useState<undefined | string>('');
  const [content, setContent] = useState<any | string>('');
  const [sigmaRules, setRules] = useState<RuleSource[]>([]);
  const [isFlyoutVisible, setIsFlyoutVisible] = useState(false);
  const closeFlyout = () => setIsFlyoutVisible(false);
  const showFlyout = () => setIsFlyoutVisible(true);
  const [toastError, setToastError] = useState<string>('');
  const [toastSuccess, setToastSuccess] = useState<string>('');

  useEffect(() => {
    services?.ruleService
      .getRules(true /* prePackaged */, {
        from: 0,
        size: 5000,
        query: {
          match_all: {},
        },
      })
      .then((res: ServerResponse<GetRulesResponse>) => {
        console.log('RES', res);
        if (res.ok) {
          setRules(res.response.hits.hits.map((hit) => hit._source));
        } else {
          setToastError(res.error);
        }
      });
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
