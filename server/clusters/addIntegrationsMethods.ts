import { METHOD_NAMES, API, BASE_API_PATH } from '../utils/constants';

const BASE_PATH = '/_plugins/_content_manager';
export function addIntegrationsMethods(securityAnalytics: any, createAction: any): void {
  securityAnalytics[METHOD_NAMES.DELETE_INTEGRATION] = createAction({
    url: {
      fmt: `${BASE_PATH}/integrations/<%=integrationId%>`,
      req: {
        integrationId: {
          type: 'string',
          required: true,
        },
      },
    },
    needBody: false,
    method: 'DELETE',
  });

  securityAnalytics[METHOD_NAMES.CREATE_INTEGRATION] = createAction({
    url: {
      fmt: `${BASE_PATH}/integrations`,
    },
    needBody: true,
    method: 'POST',
  });

  securityAnalytics[METHOD_NAMES.UPDATE_INTEGRATION] = createAction({
    url: {
      fmt: `${BASE_PATH}/integrations/<%=integrationId%>`,
      req: {
        integrationId: {
          type: 'string',
          required: true,
        },
      },
    },
    needBody: true,
    method: 'PUT',
  });

  securityAnalytics[METHOD_NAMES.GET_PROMOTE_BY_SPACE] = createAction({
    url: {
      fmt: `${BASE_PATH}/promote`,
      params: {
        space: {
          type: 'string',
          required: true,
        },
      },
    },
    needBody: true,
    method: 'GET',
  });

  securityAnalytics[METHOD_NAMES.PROMOTE_INTEGRATION] = createAction({
    url: {
      fmt: `${BASE_PATH}/promote`,
    },
    needBody: true,
    method: 'POST',
  });
}
