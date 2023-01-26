/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { mockDetector } from '../../../Interfaces.mock';
import { mockFieldMappingService } from '../../components/UpdateFieldMappings/UpdateFieldMappings.mock';

export default {
  detector: mockDetector,
  filedMappingService: mockFieldMappingService,
  fieldMappings: [],
  loading: false,
  replaceFieldMappings: jest.fn(),
};
