/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { DetectorHit } from '../../../../server/models/interfaces';
import { FieldMappingsTableItem } from '../../../../types';

export function getDetectorIds(detectors: DetectorHit[]) {
  return detectors.map((detector) => detector._id).join(', ');
}

export function getDetectorNames(detectors: DetectorHit[]) {
  return detectors.map((detector) => detector._source.name).join(', ');
}

export const getMappingFields = (
  properties: any,
  items: FieldMappingsTableItem[] = [],
  prefix: string = ''
): FieldMappingsTableItem[] => {
  for (let field in properties) {
    const fullFieldName = prefix ? `${prefix}.${field}` : field;
    const nextProperties = properties[field].properties;
    if (!nextProperties) {
      items.push({
        ruleFieldName: fullFieldName,
        logFieldName: properties[field].path,
      });
    } else {
      getMappingFields(nextProperties, items, fullFieldName);
    }
  }
  return items;
};
