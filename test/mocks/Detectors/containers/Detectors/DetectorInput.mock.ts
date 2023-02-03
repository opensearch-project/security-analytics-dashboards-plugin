/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import ruleInfo from '../../../Rules/RuleInfo.mock';

export default {
  detector_input: {
    description: 'detectorDescription',
    indices: ['.windows'],
    pre_packaged_rules: [ruleInfo],
    custom_rules: [ruleInfo],
  },
};
