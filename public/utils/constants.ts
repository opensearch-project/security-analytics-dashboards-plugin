/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { Detector, DetectorInput, PeriodSchedule } from '../../models/interfaces';
import { DetectorHit } from '../../server/models/interfaces';
import { DETECTOR_TYPES } from '../pages/Detectors/utils/constants';

export const DATE_MATH_FORMAT = 'YYYY-MM-DDTHH:mm:ss.SSSZ';
export const MAX_RECENTLY_USED_TIME_RANGES = 5;
export const DEFAULT_DATE_RANGE = { start: 'now-24h', end: 'now' };

export const PLUGIN_NAME = 'opensearch_security_analytics_dashboards';
export const OS_NOTIFICATION_PLUGIN = 'opensearch-notifications';

// TODO: Replace with actual documentation link once it's available
export const DOCUMENTATION_URL = 'https://opensearch.org/docs/latest/';

export const DEFAULT_EMPTY_DATA = '-';

export const ROUTES = Object.freeze({
  ALERTS: '/alerts',
  DETECTORS: '/detectors',
  FINDINGS: '/findings',
  OVERVIEW: '/overview',
  RULES: '/rules',
  RULES_CREATE: '/create-rule',
  RULES_EDIT: '/edit-rule',
  RULES_IMPORT: '/import-rule',
  RULES_DUPLICATE: '/duplicate-rule',
  DETECTORS_CREATE: '/create-detector',
  DETECTOR_DETAILS: '/detector-details',
  EDIT_DETECTOR_DETAILS: '/edit-detector-details',
  EDIT_DETECTOR_RULES: '/edit-detector-rules',
  EDIT_FIELD_MAPPINGS: '/edit-field-mappings',
  EDIT_DETECTOR_ALERT_TRIGGERS: '/edit-alert-triggers',

  get LANDING_PAGE(): string {
    return this.OVERVIEW;
  },
});

export const NOTIFICATIONS_HREF = 'notifications-dashboards#/channels';
export const getNotificationDetailsHref = (channelId: string) =>
  `notifications-dashboards#/channels-details/${channelId}`;

export const BREADCRUMBS = Object.freeze({
  SECURITY_ANALYTICS: { text: 'Security Analytics', href: '#/' },
  OVERVIEW: { text: 'Overview', href: `#${ROUTES.OVERVIEW}` },
  FINDINGS: { text: 'Findings', href: `#${ROUTES.FINDINGS}` },
  DETECTORS: { text: 'Detectors', href: `#${ROUTES.DETECTORS}` },
  DETECTORS_DETAILS: (name: string, detectorId: string) => ({
    text: `${name}`,
    href: `#${ROUTES.DETECTOR_DETAILS}/${detectorId}`,
  }),
  RULES: { text: 'Rules', href: `#${ROUTES.RULES}` },
  ALERTS: { text: 'Alerts', href: `#${ROUTES.ALERTS}` },
  RULES_CREATE: { text: 'Create rule', href: `#${ROUTES.RULES_CREATE}` },
  RULES_EDIT: { text: 'Edit rule', href: `#${ROUTES.RULES_EDIT}` },
  RULES_DUPLICATE: { text: 'Duplicate rule', href: `#${ROUTES.RULES_DUPLICATE}` },
  RULES_IMPORT: { text: 'Import rule', href: `#${ROUTES.RULES_IMPORT}` },
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
  detector_input: {
    description: '',
    indices: [],
    pre_packaged_rules: [],
    custom_rules: [],
  },
};

export const EMPTY_DEFAULT_DETECTOR: Detector = {
  type: 'detector',
  detector_type: DETECTOR_TYPES.NETFLOW.id,
  name: '',
  enabled: true,
  createdBy: '',
  schedule: EMPTY_DEFAULT_PERIOD_SCHEDULE,
  inputs: [EMPTY_DEFAULT_DETECTOR_INPUT],
  triggers: [],
};

export const EMPTY_DEFAULT_DETECTOR_HIT: DetectorHit = {
  _id: '',
  _index: '',
  _source: {
    ...EMPTY_DEFAULT_DETECTOR,
    last_update_time: 0,
    enabled_time: 0,
  },
};

export const ALERT_STATE = Object.freeze({
  ACTIVE: 'ACTIVE',
  ACKNOWLEDGED: 'ACKNOWLEDGED',
  COMPLETED: 'COMPLETED',
  ERROR: 'ERROR',
  DELETED: 'DELETED',
});
