import { METHOD_NAMES } from '../utils/constants';

const BASE_PATH = '/_plugins/_content_manager';
export function addPoliciesMethods(securityAnalytics: any, createAction: any): void {
  securityAnalytics[METHOD_NAMES.UPDATE_POLICY] = createAction({
    url: {
      fmt: `${BASE_PATH}/policy`,
    },
    needBody: true,
    method: 'PUT',
  });
}
