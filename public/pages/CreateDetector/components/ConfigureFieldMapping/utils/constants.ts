/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { GetFieldMappingViewResponse } from '../../../../../../server/models/interfaces';

export const STATUS_ICON_PROPS = {
  unmapped: { type: 'alert', color: 'danger' },
  mapped: { type: 'checkInCircleFilled', color: 'success' },
};

export const EMPTY_FIELD_MAPPINGS: GetFieldMappingViewResponse = {
  properties: {},
  unmapped_field_aliases: [],
  unmapped_index_fields: [],
};
