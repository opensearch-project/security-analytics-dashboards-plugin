/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { detectorMock } from '../../../Interfaces.mock';
import { fieldMappingService } from '../../components/UpdateFieldMappings/UpdateFieldMappings.mock';

export default {
  detector: detectorMock,
  filedMappingService: fieldMappingService,
  fieldMappings: [],
  loading: false,
  replaceFieldMappings: jest.fn(),
};
