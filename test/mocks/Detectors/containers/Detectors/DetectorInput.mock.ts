/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import ruleInfoMock from '../../../Rules/RuleInfo.mock';
import { DetectorInput } from '../../../../../models/interfaces';

export default {
  detector_input: {
    description: 'detectorDescription',
    indices: ['.windows'],
    pre_packaged_rules: [ruleInfoMock],
    custom_rules: [ruleInfoMock],
  },
} as DetectorInput;
