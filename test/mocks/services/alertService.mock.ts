import { AlertService } from '../../../server/services';
import legacyClusterClientMock from './iLegacyCustomClusterClient.mock';

const alertService = new AlertService(legacyClusterClientMock);
Object.assign(alertService, {
  getAlerts: () =>
    Promise.resolve({
      ok: true,
      response: {
        alerts: [],
      },
    }),
});

export default alertService as AlertService;
