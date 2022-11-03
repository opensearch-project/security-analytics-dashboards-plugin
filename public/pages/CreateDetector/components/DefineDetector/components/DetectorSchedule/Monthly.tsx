/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export interface MonthlyProps {}

export interface MonthlyState {}

export class Monthly extends React.Component<MonthlyProps, MonthlyState> {
  constructor(props: MonthlyProps) {
    super(props);
    this.state = {};
  }

  render() {
    return <p>Monthly</p>;
  }
}
