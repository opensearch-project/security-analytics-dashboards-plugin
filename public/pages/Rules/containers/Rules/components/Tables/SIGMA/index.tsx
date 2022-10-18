import React, { useState, useEffect } from 'react';
import { allRequest } from '../../../../../state-management';
import Modal from '../../../../../lib/UIComponents/Modal';
import { EuiInMemoryTable } from '@elastic/eui';
import _, { indexOf } from 'lodash';
import axios from 'axios';

export const SigmaTable = () => {
  const [pagination, setPagination] = useState({ pageIndex: 0 });
  const [query, setQuery] = useState<string>('');
  const [modalType, setModalType] = useState<undefined | string>('');
  const [content, setContent] = useState<any | string>('');
  const [sigmaRules, setRules] = useState<any | object>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const closeModal = () => setIsModalVisible(false);
  const showModal = () => setIsModalVisible(true);

  useEffect(() => {
    axios(allRequest).then((res) => {
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
      field: 'category',
      name: 'Rule Library',
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
    <div>
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
    </div>
  );
};
