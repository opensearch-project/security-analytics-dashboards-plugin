/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { RuleEditorProps } from '../../../../../public/pages/Rules/components/RuleEditor/RuleEditorContainer';
import browserHistoryMock from '../../../services/browserHistory.mock';
import notificationsStartMock from '../../../services/notifications/NotificationsStart.mock';

export default {
  title: 'Rule title',
  rule: undefined,
  history: browserHistoryMock,
  notifications: notificationsStartMock,
  mode: 'create',
} as RuleEditorProps;
