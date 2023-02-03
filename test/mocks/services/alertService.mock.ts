import httpClientMock from './httpClient.mock';
import { AlertService } from '../../../server/services';

const alertService = new AlertService(httpClientMock);
Object.assign(alertService, {
  getAlerts: () =>
    Promise.resolve({
      ok: true,
      response: {
        alerts: [],
      },
    }),
});

export default alertService;
