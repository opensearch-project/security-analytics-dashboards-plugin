/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiCardProps, EuiStatProps } from '@elastic/eui';
import {
  CORRELATIONS_RULE_NAV_ID,
  DETECTORS_NAV_ID,
  GETTING_STARTED_NAV_ID,
  THREAT_ALERTS_NAV_ID,
  THREAT_INTEL_NAV_ID,
} from '../../../utils/constants';
import { getApplication } from '../../../services/utils/constants';

export const summaryGroupByOptions = [
  { text: 'All findings', value: 'finding' },
  { text: 'Log type', value: 'logType' },
];

export const moreLink = 'https://opensearch.org/docs/latest/security-analytics/';

export const getOverviewsCardsProps = (): EuiCardProps[] => [
  {
    title: 'Configure Security Analytics',
    description: 'Set up tools and components to get started.',
    selectable: {
      onClick: () => {
        getApplication().navigateToApp(GETTING_STARTED_NAV_ID);
      },
      children: 'Getting started guide',
      isDisabled: false,
    },
  },
  {
    title: 'Uncover security findings',
    description: 'Identify security threats in your log data with detection rules.',
    selectable: {
      onClick: () => {
        getApplication().navigateToApp(DETECTORS_NAV_ID);
      },
      children: 'Threat detectors',
      isDisabled: false,
    },
  },
  {
    title: 'Discover insights',
    description: 'Explore data to uncover insights.',
    selectable: {
      onClick: () => {
        getApplication().navigateToApp('discover');
      },
      children: 'Discover',
      isDisabled: false,
    },
  },
  {
    title: 'Get notified',
    description: 'Receive timely notifications with detector-driven alerts.',
    selectable: {
      onClick: () => {
        getApplication().navigateToApp(THREAT_ALERTS_NAV_ID);
      },
      children: 'Threat alerts',
      isDisabled: false,
    },
  },
  {
    title: 'Correlate events',
    description: 'Detect multi-system threats with correlation rule builder',
    selectable: {
      onClick: () => {
        getApplication().navigateToApp(CORRELATIONS_RULE_NAV_ID);
      },
      children: 'Correlation rules',
      isDisabled: false,
    },
  },
  {
    title: 'Scan your logs',
    description: 'Identify malicious actors from known indicators of compromise.',
    selectable: {
      onClick: () => {
        getApplication().navigateToApp(THREAT_INTEL_NAV_ID);
      },
      children: ' Threat intelligence',
      isDisabled: false,
    },
  },
];

export const getOverviewStatsProps = ({
  alerts,
  correlations,
  ruleFindings,
  threatIntelFindings,
}: any): EuiStatProps[] => {
  return [
    {
      title: alerts,
      description: 'Total active alerts',
    },
    {
      title: correlations,
      description: 'Correlations',
    },
    {
      title: ruleFindings,
      description: 'Detection rule findings',
    },
    {
      title: threatIntelFindings,
      description: 'Threat intel findings',
    },
  ];
};
