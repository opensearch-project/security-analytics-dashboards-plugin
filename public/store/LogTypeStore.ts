/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { NotificationsStart } from 'opensearch-dashboards/public';
import { LogType, LogTypeBase, LogTypeItem } from '../../types';
import LogTypeService from '../services/LogTypeService';
import { errorNotificationToast } from '../utils/helpers';

export class LogTypeStore {
  constructor(private service: LogTypeService, private notifications: NotificationsStart) {}

  public async getLogType(id: string): Promise<LogTypeItem | undefined> {
    const logTypesRes = await this.service.searchLogTypes(id);
    if (logTypesRes.ok) {
      const logTypes: LogType[] = logTypesRes.response.hits.hits.map((hit) => {
        return {
          id: hit._id,
          ...hit._source,
        };
      });

      return { ...logTypes[0], detectionRules: 10 };
    }

    return undefined;
  }

  public async getLogTypes(): Promise<LogType[]> {
    const logTypesRes = await this.service.searchLogTypes();
    if (logTypesRes.ok) {
      const logTypes: LogType[] = logTypesRes.response.hits.hits.map((hit) => {
        return {
          id: hit._id,
          ...hit._source,
        };
      });

      return logTypes;
    }

    return [];
  }

  public async createLogType(logType: LogTypeBase): Promise<boolean> {
    const createRes = await this.service.createLogType(logType);

    if (!createRes.ok) {
      errorNotificationToast(this.notifications, 'create', 'log type', createRes.error);
    }

    return createRes.ok;
  }

  public async updateLogType({ id, name, description, source, tags }: LogType): Promise<boolean> {
    const updateRes = await this.service.updateLogType(id, {
      name,
      description,
      source,
      tags,
    });

    if (!updateRes.ok) {
      errorNotificationToast(this.notifications, 'update', 'log type', updateRes.error);
    }

    return updateRes.ok;
  }
}
