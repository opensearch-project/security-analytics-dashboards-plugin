/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { METHOD_NAMES, API } from '../utils/constants';

export function addThreatIntelMethods(securityAnalytics: any, createAction: any): void {
  securityAnalytics[METHOD_NAMES.ADD_THREAT_INTEL_SOURCE] = createAction({
    url: {
      fmt: `${API.THREAT_INTEL_BASE}/sources`,
    },
    needBody: true,
    method: 'POST',
  });

  securityAnalytics[METHOD_NAMES.UPDATE_THREAT_INTEL_SOURCE] = createAction({
    url: {
      fmt: `${API.THREAT_INTEL_BASE}/sources/<%=sourceId%>`,
      req: {
        sourceId: {
          type: 'string',
          required: true,
        },
      },
    },
    needBody: true,
    method: 'PUT',
  });

  securityAnalytics[METHOD_NAMES.SEARCH_THREAT_INTEL_SOURCES] = createAction({
    url: {
      fmt: `${API.THREAT_INTEL_BASE}/sources/_search`,
    },
    needBody: true,
    method: 'POST',
  });

  securityAnalytics[METHOD_NAMES.GET_THREAT_INTEL_SOURCE] = createAction({
    url: {
      fmt: `${API.THREAT_INTEL_BASE}/sources/<%=sourceId%>`,
      req: {
        sourceId: {
          type: 'string',
          required: true,
        },
      },
    },
    needBody: false,
    method: 'GET',
  });

  securityAnalytics[METHOD_NAMES.CREATE_THREAT_INTEL_MONITOR] = createAction({
    url: {
      fmt: `${API.THREAT_INTEL_BASE}/monitors`,
    },
    needBody: true,
    method: 'POST',
  });

  securityAnalytics[METHOD_NAMES.UPDATE_THREAT_INTEL_MONITOR] = createAction({
    url: {
      fmt: `${API.THREAT_INTEL_BASE}/monitors/<%=monitorId%>`,
      req: {
        monitorId: {
          type: 'string',
          required: true,
        },
      },
    },
    needBody: true,
    method: 'PUT',
  });

  securityAnalytics[METHOD_NAMES.SEARCH_THREAT_INTEL_MONITORS] = createAction({
    url: {
      fmt: `${API.THREAT_INTEL_BASE}/monitors/_search`,
    },
    needBody: true,
    method: 'POST',
  });

  securityAnalytics[METHOD_NAMES.GET_THREAT_INTEL_IOCS] = createAction({
    url: {
      fmt: `${API.THREAT_INTEL_BASE}/iocs`,
      // fmt: '/_plugins/_security_analytics/iocs/list',
      params: {
        startIndex: {
          type: 'number',
        },
        size: {
          type: 'number',
        },
        feed_ids: {
          type: 'string',
        },
        ioc_types: {
          type: 'string',
        },
        searchString: {
          type: 'string',
        },
        sortString: {
          type: 'string',
        },
      },
    },
    needBody: false,
    method: 'GET',
  });

  securityAnalytics[METHOD_NAMES.DELETE_THREAT_INTEL_SOURCE] = createAction({
    url: {
      fmt: `${API.THREAT_INTEL_BASE}/sources/<%=sourceId%>`,
      req: {
        sourceId: {
          type: 'string',
          required: true,
        },
      },
    },
    needBody: false,
    method: 'DELETE',
  });

  securityAnalytics[METHOD_NAMES.REFRESH_THREAT_INTEL_SOURCE] = createAction({
    url: {
      fmt: `${API.THREAT_INTEL_BASE}/sources/<%=sourceId%>/_refresh`,
      req: {
        sourceId: {
          type: 'string',
          required: true,
        },
      },
    },
    needBody: false,
    method: 'POST',
  });

  securityAnalytics[METHOD_NAMES.DELETE_THREAT_INTEL_MONITOR] = createAction({
    url: {
      fmt: `${API.THREAT_INTEL_BASE}/monitors/<%=monitorId%>`,
      req: {
        monitorId: {
          type: 'string',
          required: true,
        },
      },
    },
    needBody: false,
    method: 'DELETE',
  });
}
