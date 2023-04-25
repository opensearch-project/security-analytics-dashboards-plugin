/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { OPENSEARCH_DASHBOARDS_URL } from '../support/constants';
import sample_windows_index_settings from '../fixtures/sample_windows_index_settings.json';
import sample_dns_index_settings from '../fixtures/sample_dns_index_settings.json';
import dns_name_rule_data from '../fixtures/integration_tests/rule/create_dns_rule_with_name_selection.json';
import dns_type_rule_data from '../fixtures/integration_tests/rule/create_dns_rule_with_type_selection.json';
import dns_mapping_fields from '../fixtures/integration_tests/rule/sample_dns_field_mappings.json';
import {
  getInputByLabel,
  getElementByTestSubject,
  getElementByText,
  getInputByPlaceholder,
  getRadioButtonById,
  selectComboboxItem,
  validateDetailsItem,
  urlShouldContain,
  pressEnterKey,
  validateTable,
  clearCombobox,
  getButtonByText,
  getTextareaByLabel,
} from '../support/helpers';
import _ from 'lodash';

const cypressIndexDns = 'cypress-index-dns';
const cypressIndexWindows = 'cypress-index-windows';
const detectorName = 'test detector';

const cypressDNSRule = dns_name_rule_data.title;

const getNameField = () => getInputByPlaceholder('Enter a name for the detector.');

const getNextButton = () => getButtonByText('Next');

const getCreateDetectorButton = () => getButtonByText('Create detector');

const selectDnsLogType = () => getRadioButtonById('dns').click({ force: true });

const validateAlertPanel = (alertName) =>
  getElementByText('.euiTitle', 'Alert triggers')
    .parentsUntil('.euiPanel')
    .siblings()
    .eq(2)
    .within(() => getElementByText('button', alertName));

const dataSourceLabel = 'Select or input source indexes or index patterns';

const getDataSourceField = () => getInputByLabel(dataSourceLabel);

const openDetectorDetails = (detectorName) => {
  getInputByPlaceholder('Search threat detectors')
    .type(`${detectorName}`)
    .then(() => pressEnterKey());
  getElementByText('.euiTableCellContent button', detectorName).click();
};

const editDetectorDetails = (detectorName, panelTitle) => {
  urlShouldContain('detector-details').then(() => {
    getElementByText('.euiTitle', detectorName);
    getElementByText('.euiPanel .euiTitle', panelTitle);
    getElementByText('.euiPanel .euiTitle', panelTitle)
      .parent()
      .siblings()
      .within(() => cy.get('button').contains('Edit').click());
  });
};

const validateAutomaticFieldMappingsPanel = (length, mappings) =>
  cy.get('.editFieldMappings').within(() => {
    cy.get('.euiAccordion__triggerWrapper button').then(($btn) => {
      cy.get($btn).contains(`Automatically mapped fields (${length})`);

      // first check if the accordion is expanded, if not than expand the accordion
      if ($btn[0].getAttribute('aria-expanded') === 'false') {
        cy.get($btn[0])
          .click()
          .then(() => {
            cy.get('.euiAccordion__childWrapper .euiBasicTable').then(($table) => {
              validateTable($table, length, mappings);
            });
          });
      }
    });
  });

const validatePendingFieldMappingsPanel = (mappings) => {
  cy.get('.editFieldMappings').within(() => {
    // Pending field mappings
    getElementByText('.euiTitle', 'Pending field mappings')
      .parents('.euiPanel')
      .within(() => {
        cy.get('.euiBasicTable').then(($table) => {
          validateTable($table, null, mappings);
        });
      });
  });
};

