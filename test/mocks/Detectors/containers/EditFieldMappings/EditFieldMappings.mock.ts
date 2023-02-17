/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import detector from '../Detectors/Detector.mock';
import services from '../../../services';
import EditFieldMappings from '../../../../../public/pages/Detectors/containers/FieldMappings/EditFieldMapping';
const { fieldMappingService } = services;

export default ({
  detector: detector,
  filedMappingService: fieldMappingService,
  fieldMappings: [],
  loading: false,
  replaceFieldMappings: jest.fn(),
} as unknown) as typeof EditFieldMappings;
