/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  PLUGIN_NAME,
  TWENTY_SECONDS_TIMEOUT,
  TEST_INDEX,
  TEST_DETECTOR,
  TEST_DOCUMENT,
} from '../support/constants';

describe('Findings', () => {
  before(() => {
    // delete any existing indices
    cy.deleteAllIndices();
  });

  //TODO - get findings to be present, then test

  it('displays findings based on recently ingested data', () => {});
});
