/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { Rule } from '../../../../../../../../models/interfaces';

const ruleTypes = ['Cloud', 'Web', 'Network'];

export const dummyDetectorRules: Rule[] = Array(10)
  .fill(undefined)
  .map((_, idx) => {
    return {
      id: `${idx}`,
      name: `Rule ${idx}`,
      type: `${ruleTypes[idx % 3]}`,
      active: idx < 5,
      rule: `Rule for finding detections`,
      description: `Rule for finding detections of type ${ruleTypes[idx % 3]}`,
    };
  });
