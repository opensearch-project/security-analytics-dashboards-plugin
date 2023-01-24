/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

// eslint-disable-next-line
///<reference types="cypress" />

declare namespace Cypress {
  interface Chainable<Subject> {
    /**
     * Removes custom indices, detectors and rules
     * @example
     * cy.cleanUpTests()
     */
    cleanUpTests(): Chainable<any>;

    /**
     * Returns table first row
     * Finds elements deeper in a row with selector
     * @param {string} selector
     * @example
     * cy.getTableFirstRow()
     * cy.getTableFirstRow('td')
     */
    getTableFirstRow(selector: string): Chainable<any>;

    /**
     * Waits for page to be loaded
     * @param {string} pathname
     * @param {any} opts
     * @example
     * cy.waitForPageLoad('detectors')
     * cy.waitForPageLoad('detectors', {
     *   timeout: 20000,
     *   contains: 'text to verify'
     * })
     */
    waitForPageLoad(pathname: string, opts?: any): Chainable<any>;

    /**
     * Returns table first row
     * Can find elements deeper in a row with selector
     * @param {string} text
     * @example
     * cy.get('selector').ospSearch('Txt to write into input')
     */
    ospSearch(text: string): Chainable<any>;

    /**
     * Clears input text
     * @example
     * cy.get('selector').ospClear()
     */
    ospClear(): Chainable<any>;

    /**
     * Returns table first row
     * Can find elements deeper in a row with selector
     * @param {string} text
     * @example
     * cy.get('selector').ospType('Txt to write into input')
     */
    ospType(text: string): Chainable<any>;

    /**
     * Creates index with policy
     * @example
     * cy.createIndex("some_index", "some_policy")
     */
    createIndex(index: string, settings?: object): Chainable<any>;

    /**
     * Creates an index template.
     * @example
     * cy.createIndexTemplate("some_index_template", { "index_patterns": "abc", "properties": { ... } })
     */
    createIndexTemplate(name: string, template: object): Chainable<any>;

    /**
    /**
     * Deletes all indices in cluster
     * @example
     * cy.deleteAllIndices()
     */
    deleteAllIndices(): Chainable<any>;

    /**
     * Deletes all custom rules in cluster
     * @example
     * cy.deleteAllCustomRules()
     */
    deleteAllCustomRules(): Chainable<any>;

    /**
     * Deletes all detectors in cluster
     * @example
     * cy.deleteAllDetectors()
     */
    deleteAllDetectors(): Chainable<any>;

    /**
     * Creates a detector
     * @example
     * cy.createPolicy({ "detector_type": ... })
     */
    createDetector(detectorJSON: object): Chainable<any>;

    /**
     * Creates a fields mapping aliases for detector
     * @example
     * cy.createAliasMappings('indexName', 'windows', {...}, true)
     */
    createAliasMappings(
      indexName: string,
      ruleTopic: string,
      aliasMappingsBody: object,
      partial: boolean
    ): Chainable<any>;

    /**
     * Creates a custom rule
     * @example
     * cy.createRule({})
     */
    createRule(ruleJSON: object): Chainable<any>;

    /**
     * Updates settings for index
     * @example
     * cy.updateIndexSettings("some_index", settings)
     */
    updateDetector(detectorId: string, detectorJSON: object): Chainable<any>;

    /**
     * Deletes detector by its name
     * @example
     * cy.deleteDetector("Cypress detector name")
     */
    deleteDetector(name: string): Chainable<any>;
  }
}
