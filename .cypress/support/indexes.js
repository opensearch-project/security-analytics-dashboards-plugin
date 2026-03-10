/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

const { NODE_API } = require('./constants');

Cypress.Commands.add('createIndex', (index, settings = {}) => {
  cy.request('PUT', `${Cypress.env('opensearch')}/${index}`, settings).should(
    'have.property',
    'status',
    200
  );
});

Cypress.Commands.add('createIndexTemplate', (name, template) => {
  cy.request(
    'PUT',
    `${Cypress.env('opensearch')}${NODE_API.INDEX_TEMPLATE_BASE}/${name}`,
    template
  );
});

Cypress.Commands.add('ingestDocument', (indexId, documentJSON) => {
  cy.request('POST', `${Cypress.env('opensearch')}/${indexId}/_doc`, documentJSON);
});

Cypress.Commands.add('insertDocumentToIndex', (indexName, documentId, documentBody) => {
  cy.request({
    method: 'POST',
    url: `${Cypress.env('opensearch')}/${indexName}/_doc/${documentId}`,
    body: documentBody,
  });
});

Cypress.Commands.add('deleteIndex', (indexName, options = {}) => {
  cy.request({
    method: 'DELETE',
    url: `${Cypress.env('opensearch')}/${indexName}`,
    failOnStatusCode: false,
    ...options,
  });
});

Cypress.Commands.add('deleteAllIndices', () => {
  cy.request({
    method: 'DELETE',
    url: `${Cypress.env('opensearch')}/index*,sample*,opensearch_dashboards*,test*,cypress*`,
    failOnStatusCode: false,
  }).as('deleteAllIndices');
  cy.get('@deleteAllIndices').should((response) => {
    // Both statuses are a pass, 200 means deleted successfully and 404 there was no index to delete
    expect(response.status).to.be.oneOf([200, 404]);
  });
});
