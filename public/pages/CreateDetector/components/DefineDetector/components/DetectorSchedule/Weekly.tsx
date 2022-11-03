/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export interface WeeklyProps {}

export interface WeeklyState {}

export class Weekly extends React.Component<WeeklyProps, WeeklyState> {
  constructor(props: WeeklyProps) {
    super(props);
    this.state = {};
  }

  render() {
    return <p>Weekly</p>;
  }
}
