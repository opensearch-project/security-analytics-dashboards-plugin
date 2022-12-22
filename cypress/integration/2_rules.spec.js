/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { PLUGIN_NAME } from '../support/constants';

const uniqueId = Cypress._.random(0, 1e6);
const SAMPLE_RULE = {
  name: `Cypress test rule ${uniqueId}`,
  logType: 'windows',
  description: 'This is a rule used to test the rule creation workflow. Not for production use.',
  detection:
    'selection:\n  Provider_Name: Service Control Manager\nEventID: 7045\nServiceName: ZzNetSvc\n{backspace}{backspace}condition: selection',
  detectionLine: [
    'selection:',
    'Provider_Name: Service Control Manager',
    'EventID: 7045',
    'ServiceName: ZzNetSvc',
    'condition: selection',
  ],
  severity: 'critical',
  tags: ['attack.persistence', 'attack.privilege_escalation', 'attack.t1543.003'],
  references: 'https://nohello.com',
  falsePositive: 'unknown',
  author: 'Cypress Test Runner',
  status: 'experimental',
};

const YAML_RULE_LINES = [
  `title: ${SAMPLE_RULE.name}`,
  `description:`,
  `${SAMPLE_RULE.description}`,
  `level: ${SAMPLE_RULE.severity}`,
  `tags:`,
  `- ${SAMPLE_RULE.tags[0]}`,
  `- ${SAMPLE_RULE.tags[1]}`,
  `- ${SAMPLE_RULE.tags[2]}`,
  `references:`,
  `- '${SAMPLE_RULE.references}'`,
  `falsepositives:`,
  `- ${SAMPLE_RULE.falsePositive}`,
  `author: ${SAMPLE_RULE.author}`,
  `status: ${SAMPLE_RULE.status}`,
  `logsource:`,
  `product: ${SAMPLE_RULE.logType}`,
  ...SAMPLE_RULE.detection.replaceAll('  ', '').replaceAll('{backspace}', '').split('\n'),
];

