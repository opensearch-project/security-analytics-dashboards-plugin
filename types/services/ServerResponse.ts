/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

export type ServerResponse<T> = FailedServerResponse | { ok: true; response: T };
export type FailedServerResponse = { ok: false; error: string };
