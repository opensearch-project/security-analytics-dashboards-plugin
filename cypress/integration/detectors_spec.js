/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { PLUGIN_NAME, TWENTY_SECONDS_TIMEOUT, TEST_INDEX } from '../support/constants';

describe('Detectors', () => {
  before(() => {
    cy.deleteAllIndices();

    //Create test index
    cy.createIndex('cypress-test-windows', TEST_INDEX);

    // Visit Detectors page
    cy.visit(`${Cypress.env('opensearch_dashboards')}/app/${PLUGIN_NAME}#/detectors`);

    //wait for page to load
    cy.wait(5000);

    // Check that correct page is showing
    cy.contains('There are no existing detectors.');
  });

  it('...can be created', () => {
    // Locate Create detector button click to start
    cy.contains('Create detector').click({ force: true });

    // Check to ensure process started
    cy.contains('Define detector');

    // Enter a name for the detector in the appropriate input
    cy.get(`input[placeholder="Enter a name for the detector."]`).type('test detector{enter}');

    // Select our pre-seeded data source (cypress-test-windows)
    cy.get(`[data-test-subj="define-detector-select-data-source"]`).type(
      'cypress-test-windows{enter}'
    );

    // Select threat detector type (Windows logs)
    cy.get(`input[id="windows"]`).click({ force: true });

    // Click Next button to continue
    cy.get('button').contains('Next').click({ force: true }, { timeout: 2000 });

    // Check that correct page now showing
    cy.contains('Required field mappings');

    // Continue to next page - skipping mappings
    cy.get('button').contains('Next').click({ force: true }, { timeout: 2000 });

    // Check that correct page now showing
    cy.contains('Set up alerts');

    // Type name of new trigger
    cy.get(`input[placeholder="Enter a name for the alert condition."]`).type('test_trigger');

    // Type in (or select) tags for the alert condition
    cy.get(`[data-test-subj="alert-tags-combo-box"]`).type('attack.defense_evasion{enter}');

    // Select applicable severity levels
    cy.get(`[data-test-subj="security-levels-combo-box"]`).click({ force: true });
    cy.contains('1 (Highest)').click({ force: true });
  });
});
