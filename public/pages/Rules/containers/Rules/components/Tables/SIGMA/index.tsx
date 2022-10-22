/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { allRequest, ruleTypes } from '../../../../../state-management';
import Modal from '../../../../../lib/UIComponents/Modal';
import { EuiInMemoryTable, EuiFlexGroup } from '@elastic/eui';
import axios from 'axios';
import RulesService from '../../../../../../../services/RuleService';

export const SigmaTable = () => {
  const [pagination, setPagination] = useState({ pageIndex: 0 });
  const [filters, setFilters] = useState(true);
  const [query, setQuery] = useState<string>('');
  const [modalType, setModalType] = useState<undefined | string>('');
  const [content, setContent] = useState<any | string>('');
  const [sigmaRules, setRules] = useState<any | object>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const closeModal = () => setIsModalVisible(false);
  const showModal = () => setIsModalVisible(true);

  useEffect(() => {
    const rulesService = new RulesService();
    rulesService.getRules('pre-packaged').then((res) => {
      let allRules: any = [];
      res.data.hits.hits.forEach((rule: any) => {
        allRules.push(rule._source);
      });
      setRules(allRules);
    });
  }, []);

  let modal;

  if (isModalVisible) {
    modal = <Modal close={closeModal} content={content} type={modalType} />;
  }

  const columns = [
    {
      field: 'title',
      name: 'Rule name',
      sortable: true,
      width: '30%',
      truncateText: true,
      'data-test-subj': 'firstNameCell',
      mobileOptions: {
        header: false,
        truncateText: false,
        enlarge: true,
        width: '100%',
      },
    },
    {
      field: 'category',
      name: 'Rule type',
      sortable: true,
      width: '20%',
      truncateText: true,
      'data-test-subj': 'firstNameCell',
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
      'data-test-subj': 'firstNameCell',
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
    ],
  };

  //Sets content for flyout
  const getRowProps = (item: any) => {
    const { id } = item;
    return {
      'data-test-subj': `row-${id}`,
      className: 'customRowClass',
      onClick: () => {
        setModalType('view');
        setContent(item);
        showModal();
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
      <div>{modal}</div>
    </EuiFlexGroup>
  );
};
