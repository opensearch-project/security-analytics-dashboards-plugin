/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import detector from '../Detectors/Detector.mock';
import services from '../../../services';
const { fieldMappingService } = services;

export default {
  detector: detector,
  filedMappingService: fieldMappingService,
  fieldMappings: [],
  loading: false,
  replaceFieldMappings: jest.fn(),
};
