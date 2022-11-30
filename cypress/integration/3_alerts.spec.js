/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import moment from 'moment';
import {
  PLUGIN_NAME,
  NINETY_SECONDS,
  TWENTY_SECONDS_TIMEOUT,
  FEATURE_SYSTEM_INDICES,
} from '../support/constants';
import sample_index_settings from '../fixtures/sample_index_settings.json';
import sample_alias_mappings from '../fixtures/sample_alias_mappings.json';
import sample_detector from '../fixtures/sample_detector.json';
import sample_document from '../fixtures/sample_document.json';

const testIndex = 'sample_alerts_spec_cypress_test_index';
const testDetectorName = 'alerts_spec_cypress_test_detector';
const testDetectorAlertCondition = `${testDetectorName} alert condition`;

// Creating a unique detector JSON for this test spec
const testDetector = {
  ...sample_detector,
  name: testDetectorName,
  inputs: [
    {
      detector_input: {
        ...sample_detector.inputs[0].detector_input,
        description: `Description for ${testDetectorName}`,
        indices: [testIndex],
      },
    },
  ],
  triggers: [
    {
      ...sample_detector.triggers[0],
      name: testDetectorAlertCondition,
    },
  ],
};

// The exact minutes/seconds for the start and last updated time will be difficult to predict,
// but all of the alert time fields should all contain the date in this format.
const date = moment(moment.now()).format('MM/DD/YY');

