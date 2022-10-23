/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { Detector, DetectorInput, PeriodSchedule } from '../../models/interfaces';

export const DATE_MATH_FORMAT = 'YYYY-MM-DDTHH:mm:ss.SSSZ';

export const PLUGIN_NAME = 'opensearch_security_analytics_dashboards';

// TODO: Replace with actual documentation link once it's available
export const DOCUMENTATION_URL = 'https://opensearch.org/docs/latest/';

export const DEFAULT_EMPTY_DATA = '-';

export const ROUTES = Object.freeze({
  ALERTS: '/alerts',
  DASHBOARDS: '/dashboards',
  DETECTORS: '/detectors',
  FINDINGS: '/findings',
  OVERVIEW: '/overview',
  RULES: '/rules',
  RULES_CREATE: '/create-rule',
  RULES_EDIT: '/edit-rule',
  RULES_IMPORT: '/import-rule',
  DETECTORS_CREATE: '/create-detector',

  get LANDING_PAGE(): string {
    return this.OVERVIEW;
  },
});

export const BREADCRUMBS = Object.freeze({
  SECURITY_ANALYTICS: { text: 'Security Analytics', href: '#/' },
  OVERVIEW: { text: 'Overview', href: `#${ROUTES.OVERVIEW}` },
  FINDINGS: { text: 'Findings', href: `#${ROUTES.FINDINGS}` },
  DASHBOARDS: { text: 'Dashboards', href: `#${ROUTES.DASHBOARDS}` },
  DETECTORS: { text: 'Detectors', href: `#${ROUTES.DETECTORS}` },
  RULES: { text: 'Rules', href: `#${ROUTES.RULES}` },
  ALERTS: { text: 'Alerts', href: `#${ROUTES.ALERTS}` },
  RULES_CREATE: { text: 'Create a rule', href: `#${ROUTES.RULES_CREATE}` },
  RULES_EDIT: { text: 'Edit a rule', href: `#${ROUTES.RULES_EDIT}` },
  RULES_IMPORT: { text: 'Import a rule', href: `#${ROUTES.RULES_IMPORT}` },
});

export enum SortDirection {
  ASC = 'asc',
  DESC = 'desc',
}

export const FixedTimeunitOptions = [
  { value: 'ms', text: 'Millisecond(s)' },
  { value: 's', text: 'Second(s)' },
  { value: 'm', text: 'Minute(s)' },
  { value: 'h', text: 'Hour(s)' },
  { value: 'd', text: 'Day(s)' },
];

export const CalendarTimeunitOptions = [
  { value: 'm', text: 'Minute' },
  { value: 'h', text: 'Hour' },
  { value: 'd', text: 'Day' },
  { value: 'w', text: 'Week' },
  { value: 'M', text: 'Month' },
  { value: 'q', text: 'Quarter' },
  { value: 'y', text: 'Year' },
];

export enum IntervalType {
  FIXED = 'fixed',
  CALENDAR = 'calendar',
}

export const EMPTY_DEFAULT_PERIOD_SCHEDULE: PeriodSchedule = {
  period: {
    interval: 1,
    unit: 'MINUTES',
  },
};

export const EMPTY_DEFAULT_DETECTOR_INPUT: DetectorInput = {
  input: {
    description: '',
    indices: [],
    rules: [],
  },
};

export const EMPTY_DEFAULT_DETECTOR: Detector = {
  type: 'detector',
  detector_type: '',
  name: '',
  enabled: true,
  createdBy: '',
  schedule: EMPTY_DEFAULT_PERIOD_SCHEDULE,
  inputs: [EMPTY_DEFAULT_DETECTOR_INPUT],
  triggers: [],
};

export const ALERT_STATE = Object.freeze({
  ACTIVE: 'ACTIVE',
  ACKNOWLEDGED: 'ACKNOWLEDGED',
  COMPLETED: 'COMPLETED',
  ERROR: 'ERROR',
  DELETED: 'DELETED',
});
