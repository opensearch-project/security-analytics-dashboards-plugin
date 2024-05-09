/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { Props, schema } from '@osd/config-schema';

export function createQueryValidationSchema(fieldSchemaObj?: Props) {
  return schema.object({
    ...fieldSchemaObj,
    dataSourceId: schema.maybe(schema.string()),
  });
}
