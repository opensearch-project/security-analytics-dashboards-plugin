/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

export interface NotificationChannelTypeOptions {
  label: string;
  options: NotificationChannelOption[];
}

export interface NotificationChannelOption {
  label: string;
  value: string;
  type: string;
  description: string;
}