describe('Alerts', () => {
  before(() => {
    // Delete any pre-existing test detectors
    cy.deleteDetector(testDetectorName)

      // Delete any pre-existing test indices
      .then(() => cy.deleteIndex(testIndex))

      // Delete any pre-existing windows alerts and findings
      .then(() => {
        cy.deleteIndex(FEATURE_SYSTEM_INDICES.WINDOWS_ALERTS_INDEX);
        cy.deleteIndex(FEATURE_SYSTEM_INDICES.WINDOWS_FINDINGS_INDEX);
      })

      // Create test index
      .then(() => cy.createIndex(testIndex, sample_index_settings))

      // Create field mappings
      .then(() =>
        cy.createAliasMappings(testIndex, testDetector.detector_type, sample_alias_mappings, true)
      )

      // Create test detector
      .then(() => cy.createDetector(testDetector))

      .then(() => {
        // Go to the detectors table page
        cy.visit(`${Cypress.env('opensearch_dashboards')}/app/${PLUGIN_NAME}#/detectors`);

        // Filter table to only show the test detector
        cy.get(`input[type="search"]`, TWENTY_SECONDS_TIMEOUT).type(`${testDetector.name}{enter}`);

        // Confirm detector was created
        cy.get('tbody > tr', TWENTY_SECONDS_TIMEOUT).should(($tr) => {
          expect($tr, '1 row').to.have.length(1);
          expect($tr, 'detector name').to.contain(testDetector.name);
        });
      });
  });

  beforeEach(() => {
    // Visit Alerts table page
    cy.visit(`${Cypress.env('opensearch_dashboards')}/app/${PLUGIN_NAME}#/alerts`);

    // Filter table to only show alerts for the test detector
    cy.get(`input[type="search"]`, TWENTY_SECONDS_TIMEOUT).type(`${testDetector.name}{enter}`);

    // Adjust the date range picker to display alerts from today
    cy.get('[class="euiButtonEmpty__text euiQuickSelectPopover__buttonText"]').click({
      force: true,
    });
    cy.get('[data-test-subj="superDatePickerCommonlyUsed_Today"]').click({ force: true });
  });

  it('are generated', () => {
    // Ingest documents to the test index
    const docCount = 4;
    for (let i = 0; i < docCount; i++) {
      cy.insertDocumentToIndex(testIndex, '', sample_document);
    }

    // Wait for the detector to execute
    cy.wait(NINETY_SECONDS);

    // Refresh the table
    cy.get('[data-test-subj="superDatePickerApplyTimeButton"]').click({ force: true });

    // Confirm the table contains 1 row
    cy.get('tbody > tr', TWENTY_SECONDS_TIMEOUT).should(($tr) =>
      expect($tr, `${docCount} rows`).to.have.length(docCount)
    );
  });

  it('contain expected values in table', () => {
    // Confirm each row contains the expected values
    cy.get('tbody > tr', TWENTY_SECONDS_TIMEOUT).each(($el, $index) => {
      expect($el, `row number ${$index} start time`).to.contain(date);
      expect($el, `row number ${$index} trigger name`).to.contain(testDetector.triggers[0].name);
      expect($el, `row number ${$index} detector name`).to.contain(testDetector.name);
      expect($el, `row number ${$index} status`).to.contain('Active');
      expect($el, `row number ${$index} severity`).to.contain('4 (Low)');
    });
  });

  it('contain expected values in alert details flyout', () => {
    cy.get('tbody > tr', TWENTY_SECONDS_TIMEOUT)
      .first()
      .within(() => {
        // Click the "View details" button for the first alert
        cy.get('[aria-label="View details"]').click({ force: true });
      });

    // Get the details flyout, and validate its content
    cy.get('[data-test-subj="alert-details-flyout"]').within(() => {
      // Confirm alert condition name
      cy.get('[data-test-subj="text-details-group-content-alert-trigger-name"]').contains(
        testDetector.triggers[0].name
      );

      // Confirm alert status
      cy.get('[data-test-subj="text-details-group-content-alert-status"]').contains('Active');

      // Confirm alert severity
      cy.get('[data-test-subj="text-details-group-content-alert-severity"]').contains('4 (Low)');

      // Confirm alert start time is present
      cy.get('[data-test-subj="text-details-group-content-start-time"]').contains(date);

      // Confirm alert last updated time is present
      cy.get('[data-test-subj="text-details-group-content-last-updated-time"]').contains(date);

      // Confirm alert detector name
      cy.get('[data-test-subj="text-details-group-content-detector"]').contains(testDetector.name);

      // Wait for the findings table to finish loading
      cy.contains('Findings (4)', TWENTY_SECONDS_TIMEOUT);
      cy.contains('USB Device Plugged', TWENTY_SECONDS_TIMEOUT);

      // Confirm alert findings contain expected values
      cy.get('tbody > tr', TWENTY_SECONDS_TIMEOUT)
        .should(($tr) => expect($tr, '4 rows').to.have.length(4))
        .each(($el, $index) => {
          expect($el, `row number ${$index} timestamp`).to.contain(date);
          expect($el, `row number ${$index} rule name`).to.contain('USB Device Plugged');
          expect($el, `row number ${$index} detector name`).to.contain(testDetector.name);
          expect($el, `row number ${$index} log type`).to.contain('Windows');
        });

      // Close the flyout
      cy.get('[data-test-subj="alert-details-flyout-close-button"]').click({ force: true });
    });

    // Confirm flyout has been closed
    cy.contains('[data-test-subj="alert-details-flyout"]').should('not.exist');
  });

  it('contain expected values in finding details flyout', () => {
    // Open first alert details flyout
    cy.get('tbody > tr', TWENTY_SECONDS_TIMEOUT)
      .first()
      .within(() => {
        // Click the "View details" button for the first alert
        cy.get('[aria-label="View details"]').click({ force: true });
      });

    cy.get('[data-test-subj="alert-details-flyout"]', TWENTY_SECONDS_TIMEOUT).within(() => {
      // Wait for findings table to finish loading
      cy.contains('USB Device Plugged', TWENTY_SECONDS_TIMEOUT);

      // Click the details button for the first finding
      cy.get('tbody > tr', TWENTY_SECONDS_TIMEOUT)
        .first()
        .within(() => {
          cy.get('[data-test-subj="finding-details-flyout-button"]', TWENTY_SECONDS_TIMEOUT).click({
            force: true,
          });
        });
    });

    // Confirm the details flyout contains the expected content
    cy.get('[data-test-subj="finding-details-flyout"]').within(() => {
      // Confirm finding ID is present
      cy.get('[data-test-subj="finding-details-flyout-finding-id"]')
        .invoke('text')
        .then((text) => expect(text).to.have.length.greaterThan(1));

      // Confirm finding timestamp
      cy.get('[data-test-subj="finding-details-flyout-timestamp"]').contains(date);

      // Confirm finding detector name
      cy.get('[data-test-subj="finding-details-flyout-detector-link"]').contains(testDetector.name);

      // Confirm there's only 1 rule details accordion
      cy.get('[data-test-subj="finding-details-flyout-rule-accordion-1"]').should('not.exist');

      // Check the rule details accordion for the expected values
      cy.get('[data-test-subj="finding-details-flyout-rule-accordion-0"]').within(() => {
        // Confirm the accordion button contains the expected text
        cy.get('[data-test-subj="finding-details-flyout-rule-accordion-button"]').contains(
          'USB Device Plugged'
        );
        cy.get('[data-test-subj="finding-details-flyout-rule-accordion-button"]').contains(
          'Severity: Low'
        );

        // Confirm the rule name
        cy.get('[data-test-subj="finding-details-flyout-USB Device Plugged-details"]').contains(
          'USB Device Plugged'
        );

        // Confirm the rule severity
        cy.get('[data-test-subj="finding-details-flyout-rule-severity"]').contains('Low');

        // Confirm the rule category
        cy.get('[data-test-subj="finding-details-flyout-rule-category"]').contains('Windows');

        // Confirm the rule description
        cy.get('[data-test-subj="finding-details-flyout-rule-description"]').contains(
          'Detects plugged USB devices'
        );

        // Confirm the rule tags
        ['low', 'windows', 'attack.initial_access', 'attack.t1200'].forEach((tag) => {
          cy.get('[data-test-subj="finding-details-flyout-rule-tags"]').contains(tag);
        });

        // Confirm the rule document ID is present
        cy.get('[data-test-subj="finding-details-flyout-rule-document-id"]')
          .invoke('text')
          .then((text) => expect(text).to.not.equal('-'));

        // Confirm the rule index
        cy.get('[data-test-subj="finding-details-flyout-rule-document-index"]').contains(testIndex);

        // Confirm the rule document matches
        // The EuiCodeEditor used for this component stores each line of the JSON in an array of elements;
        // so this test formats the expected document into an array of strings,
        // and matches each entry with the corresponding element line.
        const document = JSON.stringify(
          [
            {
              index: 'sample_alerts_spec_cypress_test_index',
              id: '',
              found: true,
              document:
                '{"EventTime":"2020-02-04T14:59:39.343541+00:00","HostName":"EC2AMAZ-EPO7HKA","Keywords":"9223372036854775808","SeverityValue":2,"Severity":"INFO","EventID":2003,"SourceName":"Microsoft-Windows-Sysmon","ProviderGuid":"{5770385F-C22A-43E0-BF4C-06F5698FFBD9}","Version":5,"TaskValue":22,"OpcodeValue":0,"RecordNumber":9532,"ExecutionProcessID":1996,"ExecutionThreadID":2616,"Channel":"Microsoft-Windows-Sysmon/Operational","Domain":"NT AUTHORITY","AccountName":"SYSTEM","UserID":"S-1-5-18","AccountType":"User","Message":"Dns query:\\r\\nRuleName: \\r\\nUtcTime: 2020-02-04 14:59:38.349\\r\\nProcessGuid: {b3c285a4-3cda-5dc0-0000-001077270b00}\\r\\nProcessId: 1904\\r\\nQueryName: EC2AMAZ-EPO7HKA\\r\\nQueryStatus: 0\\r\\nQueryResults: 172.31.46.38;\\r\\nImage: C:\\\\Program Files\\\\nxlog\\\\nxlog.exe","Category":"Dns query (rule: DnsQuery)","Opcode":"Info","UtcTime":"2020-02-04 14:59:38.349","ProcessGuid":"{b3c285a4-3cda-5dc0-0000-001077270b00}","ProcessId":"1904","QueryName":"EC2AMAZ-EPO7HKA","QueryStatus":"0","QueryResults":"172.31.46.38;","Image":"C:\\\\Program Files\\\\nxlog\\\\regsvr32.exe","EventReceivedTime":"2020-02-04T14:59:40.780905+00:00","SourceModuleName":"in","SourceModuleType":"im_msvistalog","CommandLine":"eachtest","Initiated":"true","Provider_Name":"Microsoft-Windows-Kernel-General","TargetObject":"\\\\SOFTWARE\\\\Microsoft\\\\Office\\\\Outlook\\\\Security","EventType":"SetValue"}',
            },
          ],
          null,
          4
        );
        const documentLines = document.split('\n');
        cy.get('[data-test-subj="finding-details-flyout-rule-document"]')
          .get('[class="euiCodeBlock__line"]')
          .each((lineElement, lineIndex) => {
            let line = lineElement.text();
            let expectedLine = documentLines[lineIndex];

            // The document ID field is generated when the document is added to the index,
            // so this test just checks that the line starts with the ID key.
            if (expectedLine.trimStart().startsWith('"id": "')) {
              expectedLine = '"id": "';
              expect(line, `document JSON line ${lineIndex}`).to.contain(expectedLine);
            } else {
              line = line.replaceAll('\n', '');
              expect(line, `document JSON line ${lineIndex}`).to.equal(expectedLine);
            }
          });
      });

      // Press the "back" button
      cy.get(
        '[data-test-subj="finding-details-flyout-back-button"]',
        TWENTY_SECONDS_TIMEOUT
      ).click({ force: true });
    });

    // Confirm finding details flyout closed
    cy.get('[data-test-subj="finding-details-flyout"]').should('not.exist');

    // Confirm the expected alert details flyout rendered
    cy.get('[data-test-subj="alert-details-flyout"]', TWENTY_SECONDS_TIMEOUT).within(() => {
      cy.get('[data-test-subj="text-details-group-content-alert-trigger-name"]').contains(
        testDetector.triggers[0].name
      );
    });
  });

  it('can be bulk acknowledged', () => {
    // Confirm the "Acknowledge" button is disabled when no alerts are selected
    cy.get('[data-test-subj="acknowledge-button"]').should('be.disabled');

    // Confirm all 4 alerts are currently "Active"
    cy.get('tbody > tr', TWENTY_SECONDS_TIMEOUT)
      .should(($tr) => expect($tr, '4 rows').to.have.length(4))
      .each(($el, $index) => {
        expect($el, `row number ${$index} status`).to.contain('Active');
      });

    // Click the checkboxes for the first and last alerts.
    cy.get('tbody > tr', TWENTY_SECONDS_TIMEOUT)
      .first()
      .within(() => {
        cy.get('[class="euiCheckbox__input"]').click({ force: true });
      });
    cy.get('tbody > tr', TWENTY_SECONDS_TIMEOUT)
      .last()
      .within(() => {
        cy.get('[class="euiCheckbox__input"]').click({ force: true });
      });

    // Press the "Acknowledge" button
    cy.get('[data-test-subj="acknowledge-button"]').click({ force: true });

    // Wait for acknowledge API to finish executing
    cy.contains('Acknowledged', TWENTY_SECONDS_TIMEOUT);

    // Filter the table to show only "Acknowledged" alerts
    cy.get('[data-text="Status"]').click({ force: true });
    cy.get('[class="euiFilterSelect__items"]').within(() => {
      cy.contains('Acknowledged').click({ force: true });
    });

    // Confirm there are now 2 "Acknowledged" alerts
    cy.get('tbody > tr', TWENTY_SECONDS_TIMEOUT)
      .should(($tr) => expect($tr, '2 rows').to.have.length(2))
      .each(($el, $index) => {
        expect($el, `row number ${$index} status`).to.contain('Acknowledged');
      });

    // Filter the table to show only "Active" alerts
    cy.get('[data-text="Status"]');
    cy.get('[class="euiFilterSelect__items"]').within(() => {
      cy.contains('Acknowledged').click({ force: true });
      cy.contains('Active').click({ force: true });
    });

    // Confirm there are now 2 "Acknowledged" alerts
    cy.get('tbody > tr', TWENTY_SECONDS_TIMEOUT)
      .should(($tr) => expect($tr, '2 rows').to.have.length(2))
      .each(($el, $index) => {
        expect($el, `row number ${$index} status`).to.contain('Active');
      });
  });

  it('can be acknowledged via row button', () => {
    // Filter the table to show only "Active" alerts
    cy.get('[data-text="Status"]').click({ force: true });
    cy.get('[class="euiFilterSelect__items"]').within(() => {
      cy.contains('Active').click({ force: true });
    });

    // Confirm there are 2 "Active" alerts
    cy.get('tbody > tr', TWENTY_SECONDS_TIMEOUT)
      .should(($tr) => expect($tr, '2 rows').to.have.length(2))
      // Click the "Acknowledge" icon button in the first row
      .first()
      .within(() => {
        cy.get('[aria-label="Acknowledge"]').click({ force: true });
      });

    // Confirm there is 1 "Active" alert
    cy.get('tbody > tr', TWENTY_SECONDS_TIMEOUT).should(($tr) =>
      expect($tr, '1 row').to.have.length(1)
    );

    // Filter the table to show only "Acknowledged" alerts
    cy.get('[data-text="Status"]');
    cy.get('[class="euiFilterSelect__items"]').within(() => {
      cy.contains('Active').click({ force: true });
      cy.contains('Acknowledged').click({ force: true });
    });

    // Confirm there are now 3 "Acknowledged" alerts
    cy.get('tbody > tr', TWENTY_SECONDS_TIMEOUT).should(($tr) =>
      expect($tr, '3 rows').to.have.length(3)
    );
  });

  it('can be acknowledged via flyout button', () => {
    // Filter the table to show only "Active" alerts
    cy.get('[data-text="Status"]').click({ force: true });
    cy.get('[class="euiFilterSelect__items"]').within(() => {
      cy.contains('Active').click({ force: true });
    });

    cy.get('tbody > tr', TWENTY_SECONDS_TIMEOUT)
      .first()
      .within(() => {
        // Click the "View details" button for the first alert
        cy.get('[aria-label="View details"]').click({ force: true });
      });

    cy.get('[data-test-subj="alert-details-flyout"]').within(() => {
      // Confirm the alert is currently "Active"
      cy.get('[data-test-subj="text-details-group-content-alert-status"]').contains('Active');

      // Click the "Acknowledge" button on the flyout
      cy.get('[data-test-subj="alert-details-flyout-acknowledge-button"]').click({ force: true });

      // Confirm the alert is now "Acknowledged"
      cy.get(
        '[data-test-subj="text-details-group-content-alert-status"]',
        TWENTY_SECONDS_TIMEOUT
      ).contains('Active');

      // Confirm the "Acknowledge" button is disabled
      cy.get('[data-test-subj="alert-details-flyout-acknowledge-button"]').should('be.disabled');
    });
  });

  it('detector name hyperlink on finding details flyout redirects to the detector details page', () => {
    // Open first alert details flyout
    cy.get('tbody > tr', TWENTY_SECONDS_TIMEOUT)
      .first()
      .within(() => {
        // Click the "View details" button for the first alert
        cy.get('[aria-label="View details"]').click({ force: true });
      });

    cy.get('[data-test-subj="alert-details-flyout"]', TWENTY_SECONDS_TIMEOUT).within(() => {
      // Wait for findings table to finish loading
      cy.contains('USB Device Plugged', TWENTY_SECONDS_TIMEOUT);

      // Click the details button for the first finding
      cy.get('tbody > tr', TWENTY_SECONDS_TIMEOUT)
        .first()
        .within(() => {
          cy.get('[data-test-subj="finding-details-flyout-button"]', TWENTY_SECONDS_TIMEOUT).click({
            force: true,
          });
        });
    });

    cy.get('[data-test-subj="finding-details-flyout"]').within(() => {
      // Click the detector name hyperlink
      cy.get('[data-test-subj="finding-details-flyout-detector-link"]')
        // Removing the "target" attribute so the link won't open a new tab. Cypress wouldn't test the new tab.
        .invoke('removeAttr', 'target')
        .click({ force: true });
    });

    // Confirm the detector details page is for the expected detector
    cy.get('[data-test-subj="detector-details-detector-name"]', TWENTY_SECONDS_TIMEOUT).contains(
      testDetector.name,
      TWENTY_SECONDS_TIMEOUT
    );
  });

  after(() => {
    // Clean up test resources
    cy.deleteDetector(testDetectorName);
    cy.deleteIndex(FEATURE_SYSTEM_INDICES.WINDOWS_ALERTS_INDEX);
    cy.deleteIndex(FEATURE_SYSTEM_INDICES.WINDOWS_FINDINGS_INDEX);
    cy.deleteIndex(testIndex);
  });
});
