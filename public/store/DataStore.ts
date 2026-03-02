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
import { ThreatIntelStore } from './ThreatIntelStore';
import { DocumentStore } from './DocumentStore';
import { IntegrationStore } from './IntegrationStore';
import { DecodersStore } from './DecodersStore';
import { KVDBsStore } from './KVDBsStore';
import { PoliciesStore } from './PoliciesStore';
import { LogTestStore } from './LogTestStore';

export class DataStore {
  public static rules: RulesStore;
  public static detectors: DetectorsStore;
  public static correlations: CorrelationsStore;
  public static findings: FindingsStore;
  public static logTypes: LogTypeStore;
  public static integrations: IntegrationStore;
  public static policies: PoliciesStore;
  public static decoders: DecodersStore;
  public static kvdbs: KVDBsStore;
  public static logTests: LogTestStore;
  public static alerts: AlertsStore;
  public static threatIntel: ThreatIntelStore;
  public static documents: DocumentStore;

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
      notifications,
      services.indexPatternsService,
      services.correlationsService,
      services.opensearchService
    );

    DataStore.correlations = new CorrelationsStore(
      services.correlationsService,
      services.detectorsService,
      services.findingsService,
      notifications,
      rulesStore
    );

    DataStore.integrations = new IntegrationStore(services.integrationService, notifications);
    DataStore.policies = new PoliciesStore(services.policiesService, notifications);
    DataStore.logTypes = new LogTypeStore(services.logTypeService, notifications);
    DataStore.decoders = new DecodersStore(services.decodersService, notifications);

    DataStore.kvdbs = new KVDBsStore(services.kvdbsService, notifications);

    DataStore.logTests = new LogTestStore(services.logTestService, notifications);

    DataStore.alerts = new AlertsStore(services.alertService, notifications);

    DataStore.threatIntel = new ThreatIntelStore(services.findingsService);

    DataStore.documents = new DocumentStore(services.opensearchService);
  };
}
