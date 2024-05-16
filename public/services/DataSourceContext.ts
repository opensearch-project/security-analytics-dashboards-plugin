/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { createContext } from 'react';
import { DataSourceContextType } from '../../types';

const defaultDataSourceContext: DataSourceContextType = {
  dataSource: { id: '' },
  setDataSource: (sources) => {},
  setDataSourceMenuReadOnly: (viewOnly) => {},
};

const DataSourceContext = createContext<DataSourceContextType>({ ...defaultDataSourceContext });

const DataSourceContextConsumer = DataSourceContext.Consumer;

export { DataSourceContext, DataSourceContextConsumer };
