/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { Duration, ThreatIntelFinding } from '../../types';
import { FindingsService } from '../services';
import { THREAT_INTEL_ENABLED } from '../utils/constants';

export class ThreatIntelStore {
  constructor(private findingsService: FindingsService) {}

  public async getAllThreatIntelFindings(
    signal: AbortSignal,
    duration?: Duration,
    onPartialFindingsFetched?: (findings: ThreatIntelFinding[]) => void
  ) {
    if (!THREAT_INTEL_ENABLED) {
      return [];
    }

    let start = 0;
    const size = 10000;
    let remaining = 10000;
    let findings: ThreatIntelFinding[] = [];

    do {
      if (signal.aborted) {
        return findings;
      }

      start = findings.length;
      const res = await this.findingsService.getThreatIntelFindings({
        startIndex: start,
        size,
        startTime: duration?.startTime,
        endTime: duration?.endTime,
      });

      if (res.ok) {
        if (res.response.total_findings > size) {
          remaining = res.response.total_findings - size;
        } else if (res.response.total_findings === size) {
          remaining = size;
        } else {
          remaining = 0;
        }

        onPartialFindingsFetched?.(res.response.ioc_findings);

        findings = findings.concat(res.response.ioc_findings);
      } else {
        return findings;
      }

      if (signal.aborted) {
        return findings;
      }
    } while (remaining > 0);

    return findings;
  }

  public async getThreatIntelFindingsByIds(findingIds: string[]) {
    if (!THREAT_INTEL_ENABLED) {
      return [];
    }

    const res = await this.findingsService.getThreatIntelFindings({
      findingIds: findingIds.join(','),
    });

    if (res.ok) {
      return res.response.ioc_findings;
    }

    return [];
  }
}
