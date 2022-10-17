/*
 * SPDX-License-Identifier: Apache-2.0
 *
 * The OpenSearch Contributors require contributions made to
 * this file be licensed under the Apache-2.0 license or a
 * compatible open source license.
 *
 * Modifications Copyright OpenSearch Contributors. See
 * GitHub history for details.
 */

import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { EuiBadgeGroup } from '@elastic/eui';
import GlobalFilterAdd from './GlobalFilterAdd';
import { GlobalFilterItem } from './GlobalFilterItem';

export const GlobalFilterBar = ({ filters, className, ...rest }) => {
  const classes = classNames('globalFilterBar', className);

  const pinnedFilters = filters
    .filter((filter: any) => filter.isPinned)
    .map((filter: any) => {
      return <GlobalFilterItem key={filter.id} {...filter} />;
    });

  const unpinnedFilters = filters
    .filter((filter: any) => !filter.isPinned)
    .map((filter: any) => {
      return <GlobalFilterItem key={filter.id} {...filter} />;
    });

  return (
    <EuiBadgeGroup className={classes} {...rest}>
      {/* Show pinned filters first and in a specific group */}
      {pinnedFilters}
      {unpinnedFilters}
      <GlobalFilterAdd />
    </EuiBadgeGroup>
  );
};

GlobalFilterBar.propTypes = {
  filters: PropTypes.array,
};
