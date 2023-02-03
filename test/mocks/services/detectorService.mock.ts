import httpClientMock from './httpClient.mock';
import { DetectorService } from '../../../server/services';
import detectorHitMock from '../Detectors/containers/Detectors/DetectorHit.mock';

const detectorService = new DetectorService(httpClientMock);
Object.assign(detectorService, {
  getDetectors: () =>
    Promise.resolve({
      ok: true,
      response: {
        hits: {
          hits: [detectorHitMock],
        },
      },
    }),
});

export default detectorService;
