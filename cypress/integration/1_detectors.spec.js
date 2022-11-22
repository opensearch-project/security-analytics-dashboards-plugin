/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import { PLUGIN_NAME } from '../support/constants';
import sample_field_mappings from '../fixtures/sample_field_mappings.json';
import sample_index_settings from '../fixtures/sample_index_settings.json';

describe('Detectors', () => {
  before(() => {
    cy.deleteAllIndices();

    // Create test index
    cy.createIndex('cypress-test-windows', sample_index_settings);

    cy.contains('test detector').should('not.exist');
  });

  beforeEach(() => {
    // Visit Detectors page
    cy.visit(`${Cypress.env('opensearch_dashboards')}/app/${PLUGIN_NAME}#/detectors`);

    //wait for page to load
    cy.wait(7000);

    // Check that correct page is showing
    cy.url().should(
      'eq',
      'http://localhost:5601/app/opensearch_security_analytics_dashboards#/detectors'
    );
  });

  it('...can be created', () => {
    // Locate Create detector button click to start
    cy.contains('Create detector').click({ force: true });

    // Check to ensure process started
    cy.contains('Define detector');
    cy.url().should(
      'eq',
      'http://localhost:5601/app/opensearch_security_analytics_dashboards#/create-detector'
    );

    // Enter a name for the detector in the appropriate input
    cy.get(`input[placeholder="Enter a name for the detector."]`).type('test detector{enter}');

    // Select our pre-seeded data source (cypress-test-windows)
    cy.get(`[data-test-subj="define-detector-select-data-source"]`).type(
      'cypress-test-windows{enter}'
    );

    // Select threat detector type (Windows logs)
    cy.get(`input[id="windows"]`).click({ force: true });

    // // Wait for detector rules to load - timeout on click above ineffective
    // cy.wait(7000);

    // Open Detection rules accordion
    cy.contains('Detection rules').click({ timeout: 5000 });

    // find search, type USB
    cy.get(`[placeholder="Search..."]`).type('USB Device Plugged').trigger('search');

    // Disable all rules
    cy.contains('tr', 'USB Device Plugged', { timeout: 20000 });
    cy.get('th').within(() => {
      cy.get('button').first().click({ force: true });
    });

    // enable single rule
    cy.contains('tr', 'USB Device Plugged').within(() => {
      cy.get('button').eq(1).click({ force: true });
    });

    // Click Next button to continue
    cy.get('button').contains('Next').click({ force: true, timeout: 2000 });

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
    cy.get('button').contains('Next').click({ force: true, timeout: 2000 });

    // Check that correct page now showing
    cy.contains('Set up alerts');

    // Type name of new trigger
    cy.get(`input[placeholder="Enter a name for the alert condition."]`).type('test_trigger');

    // Type in (or select) tags for the alert condition
    cy.get(`[data-test-subj="alert-tags-combo-box"]`).type('attack.defense_evasion{enter}');

    // Select applicable severity levels
    cy.get(`[data-test-subj="security-levels-combo-box"]`).click({ force: true });
    cy.contains('1 (Highest)').click({ force: true });

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

    // Confirm entries user has made
    cy.contains('Detector details');
    cy.contains('test detector');
    cy.contains('windows');
    cy.contains('cypress-test-windows');
    cy.contains('Alert on test_trigger');

    // need to pause here so button is found
    // cy.wait(5000);

    // Create the detector
    cy.get('button').contains('Create').click({ force: true });

    // wait for creation to finish, timeout above does not work
    cy.wait(10000);

    // Confirm detector active
    cy.contains('There are no existing detectors.').should('not.exist');
    cy.contains('test detector');
    cy.contains('Active');
    cy.contains('View Findings');
    cy.contains('Detector configuration');
    cy.contains('Field mappings');
    cy.contains('Alert triggers');
    cy.contains('Detector details');
    cy.contains('Created at');
    cy.contains('Last updated time');
  });

  it('...basic details can be edited', () => {
    // Click on detector name
    cy.contains('test detector').click({ force: true });

    // Confirm on detector details page
    cy.contains('test detector');

    // Click "Edit" button in detector details
    cy.get(`[data-test-subj="edit-detector-basic-details"]`).click({ force: true });

    // Confirm arrival at "Edit detector details" page
    cy.url().should(
      'include',
      'http://localhost:5601/app/opensearch_security_analytics_dashboards#/edit-detector-details'
    );

    cy.wait(5000);
    // Change detector name
    cy.get(`[data-test-subj="define-detector-detector-name"]`).type('_edited');

    // Change detector description
    cy.get(`[data-test-subj="define-detector-detector-description"]`).type('Edited description');

    // Change input source
    cy.get(`[data-test-subj="define-detector-select-data-source"]`).type(
      '{backspace}.opensearch-notifications-config{enter}'
    );

    // Change detector scheduling
    cy.get(`[data-test-subj="detector-schedule-number-select"]`).type('0');
    cy.get(`[data-test-subj="detector-schedule-unit-select"]`).select('Hours');

    cy.wait(7000);
    // Save changes to detector details
    cy.get(`[data-test-subj="save-basic-details-edits"]`).click({ force: true }, { timeout: 5000 });

    // Confirm taken to detector details page
    cy.url().should(
      'include',
      'http://localhost:5601/app/opensearch_security_analytics_dashboards#/detector-details'
    );

    // Verify edits are applied
    cy.contains('test detector_edited');
    cy.contains('Every 10 hours');
    cy.contains('Edited description');
    cy.contains('.opensearch-notifications-config');
  });

  it('...rules can be edited', () => {
    // Ensure start on main detectors page
    cy.url().should(
      'eq',
      'http://localhost:5601/app/opensearch_security_analytics_dashboards#/detectors'
    );

    // Click on detector name
    cy.contains('test detector').click({ force: true, timeout: 5000 });

    // Confirm number of rules before edit
    cy.contains('Detection rules (1)');

    // Click "Edit" button in Detector rules panel
    cy.get(`[data-test-subj="edit-detector-rules"]`).click({ force: true });

    // Confirm arrival on "Edit detector rules" page
    cy.url().should(
      'include',
      'http://localhost:5601/app/opensearch_security_analytics_dashboards#/edit-detector-rules'
    );

    // Search for specific rule
    cy.get(`[placeholder="Search..."]`).type('USB Device').trigger('search', { timeout: 5000 });

    // Toggle single search result to unchecked
    cy.contains('tr', 'USB Device Plugged').within(() => {
      // Of note, timeout can sometimes work instead of wait here, but is very unreliable from case to case.
      cy.wait(1000);
      cy.get('button').eq(0).click();
    });

    // Save changes
    cy.get(`[data-test-subj="save-detector-rules-edits"]`).click({ force: true, timeout: 5000 });

    // Confirm 1 rule has been removed from detector
    cy.contains('Detection rules (0)');

    // Click "Edit" button in Detector rules panel
    cy.get(`[data-test-subj="edit-detector-rules"]`).click({ force: true });

    // Confirm arrival on "Edit detector rules" page
    cy.url().should(
      'include',
      'http://localhost:5601/app/opensearch_security_analytics_dashboards#/edit-detector-rules'
    );

    // Search for specific rule
    cy.get(`[placeholder="Search..."]`).focus().type('USB').trigger('search', { timeout: 5000 });

    // Toggle single search result to checked
    cy.contains('tr', 'USB Device Plugged').within(() => {
      cy.wait(2000);
      cy.get('button').eq(0).click({ force: true });
    });

    // Save changes
    cy.get(`[data-test-subj="save-detector-rules-edits"]`).click({ force: true, timeout: 5000 });

    // Confirm 1 rule has been added to detector
    cy.contains('Detection rules (1)');
  });

  it('...can be deleted', () => {
    // Click on detector to be removed
    cy.contains('test detector_edited').click({ force: true });

    // Confirm page
    cy.contains('Detector details');

    // Click "Actions" button, the click "Delete"
    cy.contains('Actions').click({ force: true });
    cy.contains('Delete').click({ force: true });

    // Confirm detector is deleted
    cy.contains('There are no existing detectors');
  });
});
