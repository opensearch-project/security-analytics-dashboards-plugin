/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { HttpSetup } from 'opensearch-dashboards/public';
import {
  CreateLogTypeResponse,
  DeleteLogTypeResponse,
  LogTypeBase,
  SearchLogTypesResponse,
  ServerResponse,
  UpdateLogTypeResponse,
} from '../../types';
import { API } from '../../server/utils/constants';
import { dataSourceInfo } from './utils/constants';

export default class LogTypeService {
  constructor(private httpClient: HttpSetup) {}

  createLogType = async (logType: LogTypeBase) => {
    const url = `..${API.LOGTYPE_BASE}`;
    const response = (await this.httpClient.post(url, {
      body: JSON.stringify(logType),
      query: {
        dataSourceId: dataSourceInfo.activeDataSource.id,
      },
    })) as ServerResponse<CreateLogTypeResponse>;

    return response;
  };

  searchLogTypes = async (id?: string): Promise<ServerResponse<SearchLogTypesResponse>> => {
    const url = `..${API.LOGTYPE_BASE}/_search`;
    const query = id
      ? {
          terms: { _id: [id] },
        }
      : {
          bool: {
            must: {
              query_string: {
                query:
                  '(source: Sigma and !(name: others*) and !(name: test*)) or (source: Custom)',
              },
            },
          },
        };
    const queryString = JSON.stringify(query);
    return (await this.httpClient.post(url, {
      body: queryString,
      query: {
        dataSourceId: dataSourceInfo.activeDataSource.id,
      },
    })) as ServerResponse<SearchLogTypesResponse>;
  };

  updateLogType = async (
    logTypeId: string,
    logType: LogTypeBase
  ): Promise<ServerResponse<UpdateLogTypeResponse>> => {
    const url = `..${API.LOGTYPE_BASE}/${logTypeId}`;
    const response = (await this.httpClient.put(url, {
      body: JSON.stringify(logType),
      query: {
        dataSourceId: dataSourceInfo.activeDataSource.id,
      },
    })) as ServerResponse<UpdateLogTypeResponse>;

    return response;
  };

  deleteLogType = async (logTypeId: string): Promise<ServerResponse<DeleteLogTypeResponse>> => {
    const url = `..${API.LOGTYPE_BASE}/${logTypeId}`;
    return (await this.httpClient.delete(url, {
      query: {
        dataSourceId: dataSourceInfo.activeDataSource.id,
      },
    })) as ServerResponse<DeleteLogTypeResponse>;
  };
}
