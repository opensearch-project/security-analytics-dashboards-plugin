import httpClientMock from './httpClient.mock';
import { IndexService } from '../../../public/services';
jest.fn();

const indexServiceMock = {
  getIndices: () =>
    Promise.resolve({
      ok: true,
      response: {
        indices: [],
      },
    }),
};
const indexService = new IndexService(httpClientMock);
Object.assign(indexService, indexServiceMock);

export { indexServiceMock };
export default indexService as IndexService;
