/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

const { OPENSEARCH_DASHBOARDS, NODE_API } = require('./constants');

Cypress.Commands.add('createRule', (ruleJSON) => {
  return cy.request({
    method: 'POST',
    url: `${OPENSEARCH_DASHBOARDS}${NODE_API.RULES_BASE}?category=${ruleJSON.category}`,
    body: JSON.stringify(ruleJSON),
  });
});

Cypress.Commands.add('updateRule', (ruleId, ruleJSON) => {
  cy.request('PUT', `${Cypress.env('opensearch')}/${NODE_API.RULES_BASE}/${ruleId}`, ruleJSON);
});

Cypress.Commands.add('deleteRule', (ruleName) => {
  const body = {
    from: 0,
    size: 5000,
    query: {
      nested: {
        path: 'rule',
        query: {
          bool: {
            must: [{ match: { 'rule.title': 'Cypress test rule' } }],
          },
        },
      },
    },
  };
  cy.request({
    method: 'POST',
    url: `${Cypress.env('opensearch')}${NODE_API.RULES_BASE}/_search?pre_packaged=false`,
    failOnStatusCode: false,
    body,
  }).then((response) => {
    if (response.status === 200) {
      for (let hit of response.body.hits.hits) {
        if (hit._source.title === ruleName)
          cy.request(
            'DELETE',
            `${Cypress.env('opensearch')}${NODE_API.RULES_BASE}/${hit._id}?forced=true`
          );
      }
    }
  });
});

Cypress.Commands.add('deleteAllCustomRules', () => {
  cy.request({
    method: 'DELETE',
    url: `${Cypress.env('opensearch')}/.opensearch-sap-custom-rules-config`,
    failOnStatusCode: false,
    body: { query: { match_all: {} } },
  });
});
