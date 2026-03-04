/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { OPENSEARCH_DASHBOARDS_URL } from '../support/constants';
import sample_windows_index_settings from '../fixtures/sample_windows_index_settings.json';
import sample_dns_index_settings from '../fixtures/sample_dns_index_settings.json';
import dns_name_rule_data from '../fixtures/integration_tests/rule/create_dns_rule_with_name_selection.json';
import dns_type_rule_data from '../fixtures/integration_tests/rule/create_dns_rule_with_type_selection.json';
import _ from 'lodash';
import { getMappingFields } from '../../public/pages/Detectors/utils/helpers';
import { getLogTypeLabel } from '../../public/pages/LogTypes/utils/helpers';
import { setupIntercept } from '../support/helpers';
import { descriptionError } from '../../public/utils/validation';

const cypressIndexDns = 'cypress-index-dns';
const cypressIndexWindows = 'cypress-index-windows';
const detectorName = 'test detector';
const cypressLogTypeDns = 'dns';
const creationFailedMessage = 'Create detector failed.';

const cypressDNSRule = dns_name_rule_data.title;

const getNameField = () => cy.getInputByPlaceholder('Enter a name for the detector.');

const getNextButton = () => cy.getButtonByText('Next');

const getCreateDetectorButton = () => cy.getButtonByText('Create detector');

const validateAlertPanel = (alertName) =>
  cy
    .getElementByText('.euiText', 'Alert triggers')
    .parentsUntil('.euiPanel')
    .siblings()
    .eq(2)
    .within(() => cy.getElementByText('button', alertName));

const dataSourceLabel = 'Select indexes/aliases';

const getDataSourceField = () => cy.getFieldByLabel(dataSourceLabel);

const logTypeLabel = 'Log type';

const getLogTypeField = () => cy.getFieldByLabel(logTypeLabel);

const openDetectorDetails = (detectorName) => {
  cy.getInputByPlaceholder('Search threat detectors').type(`${detectorName}`).pressEnterKey();
  cy.getElementByText('.euiTableCellContent button', detectorName).click();
};

const validateFieldMappingsTable = (message = '') => {
  cy.wait('@getMappingsView').then((interception) => {
    cy.wait(10000).then(() => {
      cy.get('.reviewFieldMappings').should('be.visible');
      const properties = interception.response.body.response.properties;
      const unmapped_field_aliases = interception.response.body.response.unmapped_field_aliases
        .map((field) => [field])
        .sort()
        .slice(0, 10);

      Cypress.log({
        message: `Validate table data - ${message}`,
      });
      if (_.isEmpty(properties)) {
        validatePendingFieldMappingsPanel(unmapped_field_aliases);
      } else {
        let items = getMappingFields(properties, [], '');
        items = items.map((item) => [item.ruleFieldName, item.logFieldName]);
        validateAutomaticFieldMappingsPanel(items);
      }
    });
  });
};

const editDetectorDetails = (detectorName, panelTitle) => {
  cy.urlShouldContain('detector-details').then(() => {
    cy.getElementByText('.euiText', detectorName);
    cy.getElementByText('.euiPanel .euiText', panelTitle);
    cy.getElementByText('.euiPanel .euiText', panelTitle)
      .parent()
      .siblings()
      .within(() => cy.get('button').contains('Edit').click());
  });
};

const validateAutomaticFieldMappingsPanel = (mappings) =>
  cy.get('.editFieldMappings').within(() => {
    cy.get('.euiAccordion__triggerWrapper button').then(($btn) => {
      cy.get($btn).contains(`Automatically mapped fields (${mappings.length})`);

      // first check if the accordion is expanded, if not than expand the accordion
      if ($btn[0].getAttribute('aria-expanded') === 'false') {
        cy.get($btn[0])
          .click()
          .then(() => {
            cy.getElementByTestSubject('auto-mapped-fields-table')
              .find('.euiBasicTable')
              .validateTable(mappings);
          });
      }
    });
  });

