/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { API } from '../../server/utils/constants';

export const TWENTY_SECONDS_TIMEOUT = { timeout: 20000 };

export const INDICES = {
  DETECTORS_INDEX: '.opensearch-detectors-config',
  PRE_PACKAGED_RULES_INDEX: '.opensearch-pre-packaged-rules-config',
  CUSTOM_RULES_INDEX: '.opensearch-custom-rules-config',
};

export const PLUGIN_NAME = 'opensearch_security_analytics_dashboards';

export const NODE_API = {
  ...API,
  INDEX_TEMPLATE_BASE: '/_index_template',
};

export const TEST_DOCUMENT = {
  EventTime: '2020-02-04T14:59:39.343541+00:00',
  HostName: 'EC2AMAZ-EPO7HKA',
  Keywords: '9223372036854775808',
  SeverityValue: 2,
  Severity: 'INFO',
  EventID: 22,
  SourceName: 'Microsoft-Windows-Sysmon',
  ProviderGuid: '{5770385F-C22A-43E0-BF4C-06F5698FFBD9}',
  Version: 5,
  TaskValue: 22,
  OpcodeValue: 0,
  RecordNumber: 9532,
  ExecutionProcessID: 1996,
  ExecutionThreadID: 2616,
  Channel: 'Microsoft-Windows-Sysmon/Operational',
  Domain: 'NT AUTHORITY',
  AccountName: 'SYSTEM',
  UserID: 'S-1-5-18',
  AccountType: 'User',
  Message:
    'Dns query:\r\nRuleName: \r\nUtcTime: 2020-02-04 14:59:38.349\r\nProcessGuid: {b3c285a4-3cda-5dc0-0000-001077270b00}\r\nProcessId: 1904\r\nQueryName: EC2AMAZ-EPO7HKA\r\nQueryStatus: 0\r\nQueryResults: 172.31.46.38;\r\nImage: C:\\Program Files\\nxlog\\nxlog.exe',
  Category: 'Dns query (rule: DnsQuery)',
  Opcode: 'Info',
  UtcTime: '2020-02-04 14:59:38.349',
  ProcessGuid: '{b3c285a4-3cda-5dc0-0000-001077270b00}',
  ProcessId: '1904',
  QueryName: 'EC2AMAZ-EPO7HKA',
  QueryStatus: '0',
  QueryResults: '172.31.46.38;',
  Image: 'C:\\Program Files\\nxlog\\regsvr32.exe',
  EventReceivedTime: '2020-02-04T14:59:40.780905+00:00',
  SourceModuleName: 'in',
  SourceModuleType: 'im_msvistalog',
  CommandLine: 'eachtest',
  Initiated: 'true',
  Provider_Name: 'Service_ws_Control_ws_Manager',
};

export const TEST_INDEX = {
  mappings: {
    properties: {
      CommandLine: {
        type: 'text',
      },
      EventID: {
        type: 'integer',
      },
      HostName: {
        type: 'text',
      },
      Message: {
        type: 'text',
      },
      Provider_Name: {
        type: 'text',
      },
      ServiceName: {
        type: 'text',
      },
    },
  },
  settings: {
    index: {
      number_of_shards: '1',
      number_of_replicas: '1',
    },
  },
};

export const TEST_DETECTOR = {
  type: 'detector',
  detector_type: 'windows',
  name: 'windows_detector',
  enabled: true,
  createdBy: 'chip',
  schedule: {
    period: {
      interval: 1,
      unit: 'MINUTES',
    },
  },
  inputs: [
    {
      detector_input: {
        description: 'windows detector for security analytics',
        indices: ['cypress-test-windows'],
        pre_packaged_rules: [],
        custom_rules: [],
      },
    },
  ],
  triggers: [
    {
      sev_levels: [],
      tags: [],
      ids: [],
      actions: [],
      severity: 'high',
      types: ['windows'],
      name: 'test-trigger',
      id: 'fyAy1IMBK2A1DZyOuW_b',
    },
  ],
};

export const TEST_FIELD_MAPPINGS = {
  event_uid: 'EventID',
  'windows-event_data-CommandLine': 'CommandLine',
  'windows-hostname': 'HostName',
  'windows-message': 'Message',
  'windows-provider-name': 'Provider_Name',
  'windows-servicename': 'ServiceName',
};
