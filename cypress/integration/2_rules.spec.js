/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { OPENSEARCH_DASHBOARDS_URL } from '../support/constants';

const uniqueId = Cypress._.random(0, 1e6);
const SAMPLE_RULE = {
  name: `Cypress test rule ${uniqueId}`,
  logType: 'windows',
  description: 'This is a rule used to test the rule creation workflow.',
  detectionLine: [
    'condition: Selection_1',
    'Selection_1:',
    'Provider_Name|contains:',
    '- Service Control Manager',
    'EventID|contains:',
    "- '7045'",
    'ServiceName|contains:',
    '- ZzNetSvc',
  ],
  severity: 'critical',
  tags: ['attack.persistence', 'attack.privilege_escalation', 'attack.t1543.003'],
  references: 'https://nohello.com',
  falsePositive: 'unknown',
  author: 'Cypress Test Runner',
  status: 'experimental',
};

const YAML_RULE_LINES = [
  `id:`,
  `logsource:`,
  `product: ${SAMPLE_RULE.logType}`,
  `title: ${SAMPLE_RULE.name}`,
  `description: ${SAMPLE_RULE.description}`,
  `tags:`,
  `- ${SAMPLE_RULE.tags[0]}`,
  `- ${SAMPLE_RULE.tags[1]}`,
  `- ${SAMPLE_RULE.tags[2]}`,
  `falsepositives:`,
  `- ${SAMPLE_RULE.falsePositive}`,
  `level: ${SAMPLE_RULE.severity}`,
  `status: ${SAMPLE_RULE.status}`,
  `references:`,
  `- '${SAMPLE_RULE.references}'`,
  `author: ${SAMPLE_RULE.author}`,
  `detection:`,
  ...SAMPLE_RULE.detectionLine,
];

const checkRulesFlyout = () => {
  // Search for the rule
  cy.get(`input[placeholder="Search rules"]`).ospSearch(SAMPLE_RULE.name);

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

      cy.get('[data-test-subj="rule_flyout_yaml_rule"]')
        .get('[class="euiCodeBlock__line"]')
        .each((lineElement, lineIndex) => {
          if (lineIndex >= YAML_RULE_LINES.length) {
            return;
          }
          let line = lineElement.text().replaceAll('\n', '').trim();
          let expectedLine = YAML_RULE_LINES[lineIndex];

          // The document ID field is generated when the document is added to the index,
          // so this test just checks that the line starts with the ID key.
          if (expectedLine.startsWith('id:')) {
            expectedLine = 'id:';
            expect(line, `Sigma rule line ${lineIndex}`).to.contain(expectedLine);
          } else {
            expect(line, `Sigma rule line ${lineIndex}`).to.equal(expectedLine);
          }
        });

      // Close the flyout
      cy.get('[data-test-subj="close-rule-details-flyout"]').click({
        force: true,
      });
    });
};

const getCreateButton = () => cy.get('[data-test-subj="create_rule_button"]');
const getNameField = () => cy.getFieldByLabel('Rule name');
const getDescriptionField = () => cy.getFieldByLabel('Description - optional');
const getAuthorField = () => cy.getFieldByLabel('Author');
const getLogTypeField = () => cy.getFieldByLabel('Log type');
const getRuleLevelField = () => cy.getFieldByLabel('Rule level (severity)');
const getSelectionPanelByIndex = (index) =>
  cy.get(`[data-test-subj="detection-visual-editor-${index}"]`);
const getSelectionNameField = () => cy.get('[data-test-subj="selection_name"]');
const getMapKeyField = () => cy.get('[data-test-subj="selection_field_key_name"]');
const getMapValueField = () => cy.get('[data-test-subj="selection_field_value"]');
const getMapListField = () => cy.get('[data-test-subj="selection_field_list"]');
const getListRadioField = () => cy.get('[for="selection-map-list-0-0"]');
const getConditionField = () => cy.get('[data-test-subj="rule_detection_field"]');
const getConditionAddButton = () => cy.get('[data-test-subj="condition-add-selection-btn"]');
const getRuleSubmitButton = () => cy.get('[data-test-subj="submit_rule_form_button"]');
const getTagField = () => cy.getFieldByLabel('Tag');

