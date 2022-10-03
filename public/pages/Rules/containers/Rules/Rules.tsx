/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { ContentPanel } from '../../../../components/ContentPanel';

interface RulesProps extends RouteComponentProps {}

interface RulesState {}

export default class Rules extends Component<RulesProps, RulesState> {
  constructor(props: RulesProps) {
    super(props);
  }

  render() {
    return <ContentPanel title={'Rules'}></ContentPanel>;
  }
}
