/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

export const TEST_DOCUMENT = {
  EventTime: '2020-02-04T14:59:39.343541+00:00',
  HostName: 'EC2AMAZ-EPO7HKA',
  Keywords: '9223372036854775808',
  SeverityValue: 2,
  Severity: 'INFO',
  EventID: 2003,
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
  Provider_Name: 'Microsoft-Windows-Kernel-General',
  TargetObject: '\\SOFTWARE\\Microsoft\\Office\\Outlook\\Security',
  EventType: 'SetValue',
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
  name: 'test-detector',
  enabled: true,
  createdBy: '',
  schedule: {
    period: {
      interval: 1,
      unit: 'MINUTES',
    },
  },
  inputs: [
    {
      detector_input: {
        description: 'Description for test-detector.',
        indices: ['cypress-test-windows'],
        pre_packaged_rules: [
          {
            id: '1a4bd6e3-4c6e-405d-a9a3-53a116e341d4',
          },
        ],
        custom_rules: [],
      },
    },
  ],
  triggers: [
    {
      name: 'test-detector trigger1',
      sev_levels: [],
      tags: [],
      actions: [
        {
          id: '',
          name:
            'Triggered alert condition:  - Severity: 1 (Highest) - Threat detector: test-detector',
          destination_id: '',
          subject_template: {
            source:
              'Triggered alert condition:  - Severity: 1 (Highest) - Threat detector: test-detector',
            lang: 'mustache',
          },
          message_template: {
            source:
              'Triggered alert condition: \nSeverity: 1 (Highest)\nThreat detector: test-detector\nDescription: Description for test-detector.\nDetector data sources:\n\twindows',
            lang: 'mustache',
          },
          throttle_enabled: false,
          throttle: {
            value: 10,
            unit: 'MINUTES',
          },
        },
      ],
      types: ['windows'],
      severity: '4',
      ids: ['1a4bd6e3-4c6e-405d-a9a3-53a116e341d4'],
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
