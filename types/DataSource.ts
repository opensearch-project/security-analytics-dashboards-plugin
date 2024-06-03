/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { DataSourceOption } from 'src/plugins/data_source_management/public/components/data_source_menu/types';
import { DataSourcePluginRequestContext } from '../../../src/plugins/data_source/server';

declare module 'src/core/server' {
  interface RequestHandlerContext {
    dataSource: DataSourcePluginRequestContext;
  }
}

export type DataSourceRequestParams = {
  dataSourceId?: string;
};

export interface DataSourceProps {
  dataSource: DataSourceOption;
}

export interface DataSourceManagerProps {
  setDataSource: (sources: DataSourceOption[]) => void;
  setDataSourceMenuReadOnly: (viewOnly: boolean) => void;
}
