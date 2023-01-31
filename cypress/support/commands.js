/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

const { OPENSEARCH_DASHBOARDS_URL } = require('./constants');
require('./detectors');
require('./rules');
require('./indexes');
require('./typings');

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

Cypress.Commands.add('waitForPageLoad', (pathname, { timeout = 60000, contains = null }) => {
  const fullUrl = `${OPENSEARCH_DASHBOARDS_URL}/${pathname}`;
  Cypress.log({
    message: `Wait for url: ${fullUrl} to be loaded.`,
  });
  cy.url({ timeout: timeout })
    .should('include', fullUrl)
    .then(() => {
      contains && cy.contains(contains).should('be.visible');
    });
});
