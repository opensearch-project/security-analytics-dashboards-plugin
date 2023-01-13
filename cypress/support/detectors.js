/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

const { NODE_API } = require('./constants');

Cypress.Commands.add('createDetector', (detectorJSON) => {
  cy.request('POST', `${Cypress.env('opensearch')}${NODE_API.DETECTORS_BASE}`, detectorJSON);
});

Cypress.Commands.add(
  'createAliasMappings',
  (indexName, ruleTopic, aliasMappingsBody, partial = true) => {
    const body = {
      index_name: indexName,
      rule_topic: ruleTopic,
      partial: partial,
      alias_mappings: aliasMappingsBody,
    };
    cy.request({
      method: 'POST',
      url: `${Cypress.env('opensearch')}${NODE_API.MAPPINGS_BASE}`,
      body: body,
    });
  }
);

Cypress.Commands.add('updateDetector', (detectorId, detectorJSON) => {
  cy.request(
    'PUT',
    `${Cypress.env('opensearch')}/${NODE_API.DETECTORS_BASE}/${detectorId}`,
    detectorJSON
  );
});

Cypress.Commands.add('deleteDetector', (detectorName) => {
  const body = {
    from: 0,
    size: 5000,
    query: {
      nested: {
        path: 'detector',
        query: {
          bool: {
            must: [{ match: { 'detector.name': detectorName } }],
          },
        },
      },
    },
  };
  cy.request({
    method: 'POST',
    url: `${Cypress.env('opensearch')}${NODE_API.DETECTORS_BASE}/_search`,
    failOnStatusCode: false,
    body,
  }).then((response) => {
    if (response.status === 200) {
      for (let hit of response.body.hits.hits) {
        cy.request('DELETE', `${Cypress.env('opensearch')}${NODE_API.DETECTORS_BASE}/${hit._id}`);
      }
    }
  });
});

Cypress.Commands.add('deleteAllDetectors', () => {
  cy.request({
    method: 'DELETE',
    url: `${Cypress.env('opensearch')}/.opensearch-sap-detectors-config`,
    failOnStatusCode: false,
  });
});