const createDetector = (detectorName, dataSource, expectFailure) => {
  getCreateDetectorButton().click({ force: true });

  // TEST DETAILS PAGE
  getNameField().type(detectorName);
  selectComboboxItem(getDataSourceField(), dataSource);

  selectDnsLogType();

  getElementByText('.euiAccordion .euiTitle', 'Detection rules (14 selected)')
    .click({ force: true, timeout: 5000 })
    .then(() => cy.contains('.euiTable .euiTableRow', 'Dns'));

  getElementByText('.euiAccordion .euiTitle', 'Configure field mapping - optional');
  cy.get('[aria-controls="mappedTitleFieldsAccordion"]').then(($btn) => {
    // first check if the accordion is expanded, if not than expand the accordion
    if ($btn && $btn[0] && $btn[0].getAttribute('aria-expanded') === 'false') {
      $btn[0].click();
    }
  });

  // go to the alerts page
  getNextButton().click({ force: true });

  // TEST ALERTS PAGE
  getElementByText('.euiTitle.euiTitle--medium', 'Set up alert triggers');
  getInputByPlaceholder('Enter a name to describe the alert condition').type('test_trigger');
  getElementByTestSubject('alert-tags-combo-box')
    .type(`attack.defense_evasion{enter}`)
    .find('input')
    .focus()
    .blur();

  selectComboboxItem(getInputByLabel('Specify alert severity'), '1 (Highest)');

  // go to review page
  getNextButton().click({ force: true });

  // TEST REVIEW AND CREATE PAGE
  getElementByText('.euiTitle', 'Review and create');
  getElementByText('.euiTitle', 'Detector details');
  getElementByText('.euiTitle', 'Field mapping');
  getElementByText('.euiTitle', 'Alert triggers');

  validateDetailsItem('Detector name', detectorName);
  validateDetailsItem('Description', '-');
  validateDetailsItem('Detector schedule', 'Every 1 minute');
  validateDetailsItem('Detection rules', '14');
  validateDetailsItem('Created at', '-');
  validateDetailsItem('Last updated time', '-');
  validateDetailsItem('Detector dashboard', 'Not available for this log type');

  if (!expectFailure) {
    getElementByText('.euiTitle', 'Field mapping')
      .parentsUntil('.euiPanel')
      .siblings()
      .eq(2)
      .then(($el) => validateTable($el, 3, dns_mapping_fields));
  }

  validateAlertPanel('test_trigger');

  cy.intercept('POST', '/mappings').as('createMappingsRequest');
  cy.intercept('POST', '/detectors').as('createDetectorRequest');

  // create the detector
  getElementByText('button', 'Create').click({ force: true });

  // TEST DETECTOR DETAILS PAGE
  cy.wait('@createMappingsRequest');

  if (!expectFailure) {
    cy.wait('@createDetectorRequest').then((interceptor) => {
      const detectorId = interceptor.response.body.response._id;

      cy.url()
        .should('contain', detectorId)
        .then(() => {
          getElementByText('.euiCallOut', `Detector created successfully: ${detectorName}`);

          // Confirm detector state
          getElementByText('.euiTitle', detectorName);
          getElementByText('.euiHealth', 'Active').then(() => {
            validateDetailsItem('Detector name', detectorName);
            validateDetailsItem('Description', '-');
            validateDetailsItem('Detector schedule', 'Every 1 minute');
            validateDetailsItem('Detection rules', '14');
            validateDetailsItem('Detector dashboard', 'Not available for this log type');

            cy.wait(5000); // waiting for the page to be reloaded after pushing detector id into route
            getElementByText('button.euiTab', 'Alert triggers').should('be.visible').click();
            validateAlertPanel('test_trigger');

            cy.intercept('GET', '/mappings?indexName').as('getMappingFields');
            getElementByText('button.euiTab', 'Field mappings').should('be.visible').click();
            if (!expectFailure) {
              cy.wait('@getMappingFields');
              cy.wait(2000);
              getElementByText('.euiTitle', 'Field mapping')
                .parentsUntil('.euiPanel')
                .siblings()
                .eq(2)
                .then(($el) => validateTable($el, 3, dns_mapping_fields));
            }
          });
        });
    });
  }
};

