import httpClientMock from './httpClient.mock';
import { IndexService } from '../../../public/services';
jest.fn();

const indexServiceMock: IndexService = {
  getIndices: () =>
    Promise.resolve({
      ok: true,
      response: {
        indices: [],
      },
    }),
  updateAliases: jest.fn(),
  getAliases: jest.fn(),
  getIndexFields: jest.fn(),
  httpClient: httpClientMock,
};
const indexService = new IndexService(httpClientMock);
Object.assign(indexService, indexServiceMock);

export { indexServiceMock };
export default indexService as IndexService;
