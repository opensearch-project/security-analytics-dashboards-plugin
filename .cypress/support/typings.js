/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

Cypress.Commands.add(
  'ospSearch',
  {
    prevSubject: true,
  },
  (subject, text) => {
    return cy.get(subject).clear().ospType(text).type('{enter}');
  }
);

Cypress.Commands.add(
  'ospClear',
  {
    prevSubject: true,
  },
  (subject) => {
    return cy
      .get(subject)
      .wait(100)
      .type('{selectall}{backspace}')
      .clear({ force: true })
      .invoke('val', '');
  }
);

Cypress.Commands.add(
  'ospType',
  {
    prevSubject: true,
  },
  (subject, text) => {
    return cy.get(subject).wait(10).focus().type(text);
  }
);

Cypress.Commands.add(
  'pressEnterKey',
  {
    prevSubject: true,
  },
  (subject) => {
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

    return subject;
  }
);
