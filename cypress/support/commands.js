/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

const { ADMIN_AUTH, INDICES, NODE_API, PLUGIN_NAME } = require('./constants');

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

  return originalFn(Object.assign({}, defaults, options));
});

Cypress.Commands.add('deleteAllIndices', () => {
  cy.request('DELETE', `${Cypress.env('opensearch')}/index*,sample*,opensearch_dashboards*,test*`);
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

Cypress.Commands.add('createRule', (ruleJSON) => {
  cy.request('POST', `${Cypress.env('opensearch')}${NODE_API.RULES_BASE}`, ruleJSON);
});

Cypress.Commands.add('updateRule', (ruleId, ruleJSON) => {
  cy.request('PUT', `${Cypress.env('opensearch')}/${NODE_API.RULES_BASE}/${ruleId}`, ruleJSON);
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
