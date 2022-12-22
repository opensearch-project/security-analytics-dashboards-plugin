/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

const { NODE_API, OPENSEARCH_DASHBOARDS, OPENSEARCH_DASHBOARDS_URL } = require('./constants');
// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

Cypress.Commands.overwrite('visit', (originalFn, url, options) => {
  // Add the basic auth header when security enabled in the Opensearch cluster
  // https://github.com/cypress-io/cypress/issues/1288
  if (Cypress.env('security_enabled')) {
    const ADMIN_AUTH = {
      username: Cypress.env('username'),
      password: Cypress.env('password'),
    };
    if (options) {
      options.auth = ADMIN_AUTH;
    } else {
      options = { auth: ADMIN_AUTH };
    }
    // Add query parameters - select the default OSD tenant
    options.qs = { security_tenant: 'private' };
    return originalFn(url, options);
  } else {
    return originalFn(url, options);
  }
});

// Be able to add default options to cy.request(), https://github.com/cypress-io/cypress/issues/726
Cypress.Commands.overwrite('request', (originalFn, ...args) => {
  let defaults = {};
  // Add the basic authentication header when security enabled in the Opensearch cluster
  const ADMIN_AUTH = {
    username: Cypress.env('username'),
    password: Cypress.env('password'),
  };
  if (Cypress.env('security_enabled')) {
    defaults.auth = ADMIN_AUTH;
  }

  let options = {};
  if (typeof args[0] === 'object' && args[0] !== null) {
    options = Object.assign({}, args[0]);
  } else if (args.length === 1) {
    [options.url] = args;
  } else if (args.length === 2) {
    [options.method, options.url] = args;
  } else if (args.length === 3) {
    [options.method, options.url, options.body] = args;
  }

  Object.assign(options, {
    headers: {
      'osd-xsrf': '',
    },
  });

  return originalFn(Object.assign({}, defaults, options));
});

Cypress.Commands.add('cleanUpTests', () => {
  cy.deleteAllCustomRules();
  cy.deleteAllDetectors();
  cy.deleteAllIndices();
});

Cypress.Commands.add('getTableFirstRow', (selector) => {
  if (!selector) return cy.get('tbody > tr').first();
  return cy.get('tbody > tr:first').find(selector);
});

Cypress.Commands.add('triggerSearchField', (placeholder, text) => {
  cy.get(`[placeholder="${placeholder}"]`).type(`{selectall}${text}`).trigger('search');
});

Cypress.Commands.add('waitForPageLoad', (url, { timeout = 10000, contains = null }) => {
  const fullUrl = `${OPENSEARCH_DASHBOARDS_URL}/${url}`;
  Cypress.log({
    message: `Wait for url: ${fullUrl} to be loaded.`,
  });
  cy.url({ timeout: timeout })
    .should('include', fullUrl)
    .then(() => {
      contains && cy.contains(contains);
    });
});

Cypress.Commands.add('deleteAllIndices', () => {
  cy.request({
    method: 'DELETE',
    url: `${Cypress.env('opensearch')}/index*,sample*,opensearch_dashboards*,test*,cypress*`,
    failOnStatusCode: false,
  });
});

Cypress.Commands.add('deleteAllDetectors', () => {
  cy.request({
    method: 'DELETE',
    url: `${Cypress.env('opensearch')}/.opensearch-sap-detectors-config`,
    failOnStatusCode: false,
  });
});

Cypress.Commands.add('createDetector', (detectorJSON) => {
  cy.request('POST', `${Cypress.env('opensearch')}${NODE_API.DETECTORS_BASE}`, detectorJSON);
});

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

Cypress.Commands.add('deleteIndex', (indexName, options = {}) => {
  cy.request({
    method: 'DELETE',
    url: `${Cypress.env('opensearch')}/${indexName}`,
    failOnStatusCode: false,
    ...options,
  });
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

Cypress.Commands.add('createIndex', (index, settings = {}) => {
  cy.request('PUT', `${Cypress.env('opensearch')}/${index}`, settings);
});

Cypress.Commands.add('ingestDocument', (indexId, documentJSON) => {
  cy.request('POST', `${Cypress.env('opensearch')}/${indexId}/_doc`, documentJSON);
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

Cypress.Commands.add('createIndex', (index, settings = {}) => {
  cy.request('PUT', `${Cypress.env('opensearch')}/${index}`, settings);
});

Cypress.Commands.add('createIndexTemplate', (name, template) => {
  cy.request(
    'PUT',
    `${Cypress.env('opensearch')}${NODE_API.INDEX_TEMPLATE_BASE}/${name}`,
    template
  );
});

Cypress.Commands.add('insertDocumentToIndex', (indexName, documentId, documentBody) => {
  cy.request({
    method: 'POST',
    url: `${Cypress.env('opensearch')}/${indexName}/_doc/${documentId}`,
    body: documentBody,
  });
});