const validatePendingFieldMappingsPanel = (mappings) => {
  cy.get('.editFieldMappings').each(($element) => {
    cy.wrap($element).within(() => {
      // Pending field mappings
      cy.getElementByText('.euiText', 'Pending field mappings')
        .parents('.euiPanel')
        .first()
        .within(() => {
          cy.getElementByTestSubject('pending-mapped-fields-table')
            .find('.euiBasicTable')
            .validateTable(mappings);
        });
    });
  });
};

const fillDetailsForm = (detectorName, dataSource, isCustomDataSource = false) => {
  getNameField().type(detectorName, { force: true });
  if (isCustomDataSource) {
    getDataSourceField()
      .focus()
      .type(dataSource + '{enter}');
  } else {
    getDataSourceField().selectComboboxItem(dataSource);
  }
  getDataSourceField().focus().blur();
  getLogTypeField().selectComboboxItem(getLogTypeLabel(cypressLogTypeDns));
  getLogTypeField().focus().blur();
};

const createDetector = (detectorName, dataSource, expectFailure) => {
  getCreateDetectorButton().click({ force: true });

  fillDetailsForm(detectorName, dataSource, expectFailure);

  cy.getElementByText('.euiAccordion .euiTitle', 'Selected rules (14)') // Wazuh: rename 'Detection rules' to 'Rules'
    .click({ force: true, timeout: 5000 })
    .then(() => cy.contains('.euiTable .euiTableRow', getLogTypeLabel(cypressLogTypeDns)));

  cy.getElementByText('.euiAccordion .euiTitle', 'Field mapping - optional');
  cy.get('[aria-controls="mappedTitleFieldsAccordion"]').then(($btn) => {
    // first check if the accordion is expanded, if not than expand the accordion
    if ($btn && $btn[0] && $btn[0].getAttribute('aria-expanded') === 'false') {
      $btn[0].click();
    }
  });

  // go to the alerts page
  getNextButton().click({ force: true });

  // TEST ALERTS PAGE
  // Open the trigger details accordion
  cy.get('[data-test-subj="trigger-details-btn"]').click({ force: true });
  cy.getElementByText('.euiTitle.euiTitle--medium', 'Set up alert triggers');
  cy.getElementByTestSubject('alert-tags-combo-box')
    .type(`attack.defense_evasion{enter}`)
    .find('input')
    .focus()
    .blur();

  setupIntercept(cy, '/_plugins/_security_analytics/mappings', 'createMappingsRequest');
  setupIntercept(cy, '/_plugins/_security_analytics/detectors', 'createDetectorRequest');

  // create the detector
  cy.getElementByText('button', 'Create').click({ force: true });

  // TEST DETECTOR DETAILS PAGE
  cy.wait('@createMappingsRequest');

  if (!expectFailure) {
    cy.wait('@createDetectorRequest').then((interceptor) => {
      const detectorId = interceptor.response.body.response._id;

      cy.url()
        .should('contain', detectorId)
        .then(() => {
          // Confirm detector state
          cy.getElementByText('.euiText', detectorName);
          cy.getElementByText('.euiHealth', 'Active').then(() => {
            cy.validateDetailsItem('Detector name', detectorName);
            cy.validateDetailsItem('Description', '-');
            cy.validateDetailsItem('Detector schedule', 'Every 1 minute');
            cy.validateDetailsItem('Rules', '14'); // Wazuh: rename 'Detection rules' to 'Rules'
            cy.validateDetailsItem('Detector dashboard', 'Not available for this log type');

            cy.wait(5000); // waiting for the page to be reloaded after pushing detector id into route
            cy.getElementByText('button.euiTab', 'Alert triggers').should('be.visible').click();
            validateAlertPanel('Trigger 1');
          });
        });
    });
  }
};

const openCreateForm = () => getCreateDetectorButton().click({ force: true });

