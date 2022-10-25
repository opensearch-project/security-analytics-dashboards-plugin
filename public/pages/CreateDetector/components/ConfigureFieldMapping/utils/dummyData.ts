/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { GetFieldMappingViewResponse } from '../../../../../../server/models/interfaces';

export const EMPTY_FIELD_MAPPINGS: GetFieldMappingViewResponse = {
  properties: {},
  unmapped_field_aliases: [],
  unmapped_index_fields: [],
};
