import httpClientMock from './httpClient.mock';
import { RuleService } from '../../../public/services';

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
};
const ruleService = new RuleService(httpClientMock);
Object.assign(ruleService, ruleServiceMock);

export { ruleServiceMock };
export default ruleService as RuleService;
