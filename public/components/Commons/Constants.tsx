/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
export const DEFAULT_MESSAGE_SOURCE = {
  MESSAGE_BODY: `- Triggered alert condition: {{ctx.trigger.name}}
 - Severity: {{ctx.trigger.severity}}
 - Threat detector: {{ctx.detector.name}}
 - Description: {{ctx.detector.description}}
 - Detector data sources: {{ctx.detector.datasources}}
  `.trim(),
  MESSAGE_SUBJECT: `Triggered alert condition:  {{ctx.trigger.name}} - Severity: {{ctx.trigger.severity}} - Threat detector: {{ctx.detector.name}}
  `.trim(),
};
