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

    // create new index
    cy.createIndex('cypress-test-windows', TEST_INDEX);

    // create new detector
    cy.createDetector(TEST_DETECTOR);

    // Visit Findings page
    cy.visit(`${Cypress.env('opensearch_dashboards')}/app/${PLUGIN_NAME}#/Findings`);
  });

  it('displays findings based on recently ingested data', () => {
    // Check pre-ingestion status is empty
    cy.contains('No items found');

    // Ingest test document
    cy.ingestDocument('windows-test-cypress', TEST_DOCUMENT);

    // Check findings list is populated
    cy.contains('No items found').should('not.exist');
  });
});
