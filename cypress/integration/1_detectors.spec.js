/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { OPENSEARCH_DASHBOARDS_URL } from '../support/constants';
import sample_index_settings from '../fixtures/sample_index_settings.json';

const testMappings = {
  properties: {
    'host-hostname': {
      type: 'alias',
      path: 'HostName',
    },
    'windows-message': {
      type: 'alias',
      path: 'Message',
    },
    'winlog-provider_name': {
      type: 'alias',
      path: 'Provider_Name',
    },
    'winlog-event_data-ServiceName': {
      type: 'alias',
      path: 'ServiceName',
    },
    'winlog-event_id': {
      path: 'EventID',
      type: 'alias',
    },
  },
};

describe('Detectors', () => {
  const indexName = 'cypress-test-windows';
  const detectorName = 'test detector';

  before(() => {
    cy.cleanUpTests();
    // Create test index
    cy.createIndex(indexName, sample_index_settings);
    cy.request('POST', '_plugins/_security_analytics/rules/_search?prePackaged=true', {
      from: 0,
      size: 5000,
      query: {
        nested: {
          path: 'rule',
          query: { bool: { must: [{ match: { 'rule.category': 'windows' } }] } },
        },
      },
    });

    cy.contains(detectorName).should('not.exist');
  });

  beforeEach(() => {
    // Visit Detectors page
    cy.visit(`${OPENSEARCH_DASHBOARDS_URL}/detectors`);

    // Check that correct page is showing
    cy.waitForPageLoad('detectors', {
      contains: 'Threat detectors',
    });
  });

  it('...can be created', () => {
    // Locate Create detector button click to start
    cy.get('.euiButton').filter(':contains("Create detector")').click({ force: true });

    // Check to ensure process started
    cy.waitForPageLoad('create-detector', {
      contains: 'Define detector',
    });

    // Enter a name for the detector in the appropriate input
    cy.get(`input[placeholder="Enter a name for the detector."]`).focus().realType('test detector');

    // Select our pre-seeded data source (check indexName)
    cy.get(`[data-test-subj="define-detector-select-data-source"]`)
      .find('input')
      .focus()
      .realType(indexName);

    cy.intercept({
      pathname: '/_plugins/_security_analytics/rules/_search',
      query: {
        prePackaged: 'true',
      },
    }).as('getSigmaRules');

    // Select threat detector type (Windows logs)
    cy.get(`input[id="windows"]`).click({ force: true });

    cy.wait('@getSigmaRules').then(() => {
      // Open Detection rules accordion
      cy.get('[data-test-subj="detection-rules-btn"]').click({ force: true, timeout: 5000 });

      cy.contains('table tr', 'Windows', {
        timeout: 120000,
      });

      // find search, type USB
      cy.get(`input[placeholder="Search..."]`).ospSearch('USB Device Plugged');

      // Disable all rules
      cy.contains('tr', 'USB Device Plugged', { timeout: 1000 });
      cy.get('table th').within(() => {
        cy.get('button').first().click({ force: true });
      });

      // Enable single rule
      cy.contains('table tr', 'USB Device Plugged').within(() => {
        cy.get('button').eq(1).click({ force: true });
      });
    });

    // Click Next button to continue
    cy.get('button').contains('Next').click({ force: true });

    // Check that correct page now showing
    cy.contains('Configure field mapping');

    // Show 50 rows per page
    cy.contains('Rows per page').click({ force: true });
    cy.contains('50 rows').click({ force: true });

    // Show 50 rows per page
    cy.contains('Rows per page').click({ force: true });
    cy.contains('50 rows').click({ force: true });

    // Select appropriate names to map fields to
    for (let field_name in testMappings.properties) {
      const mappedTo = testMappings.properties[field_name].path;

      cy.contains('tr', field_name).within(() => {
        cy.get(`[data-test-subj="detector-field-mappings-select"]`).click().type(mappedTo);
      });
    }

    // Continue to next page
    cy.get('button').contains('Next').click({ force: true, timeout: 2000 });

    // Check that correct page now showing
    cy.contains('Set up alerts');

    // Type name of new trigger
    cy.get(`input[placeholder="Enter a name for the alert condition."]`)
      .focus()
      .realType('test_trigger');

    // Type in (or select) tags for the alert condition
    cy.get(`[data-test-subj="alert-tags-combo-box"]`)
      .find('input')
      .focus()
      .realType('attack.defense_evasion')
      .realPress('Enter');

    // Select applicable severity levels
    cy.get(`[data-test-subj="security-levels-combo-box"]`).click({ force: true });
    cy.contains('1 (Highest)').click({ force: true });

    // Continue to next page
    cy.contains('Next').click({ force: true });

    // Confirm page is reached
    cy.contains('Review and create');

    // Confirm field mappings registered
    cy.contains('Field mapping');

    // Show 50 rows per page
    cy.contains('Rows per page').click({ force: true });
    cy.contains('50 rows').click({ force: true });

    for (let field in testMappings.properties) {
      const mappedTo = testMappings.properties[field].path;

      cy.contains(field);
      cy.contains(mappedTo);
    }

    // Confirm entries user has made
    cy.contains('Detector details');
    cy.contains(detectorName);
    cy.contains('windows');
    cy.contains(indexName);
    cy.contains('Alert on test_trigger');

    // Create the detector
    cy.get('button').contains('Create').click({ force: true });
    cy.waitForPageLoad('detector-details', {
      contains: detectorName,
    });

    // Confirm detector active
    cy.contains(detectorName);
    cy.contains('Active');
    cy.contains('View Alerts');
    cy.contains('View Findings');
    cy.contains('Actions');
    cy.contains('Detector configuration');
    cy.contains('Field mappings');
    cy.contains('Alert triggers');
    cy.contains('Detector details');
    cy.contains('Created at');
    cy.contains('Last updated time');
  });

  it('...basic details can be edited', () => {
    // Click on detector name
    cy.contains(detectorName).click({ force: true });
    cy.waitForPageLoad('detector-details', {
      contains: detectorName,
    });

    // Click "Edit" button in detector details
    cy.get(`[data-test-subj="edit-detector-basic-details"]`).click({ force: true });

    // Confirm arrival at "Edit detector details" page
    cy.waitForPageLoad('edit-detector-details', {
      contains: 'Edit detector details',
    });

    // Change detector name
    cy.get(`input[placeholder="Enter a name for the detector."]`)
      .realClick()
      .ospClear()
      .realType('test detector edited');

    // Change detector description
    cy.get(`[data-test-subj="define-detector-detector-description"]`)
      .focus()
      .realType('Edited description');

    // Change input source
    cy.get(`[data-test-subj="define-detector-select-data-source"]`)
      .find('input')
      .ospClear()
      .focus()
      .realType('.opensearch-notifications-config')
      .realPress('Enter');

    // Change detector scheduling
    cy.get(`[data-test-subj="detector-schedule-number-select"]`).ospClear().focus().realType('10');
    cy.get(`[data-test-subj="detector-schedule-unit-select"]`).select('Hours');

    // Save changes to detector details
    cy.get(`[data-test-subj="save-basic-details-edits"]`).click({ force: true });

    // Confirm taken to detector details page
    cy.waitForPageLoad('detector-details', {
      contains: detectorName,
    });

    // Verify edits are applied
    cy.contains('test detector edited');
    cy.contains('Every 10 hours');
    cy.contains('Edited description');
    cy.contains('.opensearch-notifications-config');
  });

  it('...rules can be edited', () => {
    // Ensure start on main detectors page
    cy.waitForPageLoad('detectors', {
      contains: 'Threat detectors',
    });

    // Click on detector name
    cy.contains(detectorName).click({ force: true });
    cy.waitForPageLoad('detector-details', {
      contains: detectorName,
    });

    // Confirm number of rules before edit
    cy.contains('Active rules (1)');

    // Click "Edit" button in Detector rules panel
    cy.get(`[data-test-subj="edit-detector-rules"]`).click({ force: true });

    // Confirm arrival on "Edit detector rules" page
    cy.waitForPageLoad('edit-detector-rules', {
      contains: 'Edit detector rules',
    });

    // Search for specific rule
    cy.get(`input[placeholder="Search..."]`).ospSearch('USB Device');

    // Toggle single search result to unchecked
    cy.contains('table tr', 'USB Device Plugged').within(() => {
      // Of note, timeout can sometimes work instead of wait here, but is very unreliable from case to case.
      cy.wait(1000);
      cy.get('button').eq(1).click();
    });

    // Save changes
    cy.get(`[data-test-subj="save-detector-rules-edits"]`).click({ force: true });

    // Confirm 1 rule has been removed from detector
    cy.contains('Active rules (0)');

    // Click "Edit" button in Detector rules panel
    cy.get(`[data-test-subj="edit-detector-rules"]`).click({ force: true });

    // Confirm arrival on "Edit detector rules" page
    cy.waitForPageLoad('edit-detector-rules', {
      contains: 'Edit detector rules',
    });

    // Search for specific rule
    cy.get(`input[placeholder="Search..."]`).ospSearch('USB');

    // Toggle single search result to checked
    cy.contains('table tr', 'USB Device Plugged').within(() => {
      cy.wait(2000);
      cy.get('button').eq(1).click({ force: true });
    });

    // Save changes
    cy.get(`[data-test-subj="save-detector-rules-edits"]`).click({ force: true });
    cy.waitForPageLoad('detector-details', {
      contains: detectorName,
    });

    // Confirm 1 rule has been added to detector
    cy.contains('Active rules (1)');
  });

  it('...can be deleted', () => {
    // Click on detector to be removed
    cy.contains('test detector edited').click({ force: true });

    // Confirm page
    cy.waitForPageLoad('detector-details', {
      contains: 'Detector details',
    });

    // Click "Actions" button, the click "Delete"
    cy.get('button').contains('Actions').click({ force: true });
    cy.get('button').contains('Delete').click({ force: true });

    // Confirm detector is deleted
    cy.contains('There are no existing detectors');
  });

  after(() => cy.cleanUpTests());
});
