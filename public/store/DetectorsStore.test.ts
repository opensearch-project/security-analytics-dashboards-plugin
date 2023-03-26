/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { DataStore } from './DataStore';
import notificationsStartMock from '../../test/mocks/services/notifications/NotificationsStart.mock';
import services from '../../test/mocks/services';
import { DetectorsStore } from './DetectorsStore';
import { expect } from '@jest/globals';
import detectorResponseMock from '../../test/mocks/Detectors/containers/Detectors/DetectorResponse.mock';
import browserHistoryMock from '../../test/mocks/services/browserHistory.mock';
import { CreateDetectorState } from '../pages/CreateDetector/containers/CreateDetector';
import DetectorMock from '../../test/mocks/Detectors/containers/Detectors/Detector.mock';
describe('Detectors store specs', () => {
  Object.assign(services, {
    detectorService: {
      getRules: () => Promise.resolve(detectorResponseMock),
      deleteRule: () => Promise.resolve(true),
    },
  });

  DataStore.init(services, notificationsStartMock);

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('detectors store should be created', () => {
    expect(DataStore.detectors instanceof DetectorsStore).toBe(true);
  });

  it('should handle the state', () => {
    DataStore.detectors.setState(
      {
        pendingRequests: [Promise.resolve()],
        detectorState: {
          detector: { detector_type: 'test_detector_type' } as typeof DetectorMock,
        } as CreateDetectorState,
      },
      browserHistoryMock
    );

    let state = DataStore.detectors.getState();
    expect(state?.detectorState?.detector.detector_type).toBe('test_detector_type');

    DataStore.detectors.deleteState();
    state = DataStore.detectors.getState();
    expect(state).toBe(undefined);
  });

  it('should get successful pending state', async () => {
    DataStore.detectors.setState(
      {
        pendingRequests: [
          Promise.resolve({
            ok: true,
          }),
          Promise.resolve({
            ok: true,
            response: {
              _id: '',
              detector: {
                detector_type: '',
                inputs: [
                  {
                    detector_input: {
                      indices: [],
                    },
                  },
                ],
              },
            },
          }),
        ],
        detectorState: {
          detector: { detector_type: 'test_detector_type' } as typeof DetectorMock,
        } as CreateDetectorState,
      },
      browserHistoryMock
    );
    const pending = await DataStore.detectors.getPendingState();
    expect(pending.ok).toBe(true);
  });

  it('should get failed pending state', async () => {
    DataStore.detectors.setState(
      {
        pendingRequests: [
          Promise.resolve({
            ok: false,
          }),
        ],
        detectorState: {
          detector: { detector_type: 'test_detector_type' } as typeof DetectorMock,
        } as CreateDetectorState,
      },
      browserHistoryMock
    );
    const pending = await DataStore.detectors.getPendingState();
    expect(pending.ok).toBe(false);
  });
});
