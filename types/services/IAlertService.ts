/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { AcknowledgeAlertsResponse, GetAlertsParams, GetAlertsResponse } from '../Alert';
import { ServerResponse } from './ServerResponse';

export interface IAlertService {
  getAlerts(detectorParams: GetAlertsParams): Promise<ServerResponse<GetAlertsResponse>>;
  acknowledgeAlerts(
    alertIds: string[],
    detector_id: string
  ): Promise<ServerResponse<AcknowledgeAlertsResponse>>;
}
