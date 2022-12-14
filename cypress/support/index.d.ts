/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable<Subject> {
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
     * Deletes detector by its name
     * @example
     * cy.deleteDetector("Cypress detector name")
     */
    deleteDetector(name: string): Chainable<any>;
  }
}
