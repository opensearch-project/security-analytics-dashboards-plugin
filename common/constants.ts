/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { wazuh } from '../package.json';
import { i18n } from '@osd/i18n';

export const DEFAULT_RULE_UUID = '25b9c01c-350d-4b95-bed1-836d04a4f324';

export const WAZUH_VERSION = wazuh.version;

export const PLUGIN_VERSION_SHORT = WAZUH_VERSION.split('.').splice(0, 2).join('.');

export enum ThreatIntelIocSourceType {
  S3_CUSTOM = 'S3_CUSTOM',
  IOC_UPLOAD = 'IOC_UPLOAD',
  URL_DOWNLOAD = 'URL_DOWNLOAD',
}

export const SpaceTypes = {
  DRAFT: {
    label: i18n.translate('securityAnalytics.spaceTypes.draftLabel', {
      defaultMessage: 'Draft',
    }),
    value: 'draft',
    description: i18n.translate('securityAnalytics.spaceTypes.draftDescription', {
      defaultMessage: 'Staging area for creating or editing resources before testing.',
    }),
  },
  TEST: {
    label: i18n.translate('securityAnalytics.spaceTypes.testLabel', {
      defaultMessage: 'Test',
    }),
    value: 'test',
    description: i18n.translate('securityAnalytics.spaceTypes.testDescription', {
      defaultMessage: 'Controlled environment for validation before production.',
    }),
  },
  CUSTOM: {
    label: i18n.translate('securityAnalytics.spaceTypes.customLabel', {
      defaultMessage: 'Custom',
    }),
    value: 'custom',
    description: i18n.translate('securityAnalytics.spaceTypes.customDescription', {
      defaultMessage: 'Independent space for custom or modified content.',
    }),
  },
  STANDARD: {
    label: i18n.translate('securityAnalytics.spaceTypes.standardLabel', {
      defaultMessage: 'Standard',
    }),
    value: 'standard',
    description: i18n.translate('securityAnalytics.spaceTypes.standardDescription', {
      defaultMessage: 'Wazuh CTI provided resources.',
    }),
  },
} as const;

export const SPACE_ACTIONS = {
  CREATE: 'create',
  EDIT: 'edit',
  DELETE: 'delete',
  PROMOTE: 'promote',
  DEFINE_ROOT_DECODER: 'define_root_decoder',
  REARRANGE_INTEGRATIONS: 'rearrange_integrations',
};

export const AllowedActionsBySpace = {
  [SpaceTypes.DRAFT.value]: [
    SPACE_ACTIONS.CREATE,
    SPACE_ACTIONS.EDIT,
    SPACE_ACTIONS.DELETE,
    SPACE_ACTIONS.PROMOTE,
    SPACE_ACTIONS.DEFINE_ROOT_DECODER,
    SPACE_ACTIONS.REARRANGE_INTEGRATIONS,
  ],
  [SpaceTypes.TEST.value]: [SPACE_ACTIONS.PROMOTE],
  [SpaceTypes.CUSTOM.value]: [],
  [SpaceTypes.STANDARD.value]: [],
};

export const UserSpacesOrder = [
  SpaceTypes.DRAFT.value,
  SpaceTypes.TEST.value,
  SpaceTypes.CUSTOM.value,
];
