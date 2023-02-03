import httpClientMock from './httpClient.mock';
import { RuleService } from '../../../public/services';

const ruleService = new RuleService(httpClientMock);
Object.assign(ruleService, {
  getRules: () =>
    Promise.resolve({
      ok: true,
      response: {
        hits: {
          hits: [],
        },
      },
    }),
});

export default ruleService as RuleService;
