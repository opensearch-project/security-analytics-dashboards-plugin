/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

export default {
  id: 'trigger_id_1',
  destination_id: 'some_destination_id_1',
  subject_template: {
    source: 'some_source',
    lang: 'some_lang',
  },
  name: 'some_name',
  throttle_enabled: true,
  message_template: {
    source: 'some_source',
    lang: 'some_lang',
  },
  throttle: {
    unit: 'minutes',
    value: 1,
  },
};
