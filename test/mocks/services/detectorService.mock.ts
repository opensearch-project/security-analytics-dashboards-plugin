import { DetectorService } from '../../../server/services';
import detectorHitMock from '../Detectors/containers/Detectors/DetectorHit.mock';
import legacyClusterClientMock from './iLegacyCustomClusterClient.mock';

const detectorServiceMock = {
  getDetectors: () =>
    Promise.resolve({
      ok: true,
      response: {
        hits: {
          hits: [detectorHitMock],
        },
      },
    }),
};
const detectorService = new DetectorService(legacyClusterClientMock);
Object.assign(detectorService, detectorServiceMock);

export { detectorServiceMock };
export default detectorService as DetectorService;
