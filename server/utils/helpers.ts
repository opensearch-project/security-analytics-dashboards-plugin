/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { Props, schema } from '@osd/config-schema';
import YAML from 'yaml';

export function createQueryValidationSchema(fieldSchemaObj?: Props) {
  return schema.object({
    ...fieldSchemaObj,
    dataSourceId: schema.maybe(schema.string()),
  });
}

// This function recieves the crude yaml resource and optional extra params (e.g: integration for kvdbs or space for filters).
// The function formats the yaml to have the structure that the backend expects.
export const buildYamlBody = (resourceYaml: string, params?: Record<string, any>): string => {
  const doc = new YAML.Document();
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      doc.set(key, value);
    }
  }
  doc.set('resource', YAML.parseDocument(resourceYaml).contents);
  return doc.toString({ lineWidth: 0 });
};
