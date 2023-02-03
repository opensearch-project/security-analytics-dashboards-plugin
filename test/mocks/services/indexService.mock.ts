import httpClientMock from './httpClient.mock';
import { IndexService } from '../../../public/services';

const indexService = new IndexService(httpClientMock);
Object.assign(indexService, {
  getIndices: () =>
    Promise.resolve({
      ok: true,
      response: {
        indices: [],
      },
    }),
});

export default indexService as IndexService;