describe('Rules', () => {
  before(() => cy.cleanUpTests());

  describe('...should validate rules form', () => {
    beforeEach(() => {
      cy.intercept('/rules/_search').as('rulesSearch');
      // Visit Rules page
      cy.visit(`${OPENSEARCH_DASHBOARDS_URL}/rules`);
      cy.wait('@rulesSearch').should('have.property', 'state', 'Complete');

      // Check that correct page is showing
      cy.waitForPageLoad('rules', {
        contains: 'Detection rules',
      });

      getCreateButton().click({ force: true });
    });

    xit('...should validate rule name', () => {
      getNameField()
        .parents('.euiFormRow__fieldWrapper')
        .find('.euiFormHelpText')
        .contains(
          'Rule name must contain 5-50 characters. Valid characters are a-z, A-Z, 0-9, hyphens, spaces, and underscores'
        );

      getNameField().should('be.empty');
      getNameField().focus().blur();
      getNameField()
        .parentsUntil('.euiFormRow__fieldWrapper')
        .siblings()
        .contains('Rule name is required');

      getNameField().type('text').focus().blur();

      getNameField()
        .parents('.euiFormRow__fieldWrapper')
        .find('.euiFormErrorText')
        .contains('Invalid rule name.');

      getNameField().type('{selectall}').type('{backspace}').type('tex&').focus().blur();

      getNameField()
        .parents('.euiFormRow__fieldWrapper')
        .find('.euiFormErrorText')
        .contains('Invalid rule name.');

      getNameField()
        .type('{selectall}')
        .type('{backspace}')
        .type('Rule name')
        .focus()
        .blur()
        .parents('.euiFormRow__fieldWrapper')
        .find('.euiFormErrorText')
        .should('not.exist');
    });

    xit('...should validate rule description field', () => {
      const longDescriptionText =
        'This is a long text. This is a long text. This is a long text. This is a long text. This is a long text. This is a long text. This is a long text. This is a long text. This is a long text. This is a long text. This is a long text. This is a long text. This is a long text. This is a long text. This is a long text. This is a long text. This is a long text. This is a long text. This is a long text. This is a long text. This is a long text. This is a long text. This is a long text. This is a long text. This is a long text.';

      getDescriptionField().should('be.empty');

      getDescriptionField().type(longDescriptionText).focus().blur();

      getDescriptionField()
        .parents('.euiFormRow__fieldWrapper')
        .find('.euiFormErrorText')
        .contains(
          'Description should only consist of upper and lowercase letters, numbers 0-9, commas, hyphens, periods, spaces, and underscores. Max limit of 500 characters.'
        );

      getDescriptionField()
        .type('{selectall}')
        .type('{backspace}')
        .type('Detector description...')
        .focus()
        .blur();

      getDescriptionField()
        .type('{selectall}')
        .type('{backspace}')
        .type('Detector name')
        .focus()
        .blur()
        .parents('.euiFormRow__fieldWrapper')
        .find('.euiFormErrorText')
        .should('not.exist');
    });

    xit('...should validate author', () => {
      getAuthorField()
        .parents('.euiFormRow__fieldWrapper')
        .find('.euiFormHelpText')
        .contains('Combine multiple authors separated with a comma');

      getAuthorField().should('be.empty');
      getAuthorField().focus().blur();
      getAuthorField()
        .parentsUntil('.euiFormRow__fieldWrapper')
        .siblings()
        .contains('Author name is required');

      getAuthorField().type('text').focus().blur();

      getAuthorField()
        .parents('.euiFormRow__fieldWrapper')
        .find('.euiFormErrorText')
        .contains('Invalid author.');

      getAuthorField().type('{selectall}').type('{backspace}').type('tex&').focus().blur();

      getAuthorField()
        .parents('.euiFormRow__fieldWrapper')
        .find('.euiFormErrorText')
        .contains('Invalid author.');

      getAuthorField()
        .type('{selectall}')
        .type('{backspace}')
        .type('Rule name')
        .focus()
        .blur()
        .parents('.euiFormRow__fieldWrapper')
        .find('.euiFormErrorText')
        .should('not.exist');
    });

    xit('...should validate log type field', () => {
      getLogTypeField().should('be.empty');
      getLogTypeField().focus().blur();
      getLogTypeField()
        .parentsUntil('.euiFormRow__fieldWrapper')
        .siblings()
        .contains('Log type is required');

      getLogTypeField().selectComboboxItem(SAMPLE_RULE.logType);

      getLogTypeField()
        .focus()
        .blur()
        .parents('.euiFormRow__fieldWrapper')
        .find('.euiFormErrorText')
        .should('not.exist');
    });

    xit('...should validate rule level field', () => {
      getRuleLevelField().should('be.empty');
      getRuleLevelField().focus().blur();
      getRuleLevelField()
        .parentsUntil('.euiFormRow__fieldWrapper')
        .siblings()
        .contains('Rule level is required');

      getRuleLevelField().selectComboboxItem(SAMPLE_RULE.severity);

      getRuleLevelField()
        .focus()
        .blur()
        .parents('.euiFormRow__fieldWrapper')
        .find('.euiFormErrorText')
        .should('not.exist');
    });

    xit('...should validate selection', () => {
      getSelectionPanelByIndex(0).within((selectionPanel) => {
        getSelectionNameField().should('have.value', 'Selection_1');
        getSelectionNameField().type('{selectall}').type('{backspace}');
        getSelectionNameField().focus().blur();
        getSelectionNameField()
          .parentsUntil('.euiFormRow__fieldWrapper')
          .siblings()
          .contains('Selection name is required');

        getSelectionNameField().type('Selection');
        getSelectionNameField()
          .focus()
          .blur()
          .parents('.euiFormRow__fieldWrapper')
          .find('.euiFormErrorText')
          .should('not.exist');
      });
    });

    xit('...should validate selection map key field', () => {
      getSelectionPanelByIndex(0).within((selectionPanel) => {
        getMapKeyField().should('be.empty');
        getMapKeyField().focus().blur();
        getMapKeyField()
          .parentsUntil('.euiFormRow__fieldWrapper')
          .siblings()
          .contains('Key name is required');

        getMapKeyField().type('FieldKey');
        getMapKeyField()
          .focus()
          .blur()
          .parents('.euiFormRow__fieldWrapper')
          .find('.euiFormErrorText')
          .should('not.exist');
      });
    });

    xit('...should validate selection map value field', () => {
      getSelectionPanelByIndex(0).within((selectionPanel) => {
        getMapValueField().should('be.empty');
        getMapValueField().focus().blur();
        getMapValueField()
          .parentsUntil('.euiFormRow__fieldWrapper')
          .siblings()
          .contains('Value is required');

        getMapValueField().type('FieldValue');
        getMapValueField()
          .focus()
          .blur()
          .parents('.euiFormRow__fieldWrapper')
          .find('.euiFormErrorText')
          .should('not.exist');
      });
    });

    xit('...should validate selection map list field', () => {
      getSelectionPanelByIndex(0).within((selectionPanel) => {
        getListRadioField().click({ force: true });
        getMapListField().should('be.empty');
        getMapListField().focus().blur();
        getMapListField().parentsUntil('.euiFormRow').contains('Value is required');

        getMapListField().type('FieldValue');
        getMapListField()
          .focus()
          .blur()
          .parents('.euiFormRow')
          .find('.euiFormErrorText')
          .should('not.exist');
      });
    });

    xit('...should validate condition field', () => {
      getConditionField().scrollIntoView();
      getConditionField().find('.euiFormErrorText').should('not.exist');
      getRuleSubmitButton().click({ force: true });
      getConditionField().parents('.euiFormRow__fieldWrapper').contains('Condition is required');

      getConditionAddButton().click({ force: true });
      getConditionField().find('.euiFormErrorText').should('not.exist');
    });

    xit('...should validate tag field', () => {
      getTagField().should('be.empty');
      getTagField().type('wrong.tag').focus().blur();
      getTagField().parents('.euiFormRow__fieldWrapper').contains("Tags must start with 'attack.'");

      getTagField().type('{selectall}').type('{backspace}').type('attack.tag');
      getTagField()
        .parents('.euiFormRow__fieldWrapper')
        .find('.euiFormErrorText')
        .should('not.exist');
    });

    it('...should validate create button', () => {});
  });

  xdescribe('...should validate rules create', () => {
    beforeEach(() => {
      cy.intercept('/rules/_search').as('rulesSearch');
      // Visit Rules page
      cy.visit(`${OPENSEARCH_DASHBOARDS_URL}/rules`);
      cy.wait('@rulesSearch').should('have.property', 'state', 'Complete');

      // Check that correct page is showing
      cy.waitForPageLoad('rules', {
        contains: 'Detection rules',
      });
    });

    it('...can be created', () => {
      // Click "create new rule" button
      cy.get('[data-test-subj="create_rule_button"]').click({
        force: true,
      });

      // Enter the log type
      cy.get('[data-test-subj="rule_status_dropdown"]').type(SAMPLE_RULE.status);

      // Enter the name
      cy.get('[data-test-subj="rule_name_field"]').type(SAMPLE_RULE.name);

      // Enter the log type
      cy.get('[data-test-subj="rule_type_dropdown"]').type(SAMPLE_RULE.logType);

      // Enter the description
      cy.get('[data-test-subj="rule_description_field"]').type(SAMPLE_RULE.description);

      // Enter the severity
      cy.get('[data-test-subj="rule_severity_dropdown"]').type(SAMPLE_RULE.severity);

      // Enter the tags
      SAMPLE_RULE.tags.forEach((tag, index) => {
        cy.get(`[data-test-subj="rule_tags_field_${index}"]`).type(`${tag}{enter}`);
        index < SAMPLE_RULE.tags.length - 1 &&
          cy.get('.euiButton').contains('Add tag').click({ force: true });
      });

      // Enter the reference
      cy.get('[data-test-subj="rule_references_field_0"]').type(SAMPLE_RULE.references);

      // Enter the false positive cases
      cy.get('[data-test-subj="rule_false_positives_field_0"]').type(
        `${SAMPLE_RULE.falsePositive}{enter}`
      );

      // Enter the author
      cy.get('[data-test-subj="rule_author_field"]').type(`${SAMPLE_RULE.author}{enter}`);

      cy.get('[data-test-subj="detection-visual-editor-0"]').within(() => {
        cy.getFieldByLabel('Name').type('{selectall}{backspace}').type('Selection_1');
        cy.getFieldByLabel('Key').type('Provider_Name');
        cy.getInputByPlaceholder('Value').type('Service Control Manager');

        cy.getButtonByText('Add map').click();
        cy.get('[data-test-subj="Map-1"]').within(() => {
          cy.getFieldByLabel('Key').type('EventID');
          cy.getInputByPlaceholder('Value').type('7045');
        });

        cy.getButtonByText('Add map').click();
        cy.get('[data-test-subj="Map-2"]').within(() => {
          cy.getFieldByLabel('Key').type('ServiceName');
          cy.getInputByPlaceholder('Value').type('ZzNetSvc');
        });
      });
      cy.get('[data-test-subj="rule_detection_field"] textarea').type('Selection_1', {
        force: true,
      });

      cy.get('[aria-label="Add one more condition"]').click({ force: true });

      // Enter the author
      cy.get('[data-test-subj="rule_author_field"]').type(`${SAMPLE_RULE.author}`);

      // Switch to YAML editor
      cy.get('[data-test-subj="change-editor-type"] label:nth-child(2)').click({
        force: true,
      });

      YAML_RULE_LINES.forEach((line) =>
        cy.get('[data-test-subj="rule_yaml_editor"]').contains(line)
      );

      cy.intercept({
        url: '/rules',
      }).as('getRules');

      // Click "create" button
      cy.get('[data-test-subj="submit_rule_form_button"]').click({
        force: true,
      });

      cy.wait('@getRules');

      cy.waitForPageLoad('rules', {
        contains: 'Detection rules',
      });

      checkRulesFlyout();
    });

    it('...can be edited', () => {
      cy.waitForPageLoad('rules', {
        contains: 'Detection rules',
      });

      cy.get(`input[placeholder="Search rules"]`).ospSearch(SAMPLE_RULE.name);
      cy.get(`[data-test-subj="rule_link_${SAMPLE_RULE.name}"]`).click({ force: true });

      cy.get(`[data-test-subj="rule_flyout_${SAMPLE_RULE.name}"]`)
        .find('button')
        .contains('Action')
        .click({ force: true })
        .then(() => {
          // Confirm arrival at detectors page
          cy.get('.euiPopover__panel').find('button').contains('Edit').click();
        });

      const ruleNameSelector = '[data-test-subj="rule_name_field"]';
      cy.get(ruleNameSelector).clear();

      SAMPLE_RULE.name += ' edited';
      cy.get(ruleNameSelector).type(SAMPLE_RULE.name);
      cy.get(ruleNameSelector).should('have.value', SAMPLE_RULE.name);

      // Enter the log type
      const logSelector = '[data-test-subj="rule_type_dropdown"]';
      cy.get(logSelector).within(() => cy.get('.euiFormControlLayoutClearButton').click());
      SAMPLE_RULE.logType = 'dns';
      YAML_RULE_LINES[2] = `product: ${SAMPLE_RULE.logType}`;
      YAML_RULE_LINES[3] = `title: ${SAMPLE_RULE.name}`;
      cy.get(logSelector).type(SAMPLE_RULE.logType).type('{enter}');
      cy.get(logSelector).contains(SAMPLE_RULE.logType, {
        matchCase: false,
      });

      const ruleDescriptionSelector = '[data-test-subj="rule_description_field"]';
      SAMPLE_RULE.description += ' edited';
      YAML_RULE_LINES[4] = `description: ${SAMPLE_RULE.description}`;
      cy.get(ruleDescriptionSelector).clear();
      cy.get(ruleDescriptionSelector).type(SAMPLE_RULE.description);
      cy.get(ruleDescriptionSelector).should('have.value', SAMPLE_RULE.description);

      cy.intercept({
        url: '/rules',
      }).as('getRules');

      // Click "create" button
      cy.get('[data-test-subj="submit_rule_form_button"]').click({
        force: true,
      });

      cy.waitForPageLoad('rules', {
        contains: 'Detection rules',
      });

      cy.wait('@getRules');

      checkRulesFlyout();
    });

    it('...can be deleted', () => {
      cy.intercept({
        url: '/rules',
      }).as('deleteRule');

      cy.intercept('POST', 'rules/_search?prePackaged=true', {
        delay: 5000,
      }).as('getPrePackagedRules');

      cy.intercept('POST', 'rules/_search?prePackaged=false', {
        delay: 5000,
      }).as('getCustomRules');

      cy.wait('@rulesSearch');
      cy.get(`input[placeholder="Search rules"]`).ospSearch(SAMPLE_RULE.name);

      // Click the rule link to open the details flyout
      cy.get(`[data-test-subj="rule_link_${SAMPLE_RULE.name}"]`).click({ force: true });

      cy.get(`[data-test-subj="rule_flyout_${SAMPLE_RULE.name}"]`)
        .find('button')
        .contains('Action')
        .click({ force: true })
        .then(() => {
          // Confirm arrival at detectors page
          cy.get('.euiPopover__panel')
            .find('button')
            .contains('Delete')
            .click()
            .then(() => cy.get('.euiModalFooter > .euiButton').contains('Delete').click());

          cy.wait('@deleteRule');
          cy.wait('@getCustomRules');
          cy.wait('@getPrePackagedRules');

          // Search for sample_detector, presumably deleted
          cy.wait(3000);
          cy.get(`input[placeholder="Search rules"]`).ospSearch(SAMPLE_RULE.name);
          // Click the rule link to open the details flyout
          cy.get('tbody').contains(SAMPLE_RULE.name).should('not.exist');
        });
    });
  });

  after(() => cy.cleanUpTests());
});
