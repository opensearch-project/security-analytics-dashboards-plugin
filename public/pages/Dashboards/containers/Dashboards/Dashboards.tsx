/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { ContentPanel } from '../../../../components/ContentPanel';

interface DashboardsProps extends RouteComponentProps {}

interface DashboardsState {}

export default class Dashboards extends Component<DashboardsProps, DashboardsState> {
  constructor(props: DashboardsProps) {
    super(props);
  }

  render() {
    return <ContentPanel title={'Dashboards'}></ContentPanel>;
  }
}
