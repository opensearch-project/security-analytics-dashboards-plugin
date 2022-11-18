/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { PLUGIN_NAME } from '../support/constants';
import sample_document from '../fixtures/sample_document.json';
import { createDetector } from '../support/helpers.js';

describe('Findings', () => {
  before(() => {
    createDetector();
  });

  it('displays findings based on recently ingested data', () => {
    // Visit Findings page
    cy.visit(`${Cypress.env('opensearch_dashboards')}/app/${PLUGIN_NAME}#/findings`);

    // need to wait here specifically to ensure findings are generated.  Timeout above does not work as no findings are generated.
    cy.wait(10000);

    // Confirm arrival at Findings page
    cy.contains('Last 15 minutes');
    cy.contains('Show dates');

    // Ingest a new document
    cy.ingestDocument('cypress-test-windows', sample_document);

    // wait for detector interval to pass
    cy.wait(60000);

    // Click refresh
    cy.get('button').contains('Refresh').click({ force: true });

    // Check for non-empty findings list
    cy.contains('No items found').should('not.exist');

    // Check for expected findings
    cy.contains('test detector');
    cy.contains('Windows');
    cy.contains('Low');
  });

  it('displays finding details flyout when user clicks on Finding ID or View details icon', () => {
    // Click findingId to trigger Finding details flyout
    cy.get(`[data-test-subj="findings-table-finding-id"]`).click();

    // Confirm flyout contents
    cy.contains('Finding details');
    cy.contains('Rule details');
    cy.contains('Search Findings').should('not.exist');

    // Close Flyout
    cy.get(`button[data-test-subj="close-finding-details-flyout"]`).click();

    // wait for toasts to clear - in this case, timeout will not work.  Icon cannot be found behind error toasts.
    cy.wait(10000);

    // Click View details icon
    cy.get(`[data-test-subj="view-details-icon"]`).click({ force: true });

    // Confirm flyout contents
    cy.contains('Finding details');
    cy.contains('Rule details');
    cy.contains('Search Findings').should('not.exist');

    // Open rule details for each rule
    cy.contains('USB Device Plugged').click({ force: true });

    // Confirm content
    cy.contains('Documents');
    cy.contains('Detects plugged USB devices');
    cy.contains('Low');
    cy.contains('Windows');
    cy.contains('cypress-test-windows');
  });

  it('allows user to view more rule details upon clicking rule name', () => {
    // Click rule link
    cy.get('a')
      .contains('USB Device Plugged')
      .invoke('removeAttr', 'target')
      .click({ force: true });

    // Confirm destination reached
    cy.contains('Rules');
    cy.contains('Import rule');
    cy.contains('Create new rule');

    // navigate back to Finding details flyout
    cy.contains('Findings').click();
    cy.get(`[data-test-subj="findings-table-finding-id"]`).click();

    // Second rule details - open
    cy.contains('Setting Change in Windows Firewall with Advanced Security').click({ force: true });
    cy.contains('Setting have been change in Windows Firewall');

    // Confirm content
    cy.contains('Low');
    cy.contains('Windows');
    cy.contains('cypress-test-windows');

    // Click rule link
    cy.get('a')
      .contains('Setting Change in Windows Firewall with Advanced Security')
      .invoke('removeAttr', 'target')
      .click({ force: true });

    // Confirm destination reached
    cy.contains('Rules');
    cy.contains('Import rule');
    cy.contains('Create new rule');
  });

  after(() => {
    // Visit Detectors page
    cy.visit(`${Cypress.env('opensearch_dashboards')}/app/${PLUGIN_NAME}#/detectors`, {
      timeout: 5000,
    });

    // Click on detector to be removed
    cy.contains('test detector').click({ force: true }, { timeout: 2000 });

    // Click "Actions" button, the click "Delete"
    cy.get('button').contains('Actions').click({ force: true });
    cy.contains('Delete').click({ force: true });

    // Confirm detector deleted
    cy.contains('There are no existing detectors.');
  });
});
