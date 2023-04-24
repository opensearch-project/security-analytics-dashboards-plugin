/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { DETECTOR_TRIGGER_TIMEOUT, OPENSEARCH_DASHBOARDS_URL } from '../support/constants';
import indexSettings from '../fixtures/sample_windows_index_settings.json';
import aliasMappings from '../fixtures/sample_alias_mappings.json';
import indexDoc from '../fixtures/sample_document.json';
import ruleSettings from '../fixtures/integration_tests/rule/create_windows_usb_rule.json';
import { createDetector } from '../support/helpers';

const indexName = 'test-index';
const detectorName = 'test-detector';
const ruleName = 'Cypress USB Rule';

let testDetector;
describe('Findings', () => {
  const ruleTags = ['high', 'windows'];

  before(() => {
    const subject = createDetector(
      detectorName,
      indexName,
      indexSettings,
      aliasMappings,
      ruleSettings,
      indexDoc,
      4
    );
    testDetector = subject.detector;

    // Wait for the detector to execute
    cy.wait(DETECTOR_TRIGGER_TIMEOUT);
  });

  beforeEach(() => {
    // Visit Alerts table page
    cy.visit(`${OPENSEARCH_DASHBOARDS_URL}/findings`);

    // Wait for page to load
    cy.waitForPageLoad('findings', {
      contains: 'Findings',
    });
  });

  it('displays findings based on recently ingested data', () => {
    // Click refresh
    cy.get('button').contains('Refresh').click({ force: true });

    // Check for non-empty findings list
    cy.contains('No items found').should('not.exist');

    // Check for expected findings
    cy.contains('Windows');
    cy.contains('High');
  });

  it('displays finding details flyout when user clicks on View details icon', () => {
    // filter table to show only sample_detector findings
    cy.get(`input[placeholder="Search findings"]`).ospSearch(indexName);

    // Click View details icon
    cy.getTableFirstRow('[data-test-subj="view-details-icon"]').then(($el) => {
      cy.get($el).click({ force: true });
    });

    // Confirm flyout contents
    cy.contains('Finding details');
    cy.contains('Rule details');

    // Close Flyout
    cy.get('.euiFlexItem--flexGrowZero > .euiButtonIcon').click({ force: true });
  });

  it('displays finding details flyout when user clicks on Finding ID', () => {
    // filter table to show only sample_detector findings
    cy.get(`input[placeholder="Search findings"]`).ospSearch(indexName);

    // Click findingId to trigger Finding details flyout
    cy.getTableFirstRow('[data-test-subj="finding-details-flyout-button"]').then(($el) => {
      cy.get($el).click({ force: true });
    });

    // Confirm flyout contents
    cy.contains('Finding details');
    cy.contains('Rule details');

    // Close Flyout
    cy.get('.euiFlexItem--flexGrowZero > .euiButtonIcon').click({ force: true });
  });

  // TODO: this one triggers a button handler which goes throw condition and therefor is flaky
  // find a better way to test this dialog, condition is based on `indexPatternId`
  xit('displays finding details and create an index pattern from flyout', () => {
    // filter table to show only sample_detector findings
    cy.get(`input[placeholder="Search findings"]`).ospSearch(indexName);

    // Click findingId to trigger Finding details flyout
    cy.getTableFirstRow('[data-test-subj="finding-details-flyout-button"]').then(($el) => {
      cy.get($el).click({ force: true });
    });

    cy.get('[data-test-subj="finding-details-flyout-view-surrounding-documents"]')
      .contains('View surrounding documents')
      .click({ force: true });

    cy.contains('Create index pattern to view documents');

    cy.get(
      `[data-test-subj="index_pattern_time_field_dropdown"] [data-test-subj="comboBoxSearchInput"]`
    ).type('EventTime');

    cy.get('[data-test-subj="index_pattern_form_submit_button"]')
      .contains('Create index pattern')
      .click({ force: true });

    cy.contains('cypress-test-windows* has been successfully created');

    // Close Flyout
    cy.get('.euiFlexItem--flexGrowZero > .euiButtonIcon').click({ force: true });
  });

  it('allows user to view details about rules that were triggered', () => {
    // filter table to show only sample_detector findings
    cy.get(`input[placeholder="Search findings"]`).ospSearch(indexName);

    // open Finding details flyout via finding id link. cy.wait essential, timeout insufficient.
    cy.get(`[data-test-subj="view-details-icon"]`).eq(0).click({ force: true });

    // open rule details inside flyout
    cy.get('button', { timeout: 1000 });
    cy.get(`[data-test-subj="finding-details-flyout-rule-accordion-0"]`).click({ force: true });

    // Confirm content
    cy.contains('Documents');
    cy.contains('USB plugged-in rule');
    cy.contains('High');
    cy.contains('Windows');

    ruleTags.forEach((tag) => {
      cy.contains(tag);
    });
  });

  // TODO - upon reaching rules page, trigger appropriate rules detail flyout
  // see github issue #124 at https://github.com/opensearch-project/security-analytics-dashboards-plugin/issues/124

  it('opens rule details flyout when rule name inside accordion drop down is clicked', () => {
    // filter table to show only sample_detector findings
    cy.get(`input[placeholder="Search findings"]`).ospSearch(indexName);

    // open Finding details flyout via finding id link. cy.wait essential, timeout insufficient.
    cy.getTableFirstRow('[data-test-subj="view-details-icon"]').then(($el) => {
      cy.get($el).click({ force: true });
    });

    // Click rule link
    cy.get(`[data-test-subj="finding-details-flyout-${ruleName}-details"]`).click({
      force: true,
    });

    // Validate flyout appearance
    cy.get(`[data-test-subj="rule_flyout_${ruleName}"]`).within(() => {
      cy.get('[data-test-subj="rule_flyout_rule_name"]').contains(ruleName);
    });
  });

  after(() => cy.cleanUpTests());
});
