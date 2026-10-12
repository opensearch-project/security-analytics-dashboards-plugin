/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { IRouter } from 'opensearch-dashboards/server';
import { schema, Type } from '@osd/config-schema';
import { NodeServices } from '../models/interfaces';
import { API } from '../utils/constants';
import { createQueryValidationSchema } from '../utils/helpers';
import {
  ALERTS_SEARCH_STRING_MAX_LENGTH,
  ALERTS_SEARCH_STRING_PATTERN,
  ALERTS_SORT_FIELDS,
  MAX_ALERTS_RESULT_WINDOW,
} from '../../common/constants';
import { AlertsSortField } from '../../types';

const SEVERITY_LEVELS_PATTERN = /^[1-5](,[1-5])*$/;
const ALERT_STATES = 'ACTIVE|ACKNOWLEDGED|COMPLETED|ERROR|DELETED';
const ALERT_STATES_PATTERN = new RegExp(`^(${ALERT_STATES})(,(${ALERT_STATES}))*$`);

const validateSeverityLevels = (value: string) =>
  SEVERITY_LEVELS_PATTERN.test(value)
    ? undefined
    : 'must be a comma separated list of severity levels from 1 to 5';

const validateAlertStates = (value: string) =>
  ALERT_STATES_PATTERN.test(value)
    ? undefined
    : 'must be a comma separated list of ACTIVE, ACKNOWLEDGED, COMPLETED, ERROR or DELETED';

export function setupAlertsRoutes(services: NodeServices, router: IRouter) {
  const { alertService } = services;

  router.get(
    {
      path: API.GET_ALERTS,
      validate: {
        query: createQueryValidationSchema({
          detectorType: schema.maybe(schema.string()),
          detector_id: schema.maybe(schema.string()),
          sortOrder: schema.maybe(schema.oneOf([schema.literal('asc'), schema.literal('desc')])),
          sortString: schema.maybe(
            schema.oneOf(
              ALERTS_SORT_FIELDS.map((field) => schema.literal(field)) as [Type<AlertsSortField>]
            )
          ),
          // The backend rejects requests where startIndex + size exceeds the max result window.
          size: schema.maybe(schema.number({ min: 0, max: MAX_ALERTS_RESULT_WINDOW })),
          startIndex: schema.maybe(schema.number({ min: 0 })),
          startTime: schema.maybe(schema.number()),
          endTime: schema.maybe(schema.number()),
          searchString: schema.maybe(
            schema.string({
              maxLength: ALERTS_SEARCH_STRING_MAX_LENGTH,
              validate: (value) =>
                ALERTS_SEARCH_STRING_PATTERN.test(value)
                  ? undefined
                  : "must only contain letters, marks, digits, spaces and _ . ' : \\ *",
            })
          ),
          severityLevels: schema.maybe(schema.string({ validate: validateSeverityLevels })),
          alertStates: schema.maybe(schema.string({ validate: validateAlertStates })),
        }),
      },
    },
    alertService.getAlerts
  );

  router.post(
    {
      path: API.ACKNOWLEDGE_ALERTS,
      validate: {
        params: schema.object({
          detector_id: schema.string(),
        }),
        body: schema.any(),
        query: createQueryValidationSchema(),
      },
    },
    alertService.acknowledgeAlerts
  );

  router.get(
    {
      path: `${API.THREAT_INTEL_BASE}/alerts`,
      validate: {
        query: createQueryValidationSchema({
          sortOrder: schema.maybe(schema.string()),
          size: schema.maybe(schema.number()),
          startIndex: schema.maybe(schema.number()),
          startTime: schema.maybe(schema.number()),
          endTime: schema.maybe(schema.number()),
        }),
      },
    },
    alertService.getThreatIntelAlerts
  );

  router.put(
    {
      path: `${API.THREAT_INTEL_BASE}/alerts/status`,
      validate: {
        query: createQueryValidationSchema({
          state: schema.string(),
          alert_ids: schema.string(),
        }),
      },
    },
    alertService.updateThreatIntelAlertsState
  );
}
