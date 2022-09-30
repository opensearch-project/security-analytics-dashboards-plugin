import React, { useState, useReducer, Fragment } from 'react';
import { initialState, reducer } from '../../../../../state-management';
import Modal from '../../../../../lib/UIComponents/Modal';
import { EuiInMemoryTable } from '@elastic/eui';
import _ from 'lodash';

export const CloudTable = () => {
  const [state] = useReducer(reducer, initialState);
  const [pagination, setPagination] = useState({ pageIndex: 0 });
  const [query, setQuery] = useState<string>('');
  const [modalType, setModalType] = useState<undefined | string>('');
  const [modalContent, setModalContent] = useState<any | string>('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const closeModal = () => setIsModalVisible(false);
  const showModal = () => setIsModalVisible(true);

  const rules = state.cloudRules;

  let modal;

  if (isModalVisible) {
    modal = <Modal close={closeModal} modalContent={modalContent} type={modalType} />;
  }

  const columns = [
    {
      field: 'title',
      name: 'Rule name',
      sortable: true,
      width: '20%',
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
        let rule = _.filter(rules, function (o) {
          return o.id === id;
        });
        setModalType('view');
        setModalContent(rule[0]);
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
        items={rules}
        columns={columns}
        search={search}
        pagination={rules.length < 7 ? false : { ...pagination, pageSizeOptions: [5, 15, 25] }}
        onTableChange={({ page: { index } }: { page: any }) => setPagination({ pageIndex: index })}
        sorting={true}
        rowProps={getRowProps}
        cellProps={getCellProps}
      />
      <div>{modal}</div>
    </div>
  );
};