describe('Rules', () => {
  before(() => cy.cleanUpTests());
  beforeEach(() => {
    // Visit Rules page
    cy.visit(`${Cypress.env('opensearch_dashboards')}/app/${PLUGIN_NAME}#/rules`);

    // Check that correct page is showing
    cy.waitForPageLoad('rules', {
      contains: 'Rules',
    });
  });

  it('...can be created', () => {
    // Click "create new rule" button
    cy.get('[data-test-subj="create_rule_button"]').click({
      force: true,
    });

    // Enter the name
    cy.get('[data-test-subj="rule_name_field"]').type(SAMPLE_RULE.name);

    // Enter the log type
    cy.get('[data-test-subj="rule_type_dropdown"]').select(SAMPLE_RULE.logType);

    // Enter the description
    cy.get('[data-test-subj="rule_description_field"]').type(SAMPLE_RULE.description);

    // Enter the detection
    cy.get('[data-test-subj="rule_detection_field"]').type(SAMPLE_RULE.detection);

    // Enter the severity
    cy.get('[data-test-subj="rule_severity_dropdown"]').select(SAMPLE_RULE.severity);

    // Enter the tags
    SAMPLE_RULE.tags.forEach((tag) =>
      cy.get('[data-test-subj="rule_tags_dropdown"]').type(`${tag}{enter}{esc}`)
    );

    // Enter the reference
    cy.get('[data-test-subj="rule_references_field_0"]').type(SAMPLE_RULE.references);

    // Enter the false positive cases
    cy.get('[data-test-subj="rule_false_positive_cases_field_0"]').type(SAMPLE_RULE.falsePositive);

    // Enter the author
    cy.get('[data-test-subj="rule_author_field"]').type(SAMPLE_RULE.author);

    // Enter the log type
    cy.get('[data-test-subj="rule_status_dropdown"]').select(SAMPLE_RULE.status);

    // Switch to YAML editor
    cy.get('[data-test-subj="change-editor-type"] label:nth-child(2)').click({
      force: true,
    });

    YAML_RULE_LINES.forEach((line) => cy.get('[data-test-subj="rule_yaml_editor"]').contains(line));

    cy.intercept({
      url: '/rules',
    }).as('getRules');

    // Click "create" button
    cy.get('[data-test-subj="create_rule_button"]').click({
      force: true,
    });

    cy.waitForPageLoad('rules', {
      contains: 'Rules',
    });

    cy.wait('@getRules');

    // Search for the rule
    cy.triggerSearchField('Search rules', SAMPLE_RULE.name);

    // Click the rule link to open the details flyout
    cy.get(`[data-test-subj="rule_link_${SAMPLE_RULE.name}"]`).click({ force: true });

    // Confirm the flyout contains the expected values
    cy.get(`[data-test-subj="rule_flyout_${SAMPLE_RULE.name}"]`)
      .click({ force: true })
      .within(() => {
        // Validate name
        cy.get('[data-test-subj="rule_flyout_rule_name"]').contains(SAMPLE_RULE.name);

        // Validate log type
        cy.get('[data-test-subj="rule_flyout_rule_log_type"]').contains(SAMPLE_RULE.logType);

        // Validate description
        cy.get('[data-test-subj="rule_flyout_rule_description"]').contains(SAMPLE_RULE.description);

        // Validate author
        cy.get('[data-test-subj="rule_flyout_rule_author"]').contains(SAMPLE_RULE.author);

        // Validate source is "custom"
        cy.get('[data-test-subj="rule_flyout_rule_source"]').contains('Custom');

        // Validate severity
        cy.get('[data-test-subj="rule_flyout_rule_severity"]').contains(SAMPLE_RULE.severity);

        // Validate tags
        SAMPLE_RULE.tags.forEach((tag) =>
          cy.get('[data-test-subj="rule_flyout_rule_tags"]').contains(tag)
        );

        // Validate references
        cy.get('[data-test-subj="rule_flyout_rule_references"]').contains(SAMPLE_RULE.references);

        // Validate false positives
        cy.get('[data-test-subj="rule_flyout_rule_false_positives"]').contains(
          SAMPLE_RULE.falsePositive
        );

        // Validate status
        cy.get('[data-test-subj="rule_flyout_rule_status"]').contains(SAMPLE_RULE.status);

        // Validate detection
        SAMPLE_RULE.detectionLine.forEach((line) =>
          cy.get('[data-test-subj="rule_flyout_rule_detection"]').contains(line)
        );

        cy.get('[data-test-subj="change-editor-type"] label:nth-child(2)').click({
          force: true,
        });

        YAML_RULE_LINES.forEach((line) =>
          cy.get('[data-test-subj="rule_flyout_yaml_rule"]').contains(line)
        );

        // Close the flyout
        cy.get('[data-test-subj="close-rule-details-flyout"]').click({
          force: true,
        });
      });
  });

  it('...can be deleted', () => {
    cy.intercept({
      url: '/rules',
    }).as('deleteRule');

    cy.triggerSearchField('Search rules', SAMPLE_RULE.name);

    // Click the rule link to open the details flyout
    cy.get(`[data-test-subj="rule_link_${SAMPLE_RULE.name}"]`).click({ force: true });

    cy.get('.euiButton')
      .contains('Action')
      .click({ force: true })
      .then(() => {
        // Confirm arrival at detectors page
        cy.get(
          '.euiFlexGroup > :nth-child(3) > .euiButtonEmpty > .euiButtonContent > .euiButtonEmpty__text'
        )
          .click({
            force: true,
          })
          .then(() => {
            cy.get('.euiButton').contains('Delete').click();
          });

        cy.wait('@deleteRule');

        // Search for sample_detector, presumably deleted
        cy.triggerSearchField('Search rules', SAMPLE_RULE.name);
        // Click the rule link to open the details flyout
        cy.get('tbody').contains(SAMPLE_RULE.name).should('not.exist');
      });
  });

  after(() => cy.cleanUpTests());
});
