/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { ContentPanel } from '../../../../components/ContentPanel';

interface DetectorsProps extends RouteComponentProps {}

interface DetectorsState {}

export default class Detectors extends Component<DetectorsProps, DetectorsState> {
  constructor(props: DetectorsProps) {
    super(props);
  }

  render() {
    return <ContentPanel title={'Detectors'}></ContentPanel>;
  }
}
