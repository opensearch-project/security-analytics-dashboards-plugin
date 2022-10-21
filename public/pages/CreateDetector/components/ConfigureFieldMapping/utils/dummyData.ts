/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { GetFieldMappingViewResponse } from '../../../../../../server/models/interfaces';

export const EMPTY_FIELD_MAPPINGS: GetFieldMappingViewResponse = {
  properties: {},
  unmappedFieldAliases: [],
  unmappedIndexFields: [],
};

export const EXAMPLE_FIELD_MAPPINGS_RESPONSE: GetFieldMappingViewResponse = {
  properties: {
    'source.ip': {
      type: 'alias',
      path: 'netflow.source_ipv4_address',
    },
    'source.port': {
      type: 'alias',
      path: 'netflow.source_transport_port',
    },
    'destination.ip': {
      type: 'alias',
      path: 'netflow.destination_ipv4_address',
    },
    'destination.port': {
      type: 'alias',
      path: 'netflow.destination_transport_port',
    },
    'http.request.method': {
      type: 'alias',
      path: 'netflow.http_request_method',
    },
    'http.response.status_code': {
      type: 'alias',
      path: 'netflow.http_status_code',
    },
  },
  unmappedIndexFields: ['src_client_ip', 'user_source_ip'],
  unmappedFieldAliases: ['source_ip', 'client_ip'],
};
