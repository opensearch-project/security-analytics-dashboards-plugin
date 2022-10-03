/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { ContentPanel } from '../../../../components/ContentPanel';

interface CategoriesProps extends RouteComponentProps {}

interface CategoriesState {}

export default class Categories extends Component<CategoriesProps, CategoriesState> {
  constructor(props: CategoriesProps) {
    super(props);
  }

  render() {
    return <ContentPanel title={'Categories'}></ContentPanel>;
  }
}
