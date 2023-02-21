import { NotificationsService } from '../../../../public/services';
import httpClientMock from '../httpClient.mock';

const notificationsServiceMock = {
  getChannels: () =>
    Promise.resolve({
      ok: true,
      response: {
        channel_list: [],
      },
    }),
};

const notificationsService = new NotificationsService(httpClientMock);
Object.assign(notificationsService, notificationsServiceMock);

export { notificationsServiceMock };
export default notificationsService as NotificationsService;
