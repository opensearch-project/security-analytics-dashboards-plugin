import { METHOD_NAMES } from '../utils/constants';

const BASE_PATH = '/_plugins/_content_manager';
export function addPoliciesMethods(securityAnalytics: any, createAction: any): void {
  securityAnalytics[METHOD_NAMES.UPDATE_POLICY] = createAction({
    url: {
      fmt: `${BASE_PATH}/policy/<%=space%>`,
      req: {
        space: {
          type: 'string',
        },
      },
    },
    needBody: true,
    method: 'PUT',
  });

  securityAnalytics[METHOD_NAMES.DELETE_SPACE] = createAction({
    url: {
      fmt: `${BASE_PATH}/space/<%=space%>`,
      req: {
        space: {
          type: 'string',
          required: true,
        },
      },
    },
    needBody: false,
    method: 'DELETE',
  });
}
