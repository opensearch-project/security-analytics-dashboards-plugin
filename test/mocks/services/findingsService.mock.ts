import httpClientMock from './httpClient.mock';
import { FindingsService } from '../../../public/services';
import notificationsMock from './notifications';

const findingsService = new FindingsService(httpClientMock, notificationsMock.NotificationsStart);

Object.assign(findingsService, {
  getFindings: () =>
    Promise.resolve({
      ok: true,
      response: {
        findings: [],
      },
    }),
});

export default findingsService as FindingsService;