const getDescriptionField = () => cy.getTextareaByLabel('Description - optional');
const getTriggerNameField = () => cy.getFieldByLabel('Trigger name');

describe('Detectors', () => {
  before(() => {
    cy.cleanUpTests();

    cy.createIndex(cypressIndexWindows, sample_windows_index_settings);

    // Create test index
    cy.createIndex(cypressIndexDns, sample_dns_index_settings).then(() =>
      cy
        .request(
          'POST',
          `${Cypress.env(
            'opensearch_url'
          )}/_plugins/_security_analytics/rules/_search?pre_packaged=true`,
          {
            from: 0,
            size: 5000,
            query: {
              nested: {
                path: 'rule',
                query: { bool: { must: [{ match: { 'rule.category': 'dns' } }] } },
              },
            },
          }
        )
        .should('have.property', 'status', 200)
    );

    cy.createRule(dns_name_rule_data);
    cy.createRule(dns_type_rule_data);
  });

  describe('...should validate form fields', () => {
    beforeEach(() => {
      setupIntercept(cy, '/_plugins/_security_analytics/detectors/_search', 'detectorsSearch');

      // Visit Detectors page before any test
      cy.visit(`${OPENSEARCH_DASHBOARDS_URL}/detectors`);
      cy.wait('@detectorsSearch').should('have.property', 'state', 'Complete');

      openCreateForm();
    });

    it('...should validate name field', () => {
      getNameField().should('be.empty');
      getNameField().focus().blur();
      getNameField().parentsUntil('.euiFormRow__fieldWrapper').siblings().contains('Enter a name.');

      getNameField().type('text').focus().blur();

      getNameField()
        .parents('.euiFormRow__fieldWrapper')
        .find('.euiFormErrorText')
        .contains(
          'Name should only consist of upper and lowercase letters, numbers 0-9, hyphens, spaces, and underscores. Use between 5 and 50 characters.'
        );

      getNameField().type('{selectall}').type('{backspace}').type('tex&').focus().blur();

      getNameField()
        .parents('.euiFormRow__fieldWrapper')
        .find('.euiFormErrorText')
        .contains(
          'Name should only consist of upper and lowercase letters, numbers 0-9, hyphens, spaces, and underscores. Use between 5 and 50 characters.'
        );

      getNameField()
        .type('{selectall}')
        .type('{backspace}')
        .type('Detector name')
        .focus()
        .blur()
        .parents('.euiFormRow__fieldWrapper')
        .find('.euiFormErrorText')
        .should('not.exist');
    });

    it('...should validate description field', () => {
      const longDescriptionText =
        'This is a long text. This is a long text. This is a long text. This is a long text. This is a long text. This is a long text. This is a long text. This is a long text. This is a long text. This is a long text. This is a long text. This is a long text. This is a long text. This is a long text. This is a long text. This is a long text. This is a long text. This is a long text. This is a long text. This is a long text. This is a long text. This is a long text. This is a long text. This is a long text. This is a long text.';

      getDescriptionField().should('be.empty');

      getDescriptionField().type(longDescriptionText).focus().blur();

      getDescriptionField()
        .parents('.euiFormRow__fieldWrapper')
        .find('.euiFormErrorText')
        .contains(descriptionError);

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

    it('...should validate data source field', () => {
      getDataSourceField()
        .focus()
        .blur()
        .parentsUntil('.euiFormRow__fieldWrapper')
        .siblings()
        .contains('Select an input source for the detector.');

      getDataSourceField().selectComboboxItem(cypressIndexDns);
      getDataSourceField()
        .focus()
        .blur()
        .parentsUntil('.euiFormRow__fieldWrapper')
        .find('.euiFormErrorText')
        .should('not.exist');
    });

    it('...should validate next button', () => {
      getNextButton().should('be.disabled');

      fillDetailsForm(detectorName, cypressIndexDns);
      getNextButton().should('be.enabled');
    });

    it('...should validate alerts page', () => {
      fillDetailsForm(detectorName, cypressIndexDns);
      getNextButton().click({ force: true });
      // Open the trigger details accordion
      cy.get('[data-test-subj="trigger-details-btn"]').click({ force: true });
      getTriggerNameField().should('have.value', 'Trigger 1');
      getTriggerNameField()
        .parents('.euiFormRow__fieldWrapper')
        .find('.euiFormErrorText')
        .should('not.exist');

      getTriggerNameField().type('{selectall}').type('{backspace}').focus().blur();
      getCreateDetectorButton().should('be.disabled');

      cy.getButtonByText('Remove').click({ force: true });
      getCreateDetectorButton().should('be.enabled');
    });

    it('...should show mappings warning', () => {
      fillDetailsForm(detectorName, cypressIndexDns);

      getDataSourceField().selectComboboxItem(cypressIndexWindows);
      getDataSourceField().focus().blur();

      cy.get('[data-test-subj="define-detector-diff-log-types-warning"]')
        .should('be.visible')
        .contains(
          'To avoid issues with field mappings, we recommend creating separate detectors for different log types.'
        );
    });
  });

  describe('...validate create detector flow', () => {
    beforeEach(() => {
      setupIntercept(cy, '/_plugins/_security_analytics/detectors/_search', 'detectorsSearch');

      // Visit Detectors page before any test
      cy.visit(`${OPENSEARCH_DASHBOARDS_URL}/detectors`);
      cy.wait('@detectorsSearch').should('have.property', 'state', 'Complete');
    });

    it('...can fail creation', () => {
      createDetector(`${detectorName}_fail`, '.kibana_1', true);
      cy.getElementByText('.euiCallOut', creationFailedMessage);
    });

    it('...can be created', () => {
      createDetector(detectorName, cypressIndexDns, false);
      cy.contains(creationFailedMessage).should('not.exist');
    });

    it('...basic details can be edited', () => {
      setupIntercept(cy, '/_plugins/_security_analytics/indices', 'getIndices', 'GET');
      openDetectorDetails(detectorName);

      editDetectorDetails(detectorName, 'Detector details');

      cy.urlShouldContain('edit-detector-details').then(() => {
        cy.getElementByText('.euiTitle', 'Edit detector details');
      });

      cy.wait('@getIndices');
      getNameField().type('{selectall}{backspace}').type('test detector edited');
      cy.getTextareaByLabel('Description - optional').type('Edited description');

      getDataSourceField().clearCombobox();
      getDataSourceField().selectComboboxItem(cypressIndexWindows);

      cy.getFieldByLabel('Run every').type('{selectall}{backspace}').type('10');
      cy.getFieldByLabel('Run every', 'select').select('Hours');

      cy.getElementByText('button', 'Save changes').click({ force: true });

      cy.urlShouldContain('detector-details').then(() => {
        cy.validateDetailsItem('Detector name', 'test detector edited');
        cy.validateDetailsItem('Description', 'Edited description');
        cy.validateDetailsItem('Detector schedule', 'Every 10 hours');
        cy.validateDetailsItem('Data source', cypressIndexWindows);
      });
    });

    it('...rules can be edited', () => {
      openDetectorDetails(detectorName);

      editDetectorDetails(detectorName, 'Active rules');
      cy.getElementByText('.euiText', 'Rules (14)'); // Wazuh: rename 'Detection rules' to 'Rules'

      cy.getInputByPlaceholder('Search...').type(`${cypressDNSRule}`).pressEnterKey();

      cy.getElementByText('.euiTableCellContent button', cypressDNSRule)
        .parents('td')
        .prev()
        .find('.euiTableCellContent button')
        .click();

      cy.getElementByText('.euiText', 'Rules (13)'); // Wazuh: rename 'Detection rules' to 'Rules'
      cy.getElementByText('button', 'Save changes').click({ force: true });
      cy.urlShouldContain('detector-details').then(() => {
        cy.getElementByText('.euiText', detectorName);
        cy.getElementByText('.euiPanel .euiText', 'Active rules (13)');
      });
    });

    it('...should update field mappings if data source is changed', () => {
      setupIntercept(cy, 'mappings/view', 'getMappingsView', 'GET');
      setupIntercept(cy, '/indices', 'getIndices', 'GET');
      openDetectorDetails(detectorName);

      editDetectorDetails(detectorName, 'Detector details');

      cy.urlShouldContain('edit-detector-details').then(() => {
        cy.getElementByText('.euiTitle', 'Edit detector details');
      });

      cy.wait('@getIndices');
      cy.get('.reviewFieldMappings').should('not.exist');

      getDataSourceField().clearCombobox();
      getDataSourceField().should('not.have.value');
      getDataSourceField().type(`${cypressIndexDns}{enter}`);

      validateFieldMappingsTable('data source is changed');

      cy.getElementByText('button', 'Save changes').click({ force: true });
    });

    it('...should show field mappings if rule selection is changed', () => {
      setupIntercept(cy, 'mappings/view', 'getMappingsView', 'GET');

      openDetectorDetails(detectorName);

      editDetectorDetails(detectorName, 'Active rules');

      cy.urlShouldContain('edit-detector-rules').then(() => {
        cy.getElementByText('.euiTitle', 'Edit detector rules');
      });

      cy.get('.reviewFieldMappings').should('not.exist');

      cy.wait('@detectorsSearch');

      // Toggle single search result to unchecked
      cy.get(
        '[data-test-subj="edit-detector-rules-table"] table thead tr:first th:first button'
      ).click({ force: true });

      validateFieldMappingsTable('rules are changed');
    });

    it('...can be stopped and started back from detectors list action menu', () => {
      cy.wait(1000);
      cy.get('tbody > tr')
        .first()
        .within(() => {
          cy.get('[class="euiCheckbox__input"]').click({ force: true });
        });

      // Waiting for Actions menu button to be enabled
      cy.wait(1000);

      setupIntercept(cy, '/_plugins/_security_analytics/detectors/_search', 'detectorsSearch');

      cy.get('[data-test-subj="detectorsActionsButton').click({ force: true });
      cy.get('[data-test-subj="toggleDetectorButton').contains('Stop');
      cy.get('[data-test-subj="toggleDetectorButton').click({ force: true });

      cy.wait('@detectorsSearch').should('have.property', 'state', 'Complete');

      // Need this extra wait time for the Actions button to become enabled again
      cy.wait(2000);

      setupIntercept(cy, '/_plugins/_security_analytics/detectors/_search', 'detectorsSearch');
      cy.get('[data-test-subj="detectorsActionsButton').click({ force: true });
      cy.get('[data-test-subj="toggleDetectorButton').contains('Start');
      cy.get('[data-test-subj="toggleDetectorButton').click({ force: true });

      cy.wait('@detectorsSearch').should('have.property', 'state', 'Complete');

      // Need this extra wait time for the Actions button to become enabled again
      cy.wait(2000);

      cy.get('[data-test-subj="detectorsActionsButton').click({ force: true });
      cy.get('[data-test-subj="toggleDetectorButton').contains('Stop');
    });

    it('...can be deleted', () => {
      setupIntercept(cy, '/rules/_search', 'getRules');

      openDetectorDetails(detectorName);

      cy.wait('@detectorsSearch');
      cy.wait('@getRules');

      cy.getButtonByText('Actions')
        .click({ force: true })
        .then(() => {
          setupIntercept(cy, '/detectors', 'detectors');
          cy.getElementByText('.euiContextMenuItem', 'Delete').click({ force: true });
          cy.wait('@detectors').then(() => {
            cy.contains('There are no existing detectors');
          });
        });
    });
  });

  after(() => {
    cy.cleanUpTests();
  });
});
