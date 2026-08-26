/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  isResourceSharingAvailable,
  SA_DETECTOR_RESOURCE_TYPE,
  SA_CORRELATION_RULE_RESOURCE_TYPE,
} from '../resource_sharing';
import { setApplication } from '../constants';

const setResourceSharing = (resourceSharing?: Record<string, unknown>) =>
  setApplication({ capabilities: resourceSharing ? { resourceSharing } : {} } as any);

describe('isResourceSharingAvailable', () => {
  it('returns false when the resourceSharing capability is absent', () => {
    setResourceSharing();
    expect(isResourceSharingAvailable(SA_DETECTOR_RESOURCE_TYPE)).toBe(false);
  });

  it('returns false when resource sharing is disabled', () => {
    setResourceSharing({ enabled: false, availableTypes: 'detector' });
    expect(isResourceSharingAvailable(SA_DETECTOR_RESOURCE_TYPE)).toBe(false);
  });

  it('returns false when the resource type is not in availableTypes', () => {
    setResourceSharing({ enabled: true, availableTypes: 'workflow,notification_config' });
    expect(isResourceSharingAvailable(SA_DETECTOR_RESOURCE_TYPE)).toBe(false);
  });

  it('returns true when enabled and the detector type is present', () => {
    setResourceSharing({ enabled: true, availableTypes: 'detector,correlation-rule' });
    expect(isResourceSharingAvailable(SA_DETECTOR_RESOURCE_TYPE)).toBe(true);
  });

  it('returns true for the correlation-rule type when present', () => {
    setResourceSharing({ enabled: true, availableTypes: 'detector,correlation-rule' });
    expect(isResourceSharingAvailable(SA_CORRELATION_RULE_RESOURCE_TYPE)).toBe(true);
  });

  it('returns false and swallows errors when the application has not been set', () => {
    setApplication(undefined as any);
    expect(isResourceSharingAvailable(SA_DETECTOR_RESOURCE_TYPE)).toBe(false);
  });
});
