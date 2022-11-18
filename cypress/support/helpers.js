/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { PLUGIN_NAME } from './constants';
import sample_field_mappings from '../fixtures/sample_field_mappings.json';
import sample_index_settings from '../fixtures/sample_index_settings.json';

export const createDetector = () => {
  // Delete any existing indices
  cy.deleteAllIndices();

  // Create test index
  cy.createIndex('cypress-test-windows', sample_index_settings);

  // Visit Detectors page to create detector manually
  cy.visit(`${Cypress.env('opensearch_dashboards')}/app/${PLUGIN_NAME}#/detectors`);

  cy.wait(5000);

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

  // Wait for detector rules to load - timeout on click above ineffective
  cy.wait(5000);

  // Click Next button to continue
  cy.get('button').contains('Next').click({ force: true }, { timeout: 2000 });

  // Check that correct page now showing
  cy.contains('Required field mappings');

  // Select appropriate names to map fields to
  for (let field_name in sample_field_mappings) {
    const mappedTo = sample_field_mappings[field_name];

    cy.contains('tr', field_name).within(() => {
      cy.get(`[data-test-subj="detector-field-mappins-select"]`).select(mappedTo);
    });
  }

  // Continue to next page
  cy.get('button').contains('Next').click({ force: true }, { timeout: 2000 });

  // Check that correct page now showing
  cy.contains('Set up alerts');

  // Type name of new trigger
  cy.get(`input[placeholder="Enter a name for the alert condition."]`).type('test_trigger');

  // Type rule name to trigger alert
  cy.get(`[data-test-subj="alert-rulename-combo-box"]`).type('USB Device Plugged{enter}');

  // Select applicable severity levels
  cy.get(`[data-test-subj="security-levels-combo-box"]`).click({ force: true });
  cy.contains('1 (Highest)').click({ force: true });

  // Type rule severity to trigger alert
  cy.get(`[data-test-subj="alert-severity-combo-box"]`).type('low{enter}');

  // Continue to next page
  cy.contains('Next').click({ force: true });

  // Confirm page is reached
  cy.contains('Review and create');

  // Confirm field mappings registered
  cy.contains('Field mapping');
  for (let field in sample_field_mappings) {
    const mappedTo = sample_field_mappings[field];

    cy.contains(field);
    cy.contains(mappedTo);
  }

  // Create the detector
  cy.get('button').contains('Create').click({ force: true });

  cy.wait(10000);
};
