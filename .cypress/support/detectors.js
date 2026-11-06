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
  // Since security-analytics 3.9 the detectors config index is registered as a
  // system index, so with the security plugin enabled a direct index DELETE
  // returns 403 even for the admin user. Delete detectors through the plugin
  // API first so no detectors leak into later specs, then best-effort delete
  // the index itself for environments where that is still permitted.
  cy.request({
    method: 'POST',
    url: `${Cypress.env('opensearch')}${NODE_API.DETECTORS_BASE}/_search`,
    failOnStatusCode: false,
    body: { from: 0, size: 5000, query: { match_all: {} } },
  }).then((response) => {
    if (response.status === 200) {
      for (let hit of response.body.hits.hits) {
        cy.request({
          method: 'DELETE',
          url: `${Cypress.env('opensearch')}${NODE_API.DETECTORS_BASE}/${hit._id}`,
          failOnStatusCode: false,
        }).then((deleteResponse) => {
          expect(deleteResponse.status).to.be.oneOf([
            200, // Detector deleted
            404, // Detector already gone
          ]);
        });
      }
    }
  });

  cy.request({
    method: 'DELETE',
    url: `${Cypress.env('opensearch')}/.opensearch-sap-detectors-config`,
    failOnStatusCode: false,
  }).as('deleteAllDetectors');
  cy.get('@deleteAllDetectors').should((response) => {
    expect(response.status).to.be.oneOf([
      200, // Config index has been successfully deleted
      403, // System index protection denies index deletion when security is enabled
      404, // Config index has already been cleaned up
    ]);
  });
});
