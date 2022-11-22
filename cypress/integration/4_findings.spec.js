/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { PLUGIN_NAME } from '../support/constants';
import sample_document from '../fixtures/sample_document.json';
import { createDetector } from '../support/helpers.js';
import { eq } from 'lodash';

describe('Findings', () => {
  const ruleTags = ['low', 'windows', 'attack.initial_access', 'attack.t1200'];

  before(() => {
    createDetector();
  });

  it('displays findings based on recently ingested data', () => {
    // Visit Findings page
    cy.visit(`${Cypress.env('opensearch_dashboards')}/app/${PLUGIN_NAME}#/findings`);

    // need to wait here specifically to ensure findings are generated.  Timeout above does not work as no findings are generated.
    cy.wait(10000);

    // Confirm arrival at Findings page
    cy.url().should(
      'eq',
      'http://localhost:5601/app/opensearch_security_analytics_dashboards#/findings'
    );

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
      cy.get($el).click({ force: true, timeout: 5000 });
    });
  });

  it('allows user to view details about rules that were triggered', () => {
    // Open rule details for each rule
    // open Finding details flyout
    cy.get('button', { timeout: 5000 });
    cy.get('.euiLink--primary').last().click({ force: true });

    cy.wait(5000);

    // Second rule details - open
    cy.get('button', { timeout: 5000 });
    cy.get('.euiAccordion__button')
      .contains('Setting Change in Windows Firewall with Advanced Security')
      .click({ force: true });

    // Confirm content
    cy.contains('Setting have been change in Windows Firewall');
    cy.contains('Low');
    cy.contains('Windows');
    cy.contains('cypress-test-windows');

    ruleTags.forEach((tag) => {
      cy.contains(tag);
    });

    // Close Flyout
    cy.get(`[data-test-subj="close-finding-details-flyout"]`).then(($el) => {
      cy.get($el).click({ force: true, timeout: 5000 });
    });

    cy.get('button', { timeout: 1000 });
    cy.get(`[class="euiAccordion__button"]`).contains('USB Device Plugged').click({ force: true });

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

    // Click rule link
    cy.get('a')
      .contains('Setting Change in Windows Firewall with Advanced Security')
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

    // Click on detector to be removed
    cy.contains('test detector').click({ force: true }, { timeout: 2000 });

    // Click "Actions" button, the click "Delete"
    cy.get('button').contains('Actions').click({ force: true });
    cy.contains('Delete').click({ force: true });

    // Confirm detector deleted
    cy.contains('There are no existing detectors.');
  });
});
