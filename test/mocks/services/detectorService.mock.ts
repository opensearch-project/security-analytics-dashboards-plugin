import { DetectorService } from '../../../server/services';
import detectorHitMock from '../Detectors/containers/Detectors/DetectorHit.mock';
import legacyClusterClientMock from './iLegacyCustomClusterClient.mock';

const detectorService = new DetectorService(legacyClusterClientMock);
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

export default detectorService as DetectorService;
