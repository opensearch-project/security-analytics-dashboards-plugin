/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { SimpleSavedObject } from 'opensearch-dashboards/public';
import { Detector, LogType, ServerResponse } from '../../types';
import { DetectorInput, PeriodSchedule } from '../../models/interfaces';
import { DetectorHit } from '../../server/models/interfaces';
import _ from 'lodash';
import { euiPaletteColorBlind } from '@elastic/eui';

export const DATE_MATH_FORMAT = 'YYYY-MM-DDTHH:mm:ss.SSSZ';
export const MAX_RECENTLY_USED_TIME_RANGES = 5;
export const DEFAULT_DATE_RANGE = { start: 'now-24h', end: 'now' };
export const DATE_TIME_FILTER_KEY = 'security_analytics_time_filter';

export const PLUGIN_NAME = 'opensearch_security_analytics_dashboards';
export const OS_NOTIFICATION_PLUGIN = 'opensearch-notifications';

export const DEFAULT_EMPTY_DATA = '-';

export let isDarkMode: boolean = false;

export function setDarkMode(isDarkModeSetting: boolean) {
  isDarkMode = isDarkModeSetting;
}

export const ROUTES = Object.freeze({
  ROOT: '/',
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
  CORRELATIONS: '/correlations',
  CORRELATION_RULES: '/correlations/rules',
  CORRELATION_RULE_CREATE: '/correlations/create-rule',
  CORRELATION_RULE_EDIT: '/correlations/rule',
  LOG_TYPES: '/log-types',
  LOG_TYPES_CREATE: '/create-log-type',
  THREAT_INTEL_OVERVIEW: '/threat-intel',
  THREAT_INTEL_ADD_CUSTOM_SOURCE: '/add-threat-intel-source',
  THREAT_INTEL_CREATE_SCAN_CONFIG: '/create-scan-config',
  THREAT_INTEL_EDIT_SCAN_CONFIG: '/edit-scan-config',
  THREAT_INTEL_SOURCE_DETAILS: '/threat-intel-source',

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
  DETECTORS_CREATE: { text: 'Create detector', href: `#${ROUTES.DETECTORS_CREATE}` },
  DETECTORS_DETAILS: (name: string, detectorId: string) => ({
    text: `${name}`,
    href: `#${ROUTES.DETECTOR_DETAILS}/${detectorId}`,
  }),
  DETECTORS_EDIT_DETAILS: (name: string, detectorId: string) => ({
    text: `${name}`,
    href: `#${ROUTES.EDIT_DETECTOR_DETAILS}/${detectorId}`,
  }),
  RULES: { text: 'Detection rules', href: `#${ROUTES.RULES}` },
  ALERTS: { text: 'Alerts', href: `#${ROUTES.ALERTS}` },
  RULES_CREATE: { text: 'Create detection rule', href: `#${ROUTES.RULES_CREATE}` },
  RULES_EDIT: { text: 'Edit rule', href: `#${ROUTES.RULES_EDIT}` },
  RULES_DUPLICATE: { text: 'Duplicate rule', href: `#${ROUTES.RULES_DUPLICATE}` },
  RULES_IMPORT: { text: 'Import rule', href: `#${ROUTES.RULES_IMPORT}` },
  CORRELATIONS: { text: 'Correlations', href: `#${ROUTES.CORRELATIONS}` },
  CORRELATION_RULES: { text: 'Correlation rules', href: `#${ROUTES.CORRELATION_RULES}` },
  CORRELATIONS_RULE_CREATE: {
    text: 'Create correlation rule',
    href: `#${ROUTES.CORRELATION_RULE_CREATE}`,
  },
  LOG_TYPES: { text: 'Log types', href: `#${ROUTES.LOG_TYPES}` },
  LOG_TYPE_CREATE: { text: 'Create log type', href: `#${ROUTES.LOG_TYPES_CREATE}` },
  THREAT_INTEL_OVERVIEW: { text: 'Threat intelligence', href: `#${ROUTES.THREAT_INTEL_OVERVIEW}` },
  THREAT_INTEL_ADD_CUSTOM_SOURCE: {
    text: 'Add threat intel source',
    href: `#${ROUTES.THREAT_INTEL_ADD_CUSTOM_SOURCE}`,
  },
  THREAT_INTEL_SETUP_SCAN_CONFIG: {
    text: 'Setup real-time scan',
    href: `#${ROUTES.THREAT_INTEL_CREATE_SCAN_CONFIG}`,
  },
  THREAT_INTEL_EDIT_SCAN_CONFIG: {
    text: 'Edit real-time scan',
    href: `#${ROUTES.THREAT_INTEL_EDIT_SCAN_CONFIG}`,
  },
  THREAT_INTEL_SOURCE_DETAILS: (name: string, id: string) => ({
    text: `${name}`,
    href: `#${ROUTES.THREAT_INTEL_SOURCE_DETAILS}/${id}`,
  }),
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

export const scheduleUnitText: { [key: string]: string } = {
  MINUTES: 'minute',
  HOURS: 'hour',
  DAYS: 'day',
  WEEKS: 'week',
  MONTHS: 'month',
  QUARTERS: 'quarter',
  YEARS: 'year',
};

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
  detector_type: 'network',
  name: '',
  enabled: true,
  createdBy: '',
  schedule: EMPTY_DEFAULT_PERIOD_SCHEDULE,
  inputs: [EMPTY_DEFAULT_DETECTOR_INPUT],
  triggers: [],
  threat_intel_enabled: false,
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

export const logTypesWithDashboards = new Set(['network', 'cloudtrail', 's3']);

export const pendingDashboardCreations: {
  [detectorId: string]: undefined | Promise<void | ServerResponse<SimpleSavedObject<unknown>>>;
} = {};

export const logTypeCategoryDescription: { name: string; description: string }[] = [
  { name: 'Access Management', description: 'User access, authentication, group management' },
  { name: 'Applications', description: 'Application lifecycle, API, and web resources activities' },
  { name: 'Cloud Services', description: 'Services managed by cloud providers' },
  { name: 'Network Activity', description: 'DNS, HTTP, Email, SSH, FTP, DHCP, RDP' },
  { name: 'System Activity', description: 'System monitoring logs' },
  { name: 'Other', description: 'Logs not covered in other categories' },
];

export const logTypeCategories: string[] = [];
export const logTypesByCategories: { [category: string]: LogType[] } = {};

export const defaultColorForVisualizations: string = euiPaletteColorBlind()[0];

export const defaultIntervalUnitOptions = {
  MINUTES: { value: 'MINUTES', text: 'Minutes' },
  HOURS: { value: 'HOURS', text: 'Hours' },
  DAYS: { value: 'DAYS', text: 'Days' },
};
