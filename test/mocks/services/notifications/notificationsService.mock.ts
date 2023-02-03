import { NotificationsService } from '../../../../public/services';
import httpClientMock from '../httpClient.mock';

const notificationsService = new NotificationsService(httpClientMock);
Object.assign(notificationsService, {
  getChannels: () =>
    Promise.resolve({
      ok: true,
      response: {
        channel_list: [],
      },
    }),
});

export default notificationsService;
