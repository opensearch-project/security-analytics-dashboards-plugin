/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { PLUGIN_NAME } from '../support/constants';
import sample_document from '../fixtures/sample_document.json';
import sample_index_settings from '../fixtures/sample_index_settings.json';
import sample_field_mappings from '../fixtures/sample_field_mappings.json';
import sample_detector from '../fixtures/sample_detector.json';

describe('Findings', () => {
  const ruleTags = ['low', 'windows'];

  before(() => {
    cy.deleteAllIndices();

    // create test index, mappings, and detector
    cy.createIndex('cypress-test-windows', sample_index_settings);
    cy.createAliasMappings('cypress-test-windows', 'windows', sample_field_mappings, false);
    cy.createDetector(sample_detector);
  });

  it('displays findings based on recently ingested data', () => {
    // Visit Findings page
    cy.visit(`${Cypress.env('opensearch_dashboards')}/app/${PLUGIN_NAME}#/findings`);

    // need to wait here specifically to ensure findings are generated
    cy.wait(10000);

    // Confirm arrival at Findings page
    cy.url().should('include', 'opensearch_security_analytics_dashboards#/findings');

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
    // icon can't be found behind error toast.  Once error handling fixed we can remove this.
    cy.wait(5000);

    // Click findingId to trigger Finding details flyout
    cy.get(`[data-test-subj="findings-table-finding-id"]`).click();

    // Confirm flyout contents
    cy.contains('Finding details');
    cy.contains('Rule details');
    cy.contains('Search Findings').should('not.exist');

    // Close Flyout
    cy.get(`[data-test-subj="close-finding-details-flyout"]`).then(($el) => {
      cy.get($el).click({ force: true });
    });

    // wait for toasts to clear - in this case, timeout will not work.  Icon cannot be found behind error toasts.
    cy.wait(10000);

    // Click View details icon
    cy.get(`[data-test-subj="view-details-icon"]`).click({ force: true });

    // Confirm flyout contents
    cy.contains('Finding details');
    cy.contains('Rule details');
    cy.contains('Search Findings').should('not.exist');

    // Close Flyout
    cy.get(`[data-test-subj="close-finding-details-flyout"]`).then(($el) => {
      cy.get($el).click({ force: true });
    });
  });

  it('allows user to view details about rules that were triggered', () => {
    // open Finding details flyout via finding id link
    cy.wait(5000);
    cy.get(`[data-test-subj="view-details-icon"]`).click({ force: true });

    // // need to wait for error toasts to dissipate, neither icon nor finding id are clickable without this
    // cy.wait(5000);

    // // open Finding details flyout via icon button
    // cy.get(`[data-test-subj="view-details-icon"]`).click({ force: true });

    cy.get('button', { timeout: 1000 });
    cy.get('.euiAccordion__button').contains('USB Device Plugged').click({ force: true });

    // Confirm content
    cy.contains('Documents');
    cy.contains('Detects plugged USB devices');
    cy.contains('Low');
    cy.contains('Windows');
    cy.contains('cypress-test-windows');

    ruleTags.forEach((tag) => {
      cy.contains(tag);
    });
  });

  // TODO - upon reaching rules page, trigger appropriate rules detail flyout
  it('takes user to rules page when rule name inside accordion drop down is clicked', () => {
    // Click rule link
    cy.get('a')
      .contains('USB Device Plugged')
      .invoke('removeAttr', 'target')
      .click({ force: true });

    // Confirm destination reached
    cy.url().should(
      'eq',
      'http://localhost:5601/app/opensearch_security_analytics_dashboards#/rules'
    );
  });

  after(() => {
    // Visit Detectors page
    cy.visit(`${Cypress.env('opensearch_dashboards')}/app/${PLUGIN_NAME}#/detectors`, {
      timeout: 5000,
    });

    cy.url().should('include', 'opensearch_security_analytics_dashboards#/detectors');

    // Click on detector to be removed
    cy.contains('test detector').click({ force: true }, { timeout: 2000 });

    // Click "Actions" button, the click "Delete"
    cy.get('button').contains('Actions').click({ force: true });
    cy.contains('Delete').click({ force: true });

    // Confirm detector deleted
    cy.contains('There are no existing detectors.');
  });
});
