/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EuiFieldSearch, EuiFlexGroup, EuiSelect, EuiFlexItem, EuiPagination } from '@elastic/eui';
import { severityOptions } from '../../utils/constants';

const DashboardControls = ({
  //   activePage,
  //   pageCount,
  //   search,
  severity = severityOptions[1],
  //   state = stateOptions[0],
  //   onSearchChange,
  //   onSeverityChange,
  //   onStateChange,
  //   onPageChange,
  isAlertsFlyout = false,
  //   monitorType,
}) => {
  const onSearchChange = () => {};
  const onSeverityChange = () => {};
  const onPageChange = () => {};

  return (
    <EuiFlexGroup style={{ padding: '0px 5px' }}>
      <EuiFlexItem>
        <EuiFieldSearch
          fullWidth={true}
          placeholder="Search"
          onChange={onSearchChange}
          value={''}
        />
      </EuiFlexItem>

      {isAlertsFlyout ? null : (
        <EuiFlexItem grow={false}>
          <EuiSelect options={severityOptions} value={severity.value} onChange={onSeverityChange} />
        </EuiFlexItem>
      )}
      <EuiFlexItem grow={false} style={{ justifyContent: 'center' }}>
        <EuiPagination pageCount={2} activePage={1} onPageClick={onPageChange} />
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};

export default DashboardControls;
