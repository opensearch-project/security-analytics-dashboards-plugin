/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export interface CustomCronProps {}

export interface CustomCronState {}

export class CustomCron extends React.Component<CustomCronProps, CustomCronState> {
  constructor(props: CustomCronProps) {
    super(props);
    this.state = {};
  }

  render() {
    return <p>Custom cron</p>;
  }
}
