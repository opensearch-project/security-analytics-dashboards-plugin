/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { mockFieldMappingService } from '../../components/UpdateFieldMappings/UpdateFieldMappings.mock';
import { mockDetector } from '../Detectors/Detectors.mock';

export default {
  detector: mockDetector,
  filedMappingService: mockFieldMappingService,
  fieldMappings: [],
  loading: false,
  replaceFieldMappings: jest.fn(),
};
