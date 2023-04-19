/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { RulesStore } from './RulesStore';
import { BrowserServices } from '../models/interfaces';
import { NotificationsStart } from 'opensearch-dashboards/public';
import { DetectorsStore } from './DetectorsStore';
import { ICorrelationsStore } from '../../types';
import { CorrelationsStore } from './CorrelationsStore';

export class DataStore {
  public static rules: RulesStore;
  public static detectors: DetectorsStore;
  public static correlationsStore: ICorrelationsStore;

  public static init = (services: BrowserServices, notifications: NotificationsStart) => {
    const rulesStore = new RulesStore(services.ruleService, notifications);
    DataStore.rules = rulesStore;

    DataStore.detectors = new DetectorsStore(
      services.detectorsService,
      notifications,
      services.savedObjectsService
    );

    DataStore.correlationsStore = new CorrelationsStore(
      services.correlationsService,
      services.detectorsService,
      services.findingsService,
      notifications,
      rulesStore
    );
  };
}
