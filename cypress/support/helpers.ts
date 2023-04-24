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

export const getRadioButtonById = (id: string) => cy.get(`input[id="${id}"]`);

export const selectComboboxItem = (combo: any, items: string | string[]) => {
  combo
    .focus()
    .click({ force: true })
    .then(() => {
      if (typeof items === 'string') {
        items = [items];
      }
      items.map((item) =>
        cy.get('.euiComboBoxOptionsList__rowWrap').find('button').contains(item).click()
      );
    });
};

export const clearCombobox = (combo: any) =>
  combo.parentsUntil('.euiComboBox__inputWrap').siblings().find('button').eq(0).click();

export const validateDetailsItem = (label: string, value: string) => {
  getElementByText('.euiFlexItem label', label).parent().siblings().contains(value);
};

export const urlShouldContain = (path: string) => cy.url().should('contain', `#/${path}`);

export const pressEnterKey = () =>
  Cypress.automation('remote:debugger:protocol', {
    command: 'Input.dispatchKeyEvent',
    params: {
      type: 'char',
      unmodifiedText: '\r',
      text: '\r',
    },
  });

export const validateTable = (
  container: any, // jqueryElement
  length: number,
  dataMap: { [key: string]: string }
) => {
  cy.get(container)
    .should('be.visible')
    .find('table tbody')
    .find('tr')
    .should('have.length', length)
    .within(($tr: any) => {
      if (dataMap) {
        for (let logField in dataMap) {
          cy.get($tr).find('td').contains(logField);
          cy.get($tr).find('td').contains(dataMap[logField]);
        }
      }
    });
};
