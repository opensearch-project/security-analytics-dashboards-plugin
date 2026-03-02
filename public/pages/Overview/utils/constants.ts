/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiCardProps, EuiStatProps, EuiIcon, EuiTextColor } from '@elastic/eui';
import React from 'react';
import {
  DETECTORS_NAV_ID,
  GET_STARTED_NAV_ID,
  THREAT_INTEL_NAV_ID,
  THREAT_INTEL_ENABLED,
} from '../../../utils/constants';
import { getApplication } from '../../../services/utils/constants';

export const summaryGroupByOptions = [
  { text: 'All findings', value: 'finding' },
  { text: 'Log type', value: 'logType' },
];

export const moreLink = 'https://opensearch.org/docs/latest/security-analytics/';

export const getOverviewsCardsProps = (): EuiCardProps[] => {
  const cards: EuiCardProps[] = [
    {
      icon: React.createElement(EuiIcon, { type: 'rocket', size: "l", color: "primary" }),
      title: '',
      description: 'Configure Security Analytics tools and components to get started.',
      onClick: () => {
        getApplication().navigateToApp(GET_STARTED_NAV_ID);
      },
      footer: React.createElement(EuiTextColor, { color: 'subdued' }, 'Get started guide'),
      className: 'usecaseOverviewGettingStartedCard',
    },
    {
      icon: React.createElement(EuiIcon, { type: 'compass', size: "l", color: "primary" }),
      title: '',
      description: 'Explore data to uncover and discover insights.',
      onClick: () => {
        getApplication().navigateToApp('discover');
      },
      footer: React.createElement(EuiTextColor, { color: 'subdued' }, 'Discover'),
      className: 'usecaseOverviewGettingStartedCard',
    },
    {
      icon: React.createElement(EuiIcon, { type: 'pulse', size: "l", color: "primary" }),
      title: '',
      description: 'Identify security threats in your log data with detection rules.',
      onClick: () => {
        getApplication().navigateToApp(DETECTORS_NAV_ID);
      },
      footer: React.createElement(EuiTextColor, { color: 'subdued' }, 'Threat detection'),
      className: 'usecaseOverviewGettingStartedCard',
    },
  ];

  if (THREAT_INTEL_ENABLED) {
    cards.push({
      icon: React.createElement(EuiIcon, { type: 'radar', size: "l", color: "primary" }),
      title: '',
      description: 'Scan your log data for malicious actors from known indicators of compromise.',
      onClick: () => {
        getApplication().navigateToApp(THREAT_INTEL_NAV_ID);
      },
      footer: React.createElement(EuiTextColor, { color: 'subdued' }, 'Threat intelligence'),
      className: 'usecaseOverviewGettingStartedCard',
    });
  }

  return cards;
};

export const getOverviewStatsProps = ({
  // Wazuh: hide alerts and correlations from overview stats.
  // alerts,
  // correlations,
  ruleFindings,
  threatIntelFindings,
}: any): EuiStatProps[] => {
  const stats: EuiStatProps[] = [
    // Wazuh: hide alerts and correlations from overview stats.
    // {
    //   title: alerts,
    //   description: 'Total active threat alerts',
    // },
    // {
    //   title: correlations,
    //   description: 'Correlations',
    // },
    {
      title: ruleFindings,
      description: 'Detection rule findings',
    },
  ];

  if (THREAT_INTEL_ENABLED) {
    stats.push({
      title: threatIntelFindings,
      description: 'Threat intel findings',
    });
  }

  return stats;
};
