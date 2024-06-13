/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { ThreatIntelNextStepCardProps } from '../../../../types';

export const threatIntelNextStepsProps: ThreatIntelNextStepCardProps[] = [
  {
    id: 'connect',
    title: '1. Connect to threat intel sources',
    description: 'Connect threat intel sources to get started',
    footerButtonText: 'Manage threat intel sources',
  },
  {
    id: 'configure-scan',
    title: '2. Set up the scan for your log sources',
    description: 'Select log sources for scan and get alerted on security threats',
    footerButtonText: 'Configure scan',
  },
];
