/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import sample_detector from '../fixtures/integration_tests/detector/create_usb_detector_data.json';
import { OPENSEARCH_DASHBOARDS_URL } from './constants';
import _ from 'lodash';

export const getElementByText = (locator: string, text: string) =>
  locator
    ? cy.get(locator).filter(`:contains("${text}")`).should('be.visible')
    : cy.contains(text).should('be.visible');

export const getButtonByText = (text: string) => getElementByText('.euiButton', text);

export const getInputByPlaceholder = (placeholder: string) =>
  cy.get(`input[placeholder="${placeholder}"]`);

export const getComboboxByPlaceholder = (placeholder: string) =>
  getElementByText('.euiComboBoxPlaceholder', placeholder)
    .siblings('.euiComboBox__input')
    .find('input');

export const getInputByLabel = (label: string, type = 'input') =>
  getElementByText('.euiFormRow__labelWrapper', label).siblings().find(type);

export const getTextareaByLabel = (label: string) => getInputByLabel(label, 'textarea');

export const getElementByTestSubject = (subject: string) => cy.get(`[data-test-subj="${subject}"]`);

export const getRadioButtonById = (id: string) => {
  Cypress.log({
    message: `Find radio button by id: ${id}`,
  });
  return cy.get(`input[id="${id}"]`);
};

export const selectComboboxItem = (combo: any, items: string | string[]) => {
  combo
    .focus()
    .click({ force: true })
    .then(() => {
      if (typeof items === 'string') {
        items = [items];
      }
      items.map((item) =>
        cy.get('.euiComboBoxOptionsList__rowWrap').within(() => {
          cy.get('button').contains(item).should('be.visible');
          cy.get('button').contains(item).click();
        })
      );
    });
};

export const clearCombobox = (combo: any) => {
  return combo
    .parents('.euiComboBox__inputWrap')
    .find('.euiBadge')
    .then(($badge) => {
      let numberOfBadges = $badge.length;
      Cypress.log({
        message: `Number of combo badges to clear: ${numberOfBadges}`,
      });
      combo
        .parents('.euiComboBox__inputWrap')
        .find('input')
        .focus()
        .then(() => pressBackspaceKey(numberOfBadges));
    });
};

export const validateDetailsItem = (label: string, value: string) => {
  return getElementByText('.euiFlexItem label', label).parent().siblings().contains(value);
};

export const urlShouldContain = (path: string) => cy.url().should('contain', `#/${path}`);

export const pressEnterKey = () => {
  Cypress.log({
    message: 'Enter key pressed',
  });
  Cypress.automation('remote:debugger:protocol', {
    command: 'Input.dispatchKeyEvent',
    params: {
      type: 'char',
      unmodifiedText: '\r',
      text: '\r',
    },
  });
};

export const pressBackspaceKey = (numberOfPresses: number = 1) => {
  Cypress.log({
    message: 'Backspace key pressed',
  });
  _.times(numberOfPresses, () => {
    Cypress.automation('remote:debugger:protocol', {
      command: 'Input.dispatchKeyEvent',
      params: {
        type: 'rawKeyDown',
        keyCode: 8,
        code: 'Backspace',
        key: 'Backspace',
        windowsVirtualKeyCode: 8,
      },
    });
    cy.wait(10);
    Cypress.automation('remote:debugger:protocol', {
      command: 'Input.dispatchKeyEvent',
      params: {
        type: 'rawKeyUp',
        keyCode: 8,
        code: 'Backspace',
        key: 'Backspace',
        windowsVirtualKeyCode: 8,
      },
    });
  });
};

export const validateTable = (
  container: any, // jqueryElement
  length: number,
  dataMap: { [key: string]: string }
) => {
  Cypress.log({
    message: 'Validate table elements',
  });
  return cy
    .get(container)
    .should('be.visible')
    .find('table tbody')
    .find('tr')
    .then(($tr) => {
      const validateLength = length !== null;
      if (validateLength) {
        cy.get($tr).should('have.length', length);
      }

      cy.get($tr).within(($tr: any) => {
        if (dataMap) {
          for (let logField in dataMap) {
            cy.get($tr).find('td').contains(logField);
            validateLength && cy.get($tr).find('td').contains(dataMap[logField]);
          }
        }
      });
    });
};

export const createDetector = (
  detectorName: string,
  indexName: string,
  indexSettings: any,
  indexMappings: any,
  ruleSettings: any,
  indexDoc: any,
  indexDocsCount: number = 1
) => {
  Cypress.log({
    message: `Create new detector ${detectorName}`,
  });
  const detectorConfigAlertCondition = `${detectorName} alert condition`;
  const detectorConfig = {
    ...sample_detector,
    name: detectorName,
    inputs: [
      {
        detector_input: {
          ...sample_detector.inputs[0].detector_input,
          description: `Description for ${detectorName}`,
          indices: [indexName],
        },
      },
    ],
    triggers: [
      {
        ...sample_detector.triggers[0],
        name: detectorConfigAlertCondition,
      },
    ],
  };

  const cySubject = cy
    .cleanUpTests()
    // Create test index
    .then(() => cy.createIndex(indexName, indexSettings))

    // Create field mappings
    .then(() =>
      cy.createAliasMappings(indexName, detectorConfig.detector_type, indexMappings, true)
    )

    // Create test detector
    .then(() => {
      cy.createRule(ruleSettings)
        .then((response) => {
          detectorConfig.inputs[0].detector_input.custom_rules[0].id = response.body.response._id;
          detectorConfig.triggers[0].ids.push(response.body.response._id);
        })
        .then(() => cy.createDetector(detectorConfig));
    })

    .then(() => {
      // Go to the detectors table page
      cy.visit(`${OPENSEARCH_DASHBOARDS_URL}/detectors`);

      // Filter table to only show the test detector
      cy.get(`input[type="search"]`).type(`${detectorConfig.name}{enter}`);

      // Confirm detector was created
      cy.get('tbody > tr').should(($tr) => {
        expect($tr, 'detector name').to.contain(detectorConfig.name);
      });
    });

  // Ingest documents to the test index
  for (let i = 0; i < indexDocsCount; i++) {
    cy.insertDocumentToIndex(indexName, '', indexDoc);
  }

  cySubject.detector = detectorConfig;
  return cySubject;
};
