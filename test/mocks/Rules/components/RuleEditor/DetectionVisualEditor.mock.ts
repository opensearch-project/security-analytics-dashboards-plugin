/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { DetectionVisualEditorProps } from '../../../../../public/pages/Rules/components/RuleEditor/DetectionVisualEditor';

export default {
  detectionYml: '',
  onChange: () => {},
  setIsDetectionInvalid: () => {},
  mode: 'create',
  isInvalid: false,
  goToYamlEditor: jest.fn(),
} as DetectionVisualEditorProps;
