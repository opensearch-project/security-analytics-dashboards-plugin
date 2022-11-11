/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { PLUGIN_NAME, TWENTY_SECONDS_TIMEOUT, TEST_INDEX } from '../support/constants';

describe('Detectors', () => {
  before(() => {
    cy.deleteAllIndices();

    // Create test index
    cy.createIndex('cypress-test-windows', TEST_INDEX);

    cy.contains('test detector').should('not.exist');
  });

  beforeEach(() => {
    // Visit Detectors page
    cy.visit(`${Cypress.env('opensearch_dashboards')}/app/${PLUGIN_NAME}#/detectors`);
    //wait for page to load
    cy.wait(10000);

    // Check that correct page is showing
    cy.contains('Threat detectors');
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

    // Wait for detector rules to load - timeout on click above ineffective
    cy.wait(10000);

    // Click Next button to continue
    cy.get('button').contains('Next').click({ force: true }, { timeout: 2000 });

    // Check that correct page now showing
    cy.contains('Required field mappings');

    // cy.contains('tr', 'event_uid').within(() => {
    //   cy.get(`[data-test-subj="detector-field-mappins-select"]`).select("EventID");
    // });

    cy.contains('EventID').click({ force: true });

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

    // Continue to next page
    cy.contains('Next').click({ force: true });

    // Confirm page is reached
    cy.contains('Review and create');

    // Confirm entries user has made
    cy.contains('Detector details');
    cy.contains('test detector');
    cy.contains('windows');
    cy.contains('cypress-test-windows');
    cy.contains('Alert on test_trigger');

    // Create the detector
    cy.get('button').contains('Create').click({ force: true });

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
    cy.contains('Successfully created detector, "test detector"');
  });

  it('...basic details can be edited', () => {
    // Click on detector name
    cy.contains('test detector').click({ force: true });

    // Confirm on detector details page
    cy.contains('test detector');

    // Click "Edit" button in detector details
    cy.get(`[data-test-subj="edit-detector-basic-details"]`).click({ force: true });

    // Confirm arrival at "Edit detector details" page
    cy.contains('Edit detector details');

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

    // Save changes to detector details
    cy.get(`[data-test-subj="save-basic-details-edits"]`).click(
      { force: true },
      { timeout: 10000 }
    );

    // Verify changes applied
    // Confirm taken to detector details page
    cy.contains('Detector details');
    cy.contains('Edit detector details').should('not.exist');

    // Verify edits are applied
    cy.contains('test detector_edited');
    cy.contains('Every 10 hours');
    cy.contains('Edited description');
    cy.contains('.opensearch-notifications-config');
  });

  it('...rules can be edited', () => {
    // Ensure start on main detectors page
    cy.get('button').contains('Detectors');

    // Confirm number of rules before edit
    cy.contains('1574');

    // Click on detector name
    cy.contains('test detector').click({ force: true }, { timeout: 5000 });

    // Click "Edit" button in Detector rules panel
    cy.get(`[data-test-subj="edit-detector-rules"]`).click({ force: true });

    // Confirm arrival on "Edit detector rules" page
    cy.contains('Edit detector rules');

    // Search for specific rule
    cy.get(`[placeholder="Search..."]`).focus().type('abusing findstr for def').trigger('search');

    // Confirm search result
    cy.contains('Abusing Findstr for Defense Evasion');

    // Toggle single search result to unchecked
    cy.contains('tr', 'Abusing Findstr for').within(() => {
      cy.get(`button[aria-checked="true"]`).click({ force: true });
    });

    // Save changes
    cy.get(`[data-test-subj="save-detector-rules-edits"]`).click({ force: true });

    // Confirm 1 rule has been removed from detector
    cy.contains('1574').should('not.exist');
    cy.contains('1573');

    // Click "Edit" button in Detector rules panel
    cy.get(`[data-test-subj="edit-detector-rules"]`).click({ force: true });

    // Confirm arrival on "Edit detector rules" page
    cy.contains('Edit detector rules');

    cy.wait(10000);

    // Search for specific rule
    cy.get(`[placeholder="Search..."]`).focus().type('abusing findstr for def').trigger('search');

    // Confirm search result
    cy.contains('Abusing Findstr for Defense Evasion');

    // Toggle single search result to checked
    cy.get(`button[aria-checked="false"]`).click({ force: true });

    // Save changes
    cy.get(`[data-test-subj="save-detector-rules-edits"]`).click(
      { force: true },
      { timeout: 5000 }
    );

    // Navigate to main detectors page
    cy.get('button').contains('Detectors').click({ force: true }, { timeout: 10000 });

    // Confirm 1 rule has been added to detector
    cy.contains('1573').should('not.exist');
    cy.contains('1574');
  });

  it('...can be deleted', () => {
    // Click on detector to be removed
    cy.contains('test detector_edited').click({ force: true });

    // Confirm page
    cy.contains('Detector details');

    // Click "Actions" button, the click "Delete"
    cy.contains('Actions').click({ force: true });
    cy.contains('Delete').click({ force: true });
  });
});
