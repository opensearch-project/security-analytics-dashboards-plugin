import httpClientMock from './httpClient.mock';
import { RuleService } from '../../../public/services';
import _ from 'lodash';

const ruleServiceMock = {
  getRules: () =>
    Promise.resolve({
      ok: true,
      response: {
        hits: {
          hits: [],
        },
      },
    }),
  getAllRuleCategories: () =>
    Promise.resolve({
      ok: true,
      response: {
        rule_categories: [
          {
            display_name: 'Network',
            key: 'network',
          },
          {
            display_name: 'DNS',
            key: 'dns',
          },
          {
            display_name: 'Apache Access',
            key: 'apache_access',
          },
          {
            display_name: 'Windows',
            key: 'windows',
          },
          {
            display_name: 'AD/LDAP',
            key: 'ad_ldap',
          },
          {
            display_name: 'Linux',
            key: 'linux',
          },
          {
            display_name: 'Cloudtrail',
            key: 'cloudtrail',
          },
          {
            display_name: 'S3',
            key: 's3',
          },
        ],
      },
    }),
};
const ruleService = new RuleService(httpClientMock);
Object.assign(ruleService, ruleServiceMock);

export { ruleServiceMock };
export default ruleService as RuleService;
