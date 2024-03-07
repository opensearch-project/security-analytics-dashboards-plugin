/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { RulesStore } from './RulesStore';
import { BrowserServices } from '../models/interfaces';
import { NotificationsStart } from 'opensearch-dashboards/public';
import { DetectorsStore } from './DetectorsStore';
import { CorrelationsStore } from './CorrelationsStore';
import { FindingsStore } from './FindingsStore';
import { LogTypeStore } from './LogTypeStore';
import { AlertsStore } from './AlertsStore';

export class DataStore {
  public static rules: RulesStore;
  public static detectors: DetectorsStore;
  public static correlations: CorrelationsStore;
  public static findings: FindingsStore;
  public static logTypes: LogTypeStore;
  public static alerts: AlertsStore;

  public static init = (services: BrowserServices, notifications: NotificationsStart) => {
    const rulesStore = new RulesStore(services.ruleService, notifications);
    DataStore.rules = rulesStore;

    DataStore.detectors = new DetectorsStore(
      services.detectorsService,
      notifications,
      services.savedObjectsService
    );

    DataStore.findings = new FindingsStore(
      services.findingsService,
      services.detectorsService,
      notifications
    );

    DataStore.correlations = new CorrelationsStore(
      services.correlationsService,
      services.detectorsService,
      services.findingsService,
      notifications,
      rulesStore
    );

    DataStore.logTypes = new LogTypeStore(services.logTypeService, notifications);

    DataStore.alerts = new AlertsStore(
      services.alertService,
      services.detectorsService,
      notifications
    );
  };
}
