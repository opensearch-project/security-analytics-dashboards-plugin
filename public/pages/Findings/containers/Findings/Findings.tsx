/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { ContentPanel } from '../../../../components/ContentPanel';

interface FindingsProps extends RouteComponentProps {}

interface FindingsState {}

export default class Findings extends Component<FindingsProps, FindingsState> {
  constructor(props: FindingsProps) {
    super(props);
  }

  render() {
    return <ContentPanel title={'Findings'}></ContentPanel>;
  }
}