describe('Detectors', () => {
  before(() => {
    cy.cleanUpTests();

    cy.createIndex(cypressIndexWindows, sample_windows_index_settings);

    // Create test index
    cy.createIndex(cypressIndexDns, sample_dns_index_settings).then(() =>
      cy
        .request('POST', '_plugins/_security_analytics/rules/_search?prePackaged=true', {
          from: 0,
          size: 5000,
          query: {
            nested: {
              path: 'rule',
              query: { bool: { must: [{ match: { 'rule.category': 'dns' } }] } },
            },
          },
        })
        .should('have.property', 'status', 200)
    );

    cy.createRule(dns_name_rule_data);
    cy.createRule(dns_type_rule_data);
  });

  beforeEach(() => {
    cy.intercept('/detectors/_search').as('detectorsSearch');

    // Visit Detectors page
    cy.visit(`${OPENSEARCH_DASHBOARDS_URL}/detectors`);
    cy.wait('@detectorsSearch').should('have.property', 'state', 'Complete');
  });

  it('...should validate form', () => {
    getCreateDetectorButton().click({ force: true });

    getNextButton().should('be.disabled');

    getNameField().should('be.empty');
    getNameField().type('text').focus().blur();

    getNameField()
      .parentsUntil('.euiFormRow__fieldWrapper')
      .siblings()
      .contains(
        'Name should only consist of upper and lowercase letters, numbers 0-9, hyphens, spaces, and underscores. Use between 5 and 50 characters.'
      );

    getNameField()
      .type(' and more text')
      .focus()
      .blur()
      .parentsUntil('.euiFormRow__fieldWrapper')
      .siblings()
      .should('not.exist');
    getNextButton().should('be.disabled');

    getDataSourceField()
      .focus()
      .blur()
      .parentsUntil('.euiFormRow__fieldWrapper')
      .siblings()
      .contains('Select an input source');
    getNextButton().should('be.disabled');

    selectComboboxItem(getDataSourceField(), cypressIndexDns);
    getDataSourceField()
      .focus()
      .blur()
      .parentsUntil('.euiFormRow__fieldWrapper')
      .find('.euiFormErrorText')
      .should('not.exist');
    getNextButton().should('not.be.disabled');
  });

  it('...should show mappings warning', () => {
    getCreateDetectorButton().click({ force: true });

    selectComboboxItem(getDataSourceField(), cypressIndexDns);

    selectDnsLogType();

    selectComboboxItem(getDataSourceField(), cypressIndexWindows);
    getDataSourceField().focus().blur();

    cy.get('.euiCallOut')
      .should('be.visible')
      .contains(
        'To avoid issues with field mappings, we recommend creating separate detectors for different log types.'
      );
  });

  it('...can fail creation', () => {
    createDetector(`${detectorName}_fail`, '.kibana_1', true);
    getElementByText('.euiCallOut', 'Create detector failed.');
  });

  it('...can be created', () => {
    createDetector(detectorName, cypressIndexDns, false);
    getElementByText('.euiCallOut', 'Detector created successfully');
  });

  it('...basic details can be edited', () => {
    cy.intercept('GET', '/indices').as('getIndices');
    openDetectorDetails(detectorName);

    editDetectorDetails(detectorName, 'Detector details');

    urlShouldContain('edit-detector-details').then(() => {
      getElementByText('.euiTitle', 'Edit detector details');
    });

    cy.wait('@getIndices');
    getNameField().type('{selectall}{backspace}').type('test detector edited');
    getTextareaByLabel('Description - optional').type('Edited description');

    clearCombobox(getDataSourceField());
    selectComboboxItem(getDataSourceField(), cypressIndexWindows);

    getInputByLabel('Run every').type('{selectall}{backspace}').type('10');
    getInputByLabel('Run every', 'select').select('Hours');

    getElementByText('button', 'Save changes').click({ force: true });

    urlShouldContain('detector-details').then(() => {
      validateDetailsItem('Detector name', 'test detector edited');
      validateDetailsItem('Description', 'Edited description');
      validateDetailsItem('Detector schedule', 'Every 10 hours');
      validateDetailsItem('Data source', cypressIndexWindows);
    });
  });

  it('...rules can be edited', () => {
    openDetectorDetails(detectorName);

    editDetectorDetails(detectorName, 'Active rules');
    getElementByText('.euiTitle', 'Detection rules (14)');

    getInputByPlaceholder('Search...')
      .type(`${cypressDNSRule}`)
      .then(() => pressEnterKey());

    getElementByText('.euiTableCellContent button', cypressDNSRule)
      .parents('td')
      .prev()
      .find('.euiTableCellContent button')
      .click();

    getElementByText('.euiTitle', 'Detection rules (13)');
    getElementByText('button', 'Save changes').click({ force: true });
    urlShouldContain('detector-details').then(() => {
      getElementByText('.euiTitle', detectorName);
      getElementByText('.euiPanel .euiTitle', 'Active rules (13)');
    });
  });

  it('...should update field mappings if data source is changed', () => {
    cy.intercept('mappings/view').as('getMappingsView');
    cy.intercept('GET', '/indices').as('getIndices');
    openDetectorDetails(detectorName);

    editDetectorDetails(detectorName, 'Detector details');

    urlShouldContain('edit-detector-details').then(() => {
      getElementByText('.euiTitle', 'Edit detector details');
    });

    cy.wait('@getIndices');
    cy.get('.reviewFieldMappings').should('not.exist');

    clearCombobox(getDataSourceField());
    getDataSourceField().should('not.have.value');
    getDataSourceField().type(`${cypressIndexDns}{enter}`);

    cy.wait('@getMappingsView').then((interception) => {
      cy.get('.reviewFieldMappings').should('be.visible');
      const properties = interception.response.body.response.properties;
      if (_.isEmpty(properties)) {
        validatePendingFieldMappingsPanel(dns_mapping_fields);
      } else {
        validateAutomaticFieldMappingsPanel(3, dns_mapping_fields);
      }
    });

    getElementByText('button', 'Save changes').click({ force: true });
  });

  it('...should show field mappings if rule selection is changed', () => {
    cy.intercept('mappings/view').as('getMappingsView');

    openDetectorDetails(detectorName);

    editDetectorDetails(detectorName, 'Active rules');

    urlShouldContain('edit-detector-rules').then(() => {
      getElementByText('.euiTitle', 'Edit detector rules');
    });

    cy.get('.reviewFieldMappings').should('not.exist');

    cy.wait('@detectorsSearch');

    // Toggle single search result to unchecked
    cy.get(
      '[data-test-subj="edit-detector-rules-table"] table thead tr:first th:first button'
    ).click({ force: true });

    cy.wait('@getMappingsView').then((interception) => {
      cy.get('.reviewFieldMappings').should('be.visible');
      const properties = interception.response.body.response.properties;
      if (_.isEmpty(properties)) {
        validatePendingFieldMappingsPanel(dns_mapping_fields);
      } else {
        validateAutomaticFieldMappingsPanel(3, dns_mapping_fields);
      }
    });
  });

  it('...can be deleted', () => {
    cy.intercept('/_plugins/_security_analytics/rules/_search?prePackaged=true').as(
      'getSigmaRules'
    );
    cy.intercept('/_plugins/_security_analytics/rules/_search?prePackaged=false').as(
      'getCustomRules'
    );
    openDetectorDetails(detectorName);

    cy.wait('@detectorsSearch');
    cy.wait('@getCustomRules');
    cy.wait('@getSigmaRules');

    getButtonByText('Actions')
      .click({ force: true })
      .then(() => {
        cy.intercept('/detectors').as('detectors');
        getElementByText('.euiContextMenuItem', 'Delete').click({ force: true });
        cy.wait('@detectors').then(() => {
          cy.contains('There are no existing detectors');
        });
      });
  });

  after(() => cy.cleanUpTests());
});
