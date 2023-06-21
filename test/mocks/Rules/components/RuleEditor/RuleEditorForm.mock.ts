/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { VisualRuleEditorProps } from '../../../../../public/pages/Rules/components/RuleEditor/RuleEditorForm';
import notificationsStartMock from '../../../services/notifications/NotificationsStart.mock';
import { ruleStatus } from '../../../../../public/pages/Rules/utils/constants';

export default {
  initialValue: {
    id: '25b9c01c-350d-4b95-bed1-836d04a4f324',
    log_source: '',
    logType: '',
    name: '',
    description: '',
    status: ruleStatus[0],
    author: '',
    references: [],
    tags: [],
    detection: '',
    level: '',
    falsePositives: [],
  },
  notifications: notificationsStartMock,
  submit: () => {},
  cancel: () => {},
  mode: 'create',
  title: 'title',
} as VisualRuleEditorProps;
