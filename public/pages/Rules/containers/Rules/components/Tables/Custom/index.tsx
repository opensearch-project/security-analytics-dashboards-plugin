import React, { useState, useEffect } from 'react';
import { customRequest } from '../../../../../state-management';
import Modal from '../../../../../lib/UIComponents/Modal';
import { EuiInMemoryTable } from '@elastic/eui';
import _ from 'lodash';
import { EuiTitle, EuiFlyout, EuiFlyoutBody, EuiFlyoutHeader } from '@elastic/eui';
import axios from 'axios';

export const CustomTable = () => {
  const [pagination, setPagination] = useState({ pageIndex: 0 });
  const [query, setQuery] = useState<string>('');
  const [modalType, setModalType] = useState<undefined | string>('');
  const [content, setContent] = useState<any | string>('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const closeModal = () => setIsModalVisible(false);
  const showModal = () => setIsModalVisible(true);
  const [customRules, setCustomRules] = useState<any | object>([]);

  useEffect(() => {
    axios(customRequest).then((res) => {
      let customRules: any = [];
      res.data.hits.hits.forEach((rule: any) => {
        customRules.push(rule._source);
      });
      setCustomRules(customRules);
    });
  }, []);

  let modal;

  if (isModalVisible) {
    modal = <Modal close={closeModal} content={content} type={modalType} ruleType={'custom'} />;
  }

  const columns = [
    {
      field: 'title',
      name: 'Rule name',
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
      field: 'title',
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

  const handleOnChange = ({ queryText, error }: { queryText: string; error: string }) => {
    if (!error) {
      setQuery(queryText);
    }
  };

  const search: any = {
    query,
    onChange: handleOnChange,
    box: {
      schema: true,
    },
  };

  const getRowProps = (item: any) => {
    const { id } = item;
    return {
      'data-test-subj': `row-${id}`,
      className: 'customRowClass',
      onClick: () => {
        let rule = _.filter(customRules, function (o) {
          return o.id === id;
        });
        setModalType('view');
        setContent(rule[0]);
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
    <div>
      <EuiInMemoryTable
        items={customRules}
        columns={columns}
        search={search}
        pagination={
          customRules.length < 7 ? false : { ...pagination, pageSizeOptions: [7, 15, 25] }
        }
        onTableChange={({ page: { index } }: { page: any }) => setPagination({ pageIndex: index })}
        sorting={true}
        rowProps={getRowProps}
        cellProps={getCellProps}
      />
      <div>{modal}</div>
    </div>
  );
};
